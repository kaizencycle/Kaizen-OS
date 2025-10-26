import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface IntegrityMetrics {
  gi_score: number;
  code_quality_score: number;
  test_coverage: number;
  security_score: number;
  performance_score: number;
  last_updated: string;
}

interface IntegrityResponse {
  status: 'healthy' | 'degraded' | 'critical';
  metrics: IntegrityMetrics;
  checks: {
    civic_files: boolean;
    tests_passing: boolean;
    security_scan: boolean;
    performance_ok: boolean;
  };
  recommendations: string[];
  timestamp: string;
}

// Calculate Global Integrity (GI) Score
function calculateGIScore(): IntegrityMetrics {
  const baseDir = process.cwd();
  
  // Mock calculations - replace with actual implementations
  let codeQualityScore = 1.0;
  let testCoverage = 85;
  let securityScore = 1.0;
  let performanceScore = 1.0;
  
  // Check for civic files
  const civicFilesExist = fs.existsSync(path.join(baseDir, '.civic', 'change.proposal.json')) ||
                         fs.existsSync(path.join(baseDir, '.civic', 'change.spec.md'));
  
  if (!civicFilesExist) {
    codeQualityScore *= 0.8; // Penalty for missing civic files
  }
  
  // Check test files
  const testFiles = fs.readdirSync(path.join(baseDir, 'src')).filter(file => 
    file.includes('.test.') || file.includes('.spec.')
  );
  
  if (testFiles.length === 0) {
    testCoverage = 0;
    codeQualityScore *= 0.7;
  }
  
  // Check for security vulnerabilities (mock)
  // In real implementation, this would run security scans
  const hasSecurityIssues = false;
  if (hasSecurityIssues) {
    securityScore = 0.5;
  }
  
  // Check performance (mock)
  // In real implementation, this would run performance tests
  const performanceIssues = false;
  if (performanceIssues) {
    performanceScore = 0.8;
  }
  
  // Calculate weighted GI score
  const giScore = (
    codeQualityScore * 0.3 +
    (testCoverage / 100) * 0.3 +
    securityScore * 0.2 +
    performanceScore * 0.2
  );
  
  return {
    gi_score: Math.round(giScore * 100) / 100,
    code_quality_score: Math.round(codeQualityScore * 100) / 100,
    test_coverage: testCoverage,
    security_score: Math.round(securityScore * 100) / 100,
    performance_score: Math.round(performanceScore * 100) / 100,
    last_updated: new Date().toISOString()
  };
}

// Run integrity checks
function runIntegrityChecks(): { checks: any; recommendations: string[] } {
  const baseDir = process.cwd();
  const recommendations: string[] = [];
  
  // Check civic files
  const civicFilesExist = fs.existsSync(path.join(baseDir, '.civic', 'change.proposal.json')) ||
                         fs.existsSync(path.join(baseDir, '.civic', 'change.spec.md'));
  
  if (!civicFilesExist) {
    recommendations.push('Consider adding civic change management files (.civic/change.proposal.json or .civic/change.spec.md)');
  }
  
  // Check test coverage
  const testFiles = fs.readdirSync(path.join(baseDir, 'src')).filter(file => 
    file.includes('.test.') || file.includes('.spec.')
  );
  
  if (testFiles.length === 0) {
    recommendations.push('Add unit tests to improve code quality and reliability');
  }
  
  // Check for security best practices
  const packageJson = JSON.parse(fs.readFileSync(path.join(baseDir, 'package.json'), 'utf8'));
  const hasSecurityDependencies = packageJson.dependencies && 
    (packageJson.dependencies.helmet || packageJson.dependencies.cors);
  
  if (!hasSecurityDependencies) {
    recommendations.push('Consider adding security middleware like helmet and cors');
  }
  
  // Check for monitoring/observability
  const hasMonitoring = fs.existsSync(path.join(baseDir, 'pages', 'api', 'health.ts')) ||
                       fs.existsSync(path.join(baseDir, 'pages', 'api', 'metrics.ts'));
  
  if (!hasMonitoring) {
    recommendations.push('Add health check and monitoring endpoints for better observability');
  }
  
  return {
    checks: {
      civic_files: civicFilesExist,
      tests_passing: testFiles.length > 0,
      security_scan: hasSecurityDependencies,
      performance_ok: true // Mock - would run actual performance tests
    },
    recommendations
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<IntegrityResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'critical',
      metrics: {
        gi_score: 0,
        code_quality_score: 0,
        test_coverage: 0,
        security_score: 0,
        performance_score: 0,
        last_updated: new Date().toISOString()
      },
      checks: {
        civic_files: false,
        tests_passing: false,
        security_scan: false,
        performance_ok: false
      },
      recommendations: ['Method not allowed'],
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    const metrics = calculateGIScore();
    const { checks, recommendations } = runIntegrityChecks();
    
    // Determine overall status
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (metrics.gi_score < 0.7) {
      status = 'critical';
    } else if (metrics.gi_score < 0.9) {
      status = 'degraded';
    }
    
    // Check individual components
    if (!checks.civic_files || !checks.tests_passing) {
      status = 'degraded';
    }
    
    if (!checks.security_scan) {
      status = 'critical';
    }
    
    return res.status(200).json({
      status,
      metrics,
      checks,
      recommendations,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error running integrity check:', error);
    
    return res.status(500).json({
      status: 'critical',
      metrics: {
        gi_score: 0,
        code_quality_score: 0,
        test_coverage: 0,
        security_score: 0,
        performance_score: 0,
        last_updated: new Date().toISOString()
      },
      checks: {
        civic_files: false,
        tests_passing: false,
        security_scan: false,
        performance_ok: false
      },
      recommendations: ['Internal server error during integrity check'],
      timestamp: new Date().toISOString()
    });
  }
}
