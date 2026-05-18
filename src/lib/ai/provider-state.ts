/**
 * AI Provider State - Global Circuit Breaker
 * Tracks the health of external AI providers (e.g., Gemini).
 */

class AIProviderStateClass {
  private lockoutUntil: number | null = null;
  private consecutiveFailures = 0;

  isHealthy() {
    if (!this.lockoutUntil) return true;

    if (Date.now() > this.lockoutUntil) {
      this.reset();
      return true;
    }

    return false;
  }

  recordFailure(status?: number) {
    this.consecutiveFailures++;

    if (status === 429 || status === 503) {
      this.lockoutUntil = Date.now() + 60_000;
    }
  }

  reset() {
    this.lockoutUntil = null;
    this.consecutiveFailures = 0;
  }
}

export const AIProviderState = new AIProviderStateClass();
