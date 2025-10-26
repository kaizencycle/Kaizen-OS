// Types for Kaizen OS UI Kit

export interface ProofCardProps {
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  integrity: number;
  timestamp: string;
  metadata?: Record<string, any>;
  onAction?: (action: string) => void;
  className?: string;
}

export interface GIBadgeProps {
  gi: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  className?: string;
}

export interface ServiceTableProps {
  services: ServiceInfo[];
  onServiceClick?: (service: ServiceInfo) => void;
  onAction?: (action: string, service: ServiceInfo) => void;
  className?: string;
}

export interface ServiceInfo {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  gi: number;
  responseTime: number;
  uptime: number;
  lastCheck: string;
  endpoint: string;
}

export interface IntegrityMeterProps {
  value: number;
  max?: number;
  thresholds?: {
    warning: number;
    critical: number;
  };
  label?: string;
  showValue?: boolean;
  className?: string;
}

export interface StatusIndicatorProps {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  className?: string;
}

export interface CivicTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}


