import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { errorHandler, ValidationError, RateLimitError } from '@/lib/error-handler';
import { rateLimiter } from '@/lib/security';
import { validateField } from '@/lib/validation';

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 15;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = request.ip || 'unknown';
  
  try {
    logger.info('Code commenting request started', { clientIP });

    // Rate limiting
    if (!rateLimiter.isAllowed(clientIP, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
      throw new RateLimitError('Too many commenting requests. Please wait before trying again.');
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON in request body');
    }

    const { code } = requestBody;

    // Validate required fields
    const codeValidation = validateField(code, { required: true, minLength: 5, maxLength: 20000 });
    if (codeValidation) {
      throw new ValidationError(`Code validation failed: ${codeValidation}`);
    }

    // Validate API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      logger.error('OpenRouter API key not configured');
      throw new Error('AI service configuration error');
    }

    // Detect programming language from code
    const language = detectLanguage(code);
    
    // Prepare AI request
    const aiRequestBody = {
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [
        {
          role: 'system',
          content: `You are an expert ${language} developer and code reviewer. Add clear, helpful comments to the following code, explaining:

1. Function purposes and parameters
2. Complex logic and algorithms
3. Important variables and their roles
4. Error handling and edge cases
5. Performance considerations
6. Security implications (if any)

Guidelines:
- Use appropriate comment syntax for ${language}
- Keep comments concise but informative
- Explain WHY, not just WHAT
- Add comments for non-obvious code sections
- Include docstrings for functions/classes where appropriate
- Maintain original code structure and formatting

Return the fully commented code in a code block with proper syntax highlighting.`
        },
        {
          role: 'user',
          content: `Please add comprehensive comments to this ${language} code:\n\n${code}`
        }
      ],
      max_tokens: 2048,
      temperature: 0.3, // Lower temperature for more consistent commenting
      top_p: 0.9,
    };

    logger.info('Making request to OpenRouter API for code commenting', { 
      model: aiRequestBody.model,
      language,
      codeLength: code.length 
    });

    // Make request to OpenRouter API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'LaunchBox.AI',
      },
      body: JSON.stringify(aiRequestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      logger.error('OpenRouter API error', new Error(errorText), {
        status: response.status,
        statusText: response.statusText
      });
      
      if (response.status === 429) {
        throw new RateLimitError('AI service rate limit exceeded. Please try again later.');
      } else if (response.status === 401) {
        throw new Error('AI service authentication failed');
      } else if (response.status >= 500) {
        throw new Error('AI service temporarily unavailable');
      } else {
        throw new Error(`AI service error: ${response.status}`);
      }
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      logger.error('No content in OpenRouter response', { data });
      throw new Error('AI service returned empty response');
    }

    const duration = Date.now() - startTime;
    logger.info('Code commenting request completed successfully', { 
      duration,
      language,
      contentLength: content.length,
      clientIP 
    });

    return NextResponse.json({ 
      response: content,
      metadata: {
        duration,
        language,
        model: aiRequestBody.model,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof ValidationError || error instanceof RateLimitError) {
      logger.warn('Code commenting request validation/rate limit error', { 
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
      logger.error('Code commenting request timeout', error, { duration, clientIP });
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
    logger.error('Code commenting request failed', error as Error, { 
      duration,
      clientIP 
    });

    return NextResponse.json(
      { 
        error: 'Failed to comment code. Please try again later.',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Helper function to detect programming language
function detectLanguage(code: string): string {
  const trimmedCode = code.trim().toLowerCase();
  
  // Check for specific patterns
  if (trimmedCode.includes('def ') || trimmedCode.includes('import ') || trimmedCode.includes('from ')) {
    return 'Python';
  }
  if (trimmedCode.includes('function ') || trimmedCode.includes('const ') || trimmedCode.includes('let ')) {
    return 'JavaScript';
  }
  if (trimmedCode.includes('interface ') || trimmedCode.includes('type ') || trimmedCode.includes(': string')) {
    return 'TypeScript';
  }
  if (trimmedCode.includes('public class ') || trimmedCode.includes('private ') || trimmedCode.includes('System.out')) {
    return 'Java';
  }
  if (trimmedCode.includes('#include') || trimmedCode.includes('int main') || trimmedCode.includes('std::')) {
    return 'C++';
  }
  if (trimmedCode.includes('<?php') || trimmedCode.includes('$')) {
    return 'PHP';
  }
  if (trimmedCode.includes('fn ') || trimmedCode.includes('let mut') || trimmedCode.includes('println!')) {
    return 'Rust';
  }
  if (trimmedCode.includes('func ') || trimmedCode.includes('package ') || trimmedCode.includes('fmt.')) {
    return 'Go';
  }
  
  // Default fallback
  return 'code';
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