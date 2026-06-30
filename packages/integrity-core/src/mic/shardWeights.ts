// Kaizen Shard Weights Loader
// C-150: MIC + Kaizen Shards Integration

import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { ShardType } from './types';

export interface ShardWeightsConfig {
  threshold_mii: number;
  shard_weights: Record<string, number>;
  caps?: {
    per_cycle?: Record<string, number>;
  };
}

let cachedConfig: ShardWeightsConfig | null = null;

export function loadShardWeightsConfig(): ShardWeightsConfig {
  if (cachedConfig) return cachedConfig;

  // Try to find configs directory relative to workspace root
  // This works when running from workspace root or from package directory
  const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();
  const possiblePaths = [
    path.join(workspaceRoot, 'configs', 'kaizen_shards.yaml'),
    path.join(process.cwd(), 'configs', 'kaizen_shards.yaml'),
    path.join(process.cwd(), '..', '..', 'configs', 'kaizen_shards.yaml'),
  ];

  let configPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      configPath = possiblePath;
      break;
    }
  }

  if (!configPath) {
    // Fallback to defaults if config file not found
    console.warn('kaizen_shards.yaml not found, using defaults');
    return {
      threshold_mii: 0.95,
      shard_weights: {
        reflection: 1.0,
        learning: 1.0,
        civic: 1.5,
        stability: 2.0,
        stewardship: 2.0,
        innovation: 2.5,
        guardian: 3.0,
      },
    };
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  const parsed = load(raw) as ShardWeightsConfig;

  cachedConfig = parsed;
  return parsed;
}

export function loadShardWeights(): Record<ShardType, number> {
  const cfg = loadShardWeightsConfig();

  const defaults: Record<ShardType, number> = {
    reflection: 1.0,
    learning: 1.0,
    civic: 1.5,
    stability: 2.0,
    stewardship: 2.0,
    innovation: 2.5,
    guardian: 3.0,
  };

  const out = { ...defaults };

  for (const key of Object.keys(cfg.shard_weights ?? {})) {
    const t = key as ShardType;
    if (t in out) {
      out[t] = cfg.shard_weights[key]!;
    }
  }

  return out;
}

export function getMiiThresholdFromConfig(): number {
  const cfg = loadShardWeightsConfig();
  return cfg.threshold_mii ?? 0.95;
}
