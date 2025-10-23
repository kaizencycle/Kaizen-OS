"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface QualityMetrics {
  status: string;
  health_score: number;
  metrics: {
    provenance_coverage: { value: number; timestamp: string; total_outputs: number };
    hallucination_rate: { value: number; timestamp: string; total_outputs: number };
    duplicate_ratio: { value: number; timestamp: string; total_outputs: number };
    beacon_validity: { value: number; timestamp: string; total_outputs: number };
    rollback_rate: { value: number; timestamp: string };
    copilot_overlap_score: { value: number; timestamp: string };
  };
  targets: {
    provenance_coverage: number;
    hallucination_rate: number;
    duplicate_ratio: number;
    beacon_validity: number;
    copilot_overlap: number;
  };
  total_outputs: number;
  quarantined_items: number;
}

export default function QualityDashboard() {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quality-metrics');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMetrics(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 0.6) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const isTargetMet = (value: number, target: number, reverse = false) => {
    return reverse ? value <= target : value >= target;
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading quality metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading quality metrics: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No quality metrics data available.
        </AlertDescription>
      </Alert>
    );
  }

  if (metrics.status === 'disabled') {
    return (
      <Alert className="m-4">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Quality metrics are disabled. Enable QUALITY_METRICS_ENABLED=true in your environment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quality Dashboard</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getHealthIcon(metrics.health_score)}
            <span>Overall Health Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold">
                <span className={getHealthColor(metrics.health_score)}>
                  {(metrics.health_score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex-1">
                <Progress value={metrics.health_score * 100} className="h-3" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Total Outputs: <span className="font-semibold">{metrics.total_outputs}</span></div>
              <div>Quarantined Items: <span className="font-semibold">{metrics.quarantined_items}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Provenance Coverage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Provenance Coverage</span>
              <Badge variant={isTargetMet(metrics.metrics.provenance_coverage.value, metrics.targets.provenance_coverage) ? "default" : "destructive"}>
                {formatPercentage(metrics.metrics.provenance_coverage.value)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={metrics.metrics.provenance_coverage.value * 100} className="h-2" />
              <div className="text-sm text-gray-600">
                Target: {formatPercentage(metrics.targets.provenance_coverage)}
              </div>
              <div className="text-xs text-gray-500">
                Updated: {formatTimestamp(metrics.metrics.provenance_coverage.timestamp)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hallucination Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Hallucination Rate</span>
              <Badge variant={isTargetMet(metrics.metrics.hallucination_rate.value, metrics.targets.hallucination_rate, true) ? "default" : "destructive"}>
                {formatPercentage(metrics.metrics.hallucination_rate.value)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={metrics.metrics.hallucination_rate.value * 100} className="h-2" />
              <div className="text-sm text-gray-600">
                Target: ≤ {formatPercentage(metrics.targets.hallucination_rate)}
              </div>
              <div className="text-xs text-gray-500">
                Updated: {formatTimestamp(metrics.metrics.hallucination_rate.timestamp)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duplicate Ratio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Duplicate Ratio</span>
              <Badge variant={isTargetMet(metrics.metrics.duplicate_ratio.value, metrics.targets.duplicate_ratio, true) ? "default" : "destructive"}>
                {formatPercentage(metrics.metrics.duplicate_ratio.value)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={metrics.metrics.duplicate_ratio.value * 100} className="h-2" />
              <div className="text-sm text-gray-600">
                Target: ≤ {formatPercentage(metrics.targets.duplicate_ratio)}
              </div>
              <div className="text-xs text-gray-500">
                Updated: {formatTimestamp(metrics.metrics.duplicate_ratio.timestamp)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beacon Validity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Beacon Validity</span>
              <Badge variant={isTargetMet(metrics.metrics.beacon_validity.value, metrics.targets.beacon_validity) ? "default" : "destructive"}>
                {formatPercentage(metrics.metrics.beacon_validity.value)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={metrics.metrics.beacon_validity.value * 100} className="h-2" />
              <div className="text-sm text-gray-600">
                Target: {formatPercentage(metrics.targets.beacon_validity)}
              </div>
              <div className="text-xs text-gray-500">
                Updated: {formatTimestamp(metrics.metrics.beacon_validity.timestamp)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copilot Overlap Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Copilot Overlap</span>
              <Badge variant={isTargetMet(metrics.metrics.copilot_overlap_score.value, metrics.targets.copilot_overlap) ? "default" : "destructive"}>
                {formatPercentage(metrics.metrics.copilot_overlap_score.value)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={metrics.metrics.copilot_overlap_score.value * 100} className="h-2" />
              <div className="text-sm text-gray-600">
                Target: {formatPercentage(metrics.targets.copilot_overlap)}
              </div>
              <div className="text-xs text-gray-500">
                Updated: {formatTimestamp(metrics.metrics.copilot_overlap_score.timestamp)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rollback Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Rollback Rate</span>
              <Badge variant={metrics.metrics.rollback_rate.value < 0.1 ? "default" : "destructive"}>
                {formatPercentage(metrics.metrics.rollback_rate.value)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={metrics.metrics.rollback_rate.value * 100} className="h-2" />
              <div className="text-sm text-gray-600">
                Target: &lt; {formatPercentage(0.1)}
              </div>
              <div className="text-xs text-gray-500">
                Updated: {formatTimestamp(metrics.metrics.rollback_rate.timestamp)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anti-Slop Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Anti-Slop Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Provenance-by-default</h4>
              <div className="flex items-center space-x-2">
                {metrics.metrics.provenance_coverage.value >= 0.9 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {metrics.metrics.provenance_coverage.value >= 0.9 ? 'Active' : 'Needs Attention'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Memory Hygiene</h4>
              <div className="flex items-center space-x-2">
                {metrics.metrics.beacon_validity.value >= 0.95 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {metrics.metrics.beacon_validity.value >= 0.95 ? 'Clean' : 'Needs Cleanup'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Human-in-the-loop</h4>
              <div className="flex items-center space-x-2">
                {metrics.metrics.copilot_overlap_score.value >= 0.5 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {metrics.metrics.copilot_overlap_score.value >= 0.5 ? 'Engaged' : 'Low Engagement'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Incentive Alignment</h4>
              <div className="flex items-center space-x-2">
                {metrics.metrics.rollback_rate.value < 0.1 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {metrics.metrics.rollback_rate.value < 0.1 ? 'Stable' : 'High Rollbacks'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}