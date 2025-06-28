import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { errorHandler, ValidationError, RateLimitError } from '@/lib/error-handler';
import { rateLimiter } from '@/lib/security';
import { validateField } from '@/lib/validation';
import crypto from 'crypto';

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Simple in-memory cache for analysis results
const analysisCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Helper function to generate cache key
function generateCacheKey(code: string): string {
  return crypto.createHash('md5').update(code).digest('hex');
}

// Helper function to get cached result
function getCachedResult(code: string): string | null {
  const cacheKey = generateCacheKey(code);
  const cached = analysisCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.info('Using cached analysis result', { cacheKey });
    return cached.response;
  }
  
  if (cached) {
    analysisCache.delete(cacheKey); // Remove expired cache
  }
  
  return null;
}

// Helper function to cache result
function cacheResult(code: string, response: string): void {
  const cacheKey = generateCacheKey(code);
  analysisCache.set(cacheKey, { response, timestamp: Date.now() });
  logger.info('Cached analysis result', { cacheKey });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = request.ip || 'unknown';
  
  try {
    logger.info('Analysis request started', { clientIP });

    // Rate limiting
    if (!rateLimiter.isAllowed(clientIP, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
      throw new RateLimitError('Too many analysis requests. Please wait before trying again.');
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON in request body');
    }

    const { code, dockerfile, jenkinsfile } = requestBody;

    // Validate required fields
    const codeValidation = validateField(code, { required: true, minLength: 10, maxLength: 50000 });
    if (codeValidation) {
      throw new ValidationError(`Code validation failed: ${codeValidation}`);
    }

    // Validate API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      logger.error('OpenRouter API key not configured');
      throw new Error('AI service configuration error');
    }

    // Check cache
    const cachedResult = getCachedResult(code);
    if (cachedResult) {
      const duration = Date.now() - startTime;
      logger.info('Analysis completed successfully', { 
        duration,
        clientIP,
        responseLength: cachedResult.length 
      });
      return NextResponse.json({ response: cachedResult });
    }

    // Prepare AI request
    const aiRequestBody = {
      model: 'qwen/qwen3-30b-a3b:free',
      messages: [
        {
          role: 'system',
          content: `You are a senior DevOps engineer. Given the following project code, you must generate and return exactly three sections, each in a code block with a clear label:

1. Dockerfile: Return a complete, production-ready Dockerfile in a code block labeled 'dockerfile'. Add comments in the Dockerfile to explain each major step and why it is needed for this codebase.

2. Jenkinsfile: Return a complete Jenkinsfile for CI/CD in a code block labeled 'groovy'. Add comments in the Jenkinsfile to explain each pipeline stage and any important configuration.

3. Guide: Return a detailed, step-by-step DevOps guide in a code block labeled 'markdown'. Format the guide using markdown with headings, bold, and bullet points. Each step should be clear, actionable, and tailored to the codebase. The guide must include at least 5 steps, troubleshooting tips, and a summary. Example format:

\`\`\`markdown
# DevOps Setup Guide

## Step 1: ...
**Description:** ...
- ...

## Step 2: ...
**Description:** ...
- ...
...
\`\`\`

You must always return all three sections, even if you have to provide a basic or fallback version. The output must be strictly parseable and visually formatted for UI display. Tailor all content to the provided codebase and its technology stack.

Code to analyze:
\`\`\`
${code}
\`\`\`
`
        },
        {
          role: 'user',
          content: `Analyze this code and generate the three required sections as described above.`,
        }
      ],
      max_tokens: 4000,
      temperature: 0.2,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    };

    logger.info('Making request to OpenRouter API', { 
      model: aiRequestBody.model,
      codeLength: code.length 
    });

    // Make request to OpenRouter with retry logic
    let response;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`OpenRouter API request attempt ${attempt}/${maxRetries}`, { clientIP });
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'LaunchBox.AI'
          },
          body: JSON.stringify(aiRequestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          break; // Success, exit retry loop
        } else {
          const errorData = await response.json().catch(() => ({}));
          lastError = new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
          
          if (response.status === 429) {
            // Rate limited, wait before retry
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          } else if (response.status >= 500) {
            // Server error, wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          } else {
            // Client error, don't retry
            break;
          }
        }
      } catch (error) {
        lastError = error;
        
        if (error instanceof Error && error.name === 'AbortError') {
          logger.warn(`OpenRouter API timeout on attempt ${attempt}`, { clientIP });
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
        }
        
        if (attempt < maxRetries) {
          logger.warn(`OpenRouter API request failed on attempt ${attempt}`, { error: error.message, clientIP });
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    if (!response || !response.ok) {
      throw lastError || new Error('All OpenRouter API attempts failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Debug: Log the raw AI response content
    logger.debug('Raw AI response content', { content });

    if (!content) {
      logger.error('No content in OpenRouter response', { data });
      throw new Error('AI service returned empty response');
    }

    // Validate response structure
    const hasDockerfile = /```dockerfile|```docker|Dockerfile:|DOCKERFILE/i.test(content);
    const hasJenkinsfile = /```groovy|```jenkinsfile|Jenkinsfile:|JENKINSFILE/i.test(content);
    const hasGuide = /Guide:|GUIDE|DevOps Guide:/i.test(content);

    if (!hasDockerfile || !hasJenkinsfile || !hasGuide) {
      logger.warn('AI response missing required sections', { 
        hasDockerfile, 
        hasJenkinsfile, 
        hasGuide,
        contentLength: content.length 
      });
      
      // If response is incomplete, try one more time with a simpler prompt
      if (content.length < 500) {
        logger.info('Attempting retry with simplified prompt');
        const simplifiedPrompt = {
          ...aiRequestBody,
          messages: [
            {
              role: 'system',
              content: `Generate a Dockerfile, Jenkinsfile, and DevOps guide for this code. Use exact format:
1. \`\`\`dockerfile (your dockerfile here) \`\`\`
2. \`\`\`groovy (your jenkinsfile here) \`\`\`
3. Guide: (your guide here)

Code: ${code}`
            }
          ]
        };
        
        const retryResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'LaunchBox.AI'
          },
          body: JSON.stringify(simplifiedPrompt)
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          const retryContent = retryData.choices?.[0]?.message?.content;
          if (retryContent) {
            logger.info('Retry successful, using simplified response');
            return NextResponse.json({ response: retryContent });
          }
        }
      }
    }

    const duration = Date.now() - startTime;
    logger.info('Analysis completed successfully', { 
      duration,
      clientIP,
      responseLength: content.length 
    });

    // Cache result
    cacheResult(code, content);

    return NextResponse.json({ response: content });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof ValidationError || error instanceof RateLimitError) {
      logger.warn('Analysis request validation/rate limit error', { 
        error: error.message, 
        duration,
        clientIP 
      });
      
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          timestamp: new Date().toISOString()
        },
        { status: error.status }
      );
    }

    // Handle abort errors (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      logger.error('Analysis request timeout', error, { duration, clientIP });
      return NextResponse.json(
        { 
          error: 'Request timeout. Please try again with shorter code.',
          code: 'TIMEOUT_ERROR',
          timestamp: new Date().toISOString()
        },
        { status: 408 }
      );
    }

    // Log unexpected errors
    logger.error('Analysis request failed', error as Error, { 
      duration,
      clientIP 
    });

    return NextResponse.json(
      { 
        error: 'Failed to analyze project. Please try again later.',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}