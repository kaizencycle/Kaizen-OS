import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Clock, Shield, GitBranch } from 'lucide-react';

interface ReleaseProofCardProps {
  attestation: {
    attestation_id: string;
    release_version: string;
    chamber: string;
    cycle: string;
    environment: 'development' | 'staging' | 'production';
    deployment_timestamp: string;
    integrity_metrics: {
      gi_score: number;
      code_quality_score: number;
      test_coverage: number;
      security_score: number;
      performance_score: number;
    };
    verification: {
      automated_checks: Array<{
        check_name: string;
        status: 'passed' | 'failed' | 'warning' | 'skipped';
        details: string;
        timestamp: string;
      }>;
      manual_reviews: Array<{
        reviewer: string;
        status: 'approved' | 'rejected' | 'needs_changes';
        comments: string;
        timestamp: string;
      }>;
    };
    citizen_shield: {
      anomaly_detected: boolean;
      threat_level: 'low' | 'medium' | 'high' | 'critical';
      monitoring_active: boolean;
      last_scan: string;
    };
    rollback_available: boolean;
    progressive_delivery: {
      canary_percentage: number;
      auto_promote: boolean;
      health_checks_passing: boolean;
      monitoring_duration: string;
    };
  };
}

const ReleaseProofCard: React.FC<ReleaseProofCardProps> = ({ attestation }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
      case 'needs_changes':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'warning':
      case 'needs_changes':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getGIScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Release Proof Card
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {attestation.attestation_id}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Version: {attestation.release_version}</span>
          <span>•</span>
          <span>Chamber: {attestation.chamber}</span>
          <span>•</span>
          <span>Cycle: {attestation.cycle}</span>
          <span>•</span>
          <span>Environment: {attestation.environment}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Integrity Metrics */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Integrity Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getGIScoreColor(attestation.integrity_metrics.gi_score)}`}>
                {Math.round(attestation.integrity_metrics.gi_score * 100)}%
              </div>
              <div className="text-sm text-gray-600">GI Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getGIScoreColor(attestation.integrity_metrics.code_quality_score)}`}>
                {Math.round(attestation.integrity_metrics.code_quality_score * 100)}%
              </div>
              <div className="text-sm text-gray-600">Code Quality</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getGIScoreColor(attestation.integrity_metrics.test_coverage / 100)}`}>
                {attestation.integrity_metrics.test_coverage}%
              </div>
              <div className="text-sm text-gray-600">Test Coverage</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getGIScoreColor(attestation.integrity_metrics.security_score)}`}>
                {Math.round(attestation.integrity_metrics.security_score * 100)}%
              </div>
              <div className="text-sm text-gray-600">Security</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getGIScoreColor(attestation.integrity_metrics.performance_score)}`}>
                {Math.round(attestation.integrity_metrics.performance_score * 100)}%
              </div>
              <div className="text-sm text-gray-600">Performance</div>
            </div>
          </div>
        </div>

        {/* Citizen Shield Status */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Citizen Shield Status
          </h3>
          <div className="flex items-center gap-4">
            <Badge className={getThreatLevelColor(attestation.citizen_shield.threat_level)}>
              Threat Level: {attestation.citizen_shield.threat_level.toUpperCase()}
            </Badge>
            <Badge variant={attestation.citizen_shield.anomaly_detected ? "destructive" : "default"}>
              {attestation.citizen_shield.anomaly_detected ? "Anomaly Detected" : "No Anomalies"}
            </Badge>
            <Badge variant={attestation.citizen_shield.monitoring_active ? "default" : "secondary"}>
              {attestation.citizen_shield.monitoring_active ? "Monitoring Active" : "Monitoring Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Last scan: {formatTimestamp(attestation.citizen_shield.last_scan)}
          </p>
        </div>

        {/* Verification Results */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Verification Results</h3>
          <div className="space-y-3">
            {attestation.verification.automated_checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <span className="font-medium">{check.check_name}</span>
                </div>
                <Badge className={getStatusColor(check.status)}>
                  {check.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Progressive Delivery Status */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Progressive Delivery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {attestation.progressive_delivery.canary_percentage}%
              </div>
              <div className="text-sm text-gray-600">Canary Traffic</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {attestation.progressive_delivery.health_checks_passing ? "✓" : "✗"}
              </div>
              <div className="text-sm text-gray-600">Health Checks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {attestation.progressive_delivery.auto_promote ? "✓" : "✗"}
              </div>
              <div className="text-sm text-gray-600">Auto Promote</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {attestation.rollback_available ? "✓" : "✗"}
              </div>
              <div className="text-sm text-gray-600">Rollback Available</div>
            </div>
          </div>
        </div>

        {/* Deployment Info */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Deployed: {formatTimestamp(attestation.deployment_timestamp)}</span>
            <span>Monitoring: {attestation.progressive_delivery.monitoring_duration}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReleaseProofCard;