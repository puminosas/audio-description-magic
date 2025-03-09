
export interface AnalyticsMetrics {
  activeUsers: number;
  todayGenerations: number;
  totalListens: number;
  averageProcessingTime: number;
}

export interface MetricsState {
  metrics: AnalyticsMetrics;
  isLoading: boolean;
}

export interface RealtimeSubscription {
  channel: any;
  tables: string[];
}
