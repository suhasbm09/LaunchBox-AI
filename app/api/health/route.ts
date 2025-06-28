import { NextResponse } from 'next/server';
import { checkConnection } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { getMemoryUsage } from '@/lib/performance';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const dbHealthy = await checkConnection();
    
    // Get system information
    const memoryUsage = getMemoryUsage();
    const uptime = process.uptime();
    const nodeVersion = process.version;
    const platform = process.platform;
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    const healthData = {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(uptime),
      responseTime,
      system: {
        nodeVersion,
        platform,
        memory: memoryUsage,
      },
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        api: 'healthy',
      },
      checks: {
        database: {
          status: dbHealthy ? 'pass' : 'fail',
          responseTime: responseTime,
        },
      },
    };
    
    logger.info('Health check completed', {
      status: healthData.status,
      responseTime,
      dbHealthy,
    });
    
    return NextResponse.json(healthData, {
      status: dbHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    logger.error('Health check failed', error as Error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        responseTime: Date.now() - startTime,
      },
      { status: 503 }
    );
  }
}