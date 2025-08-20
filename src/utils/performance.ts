class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();
  private static metrics: Map<string, number[]> = new Map();
  
  static startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }
  
  static endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer '${name}' was not started`);
      return 0;
    }
    
    const duration = Date.now() - startTime;
    this.timers.delete(name);
    
    // Store metric for averaging
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
    
    // Keep only last 10 measurements
    const measurements = this.metrics.get(name)!;
    if (measurements.length > 10) {
      measurements.shift();
    }
    
    console.log(`⏱️ ${name}: ${duration}ms`);
    return duration;
  }
  
  static getAverageTime(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) {
      return 0;
    }
    
    const sum = measurements.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / measurements.length);
  }
  
  static clearMetrics(): void {
    this.metrics.clear();
    this.timers.clear();
  }
  
  static logMemoryUsage(): void {
    if (__DEV__) {
      // This is a simplified version - in production you'd use proper memory monitoring
      console.log('🧠 Memory usage logged (development mode)');
    }
  }
}

export { PerformanceMonitor }; 