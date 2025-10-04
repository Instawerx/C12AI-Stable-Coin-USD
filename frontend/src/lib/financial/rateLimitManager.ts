import { db } from '../../../shared/auth/firebase';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface RateLimitConfig {
  dailyLimit: number;
  currentUsage: number;
  resetTime: Date;
  adminOverride: boolean;
}

interface APICall {
  endpoint: string;
  cost: number;
  timestamp: Date;
  totalUsage: number;
  remainingCalls: number;
}

class RateLimitManager {
  private config: RateLimitConfig | null = null;
  private readonly CONFIG_DOC = 'settings/apiLimits';

  async loadConfig(): Promise<void> {
    try {
      const docRef = doc(db, this.CONFIG_DOC);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.config = {
          dailyLimit: data.dailyLimit,
          currentUsage: data.currentUsage,
          resetTime: data.resetTime?.toDate() || this.getNextResetTime(),
          adminOverride: data.adminOverride || false,
        };
      } else {
        // Initialize with default config
        this.config = {
          dailyLimit: 25,
          currentUsage: 0,
          resetTime: this.getNextResetTime(),
          adminOverride: false,
        };
        await this.updateConfig();
      }
    } catch (error) {
      console.error('Error loading rate limit config:', error);
      // Fallback to default config
      this.config = {
        dailyLimit: 25,
        currentUsage: 0,
        resetTime: this.getNextResetTime(),
        adminOverride: false,
      };
    }
  }

  async canMakeCall(priority: 'critical' | 'high' | 'medium' | 'low' = 'medium'): Promise<boolean> {
    if (!this.config) await this.loadConfig();

    // Check if reset needed
    if (new Date() > this.config!.resetTime) {
      await this.resetDailyLimit();
    }

    // Admin override bypasses limits
    if (this.config!.adminOverride) return true;

    // Check remaining calls
    const remaining = this.config!.dailyLimit - this.config!.currentUsage;

    // Priority-based allowance
    const thresholds = {
      critical: 0,   // Always allow if any calls remain
      high: 5,       // Need 5+ calls remaining
      medium: 10,    // Need 10+ calls remaining
      low: 15,       // Need 15+ calls remaining (50%+ budget left)
    };

    return remaining > thresholds[priority];
  }

  async recordCall(endpoint: string, cost: number = 1): Promise<void> {
    if (!this.config) await this.loadConfig();

    this.config!.currentUsage += cost;

    try {
      // Log to Firestore for admin dashboard
      await addDoc(collection(db, 'apiUsage'), {
        endpoint,
        cost,
        timestamp: serverTimestamp(),
        totalUsage: this.config!.currentUsage,
        remainingCalls: this.config!.dailyLimit - this.config!.currentUsage,
      });

      // Update config
      await this.updateConfig();

      // Alert if approaching limit
      if (this.config!.currentUsage >= this.config!.dailyLimit * 0.8) {
        this.sendLimitWarning();
      }
    } catch (error) {
      console.error('Error recording API call:', error);
    }
  }

  async resetDailyLimit(): Promise<void> {
    if (!this.config) await this.loadConfig();

    this.config!.currentUsage = 0;
    this.config!.resetTime = this.getNextResetTime();
    await this.updateConfig();
  }

  private getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0); // Midnight UTC
    return tomorrow;
  }

  async updateAdminLimit(newLimit: number, adminId: string): Promise<void> {
    if (!this.config) await this.loadConfig();

    const oldLimit = this.config!.dailyLimit;
    this.config!.dailyLimit = newLimit;
    await this.updateConfig();

    // Log change
    try {
      await addDoc(collection(db, 'adminActions'), {
        action: 'API_LIMIT_CHANGE',
        adminId,
        oldLimit,
        newLimit,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  async toggleAdminOverride(enabled: boolean, adminId: string): Promise<void> {
    if (!this.config) await this.loadConfig();

    this.config!.adminOverride = enabled;
    await this.updateConfig();

    try {
      await addDoc(collection(db, 'adminActions'), {
        action: 'API_OVERRIDE_TOGGLE',
        adminId,
        enabled,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  getRemainingCalls(): number {
    if (!this.config) return 0;
    return Math.max(0, this.config.dailyLimit - this.config.currentUsage);
  }

  getUsageStats() {
    if (!this.config) {
      return {
        limit: 25,
        used: 0,
        remaining: 25,
        percentUsed: 0,
        resetTime: this.getNextResetTime(),
        adminOverride: false,
      };
    }

    return {
      limit: this.config.dailyLimit,
      used: this.config.currentUsage,
      remaining: this.getRemainingCalls(),
      percentUsed: (this.config.currentUsage / this.config.dailyLimit) * 100,
      resetTime: this.config.resetTime,
      adminOverride: this.config.adminOverride,
    };
  }

  private async updateConfig(): Promise<void> {
    if (!this.config) return;

    try {
      const docRef = doc(db, this.CONFIG_DOC);
      await setDoc(docRef, {
        dailyLimit: this.config.dailyLimit,
        currentUsage: this.config.currentUsage,
        resetTime: this.config.resetTime,
        adminOverride: this.config.adminOverride,
        lastUpdate: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating rate limit config:', error);
    }
  }

  private sendLimitWarning(): void {
    console.warn(
      `API Rate Limit Warning: ${this.config?.currentUsage}/${this.config?.dailyLimit} calls used (${this.getUsageStats().percentUsed.toFixed(0)}%)`
    );

    // You can add toast notification here
    if (typeof window !== 'undefined') {
      // Will implement with react-hot-toast in components
      window.dispatchEvent(
        new CustomEvent('api-limit-warning', {
          detail: this.getUsageStats(),
        })
      );
    }
  }
}

export const rateLimitManager = new RateLimitManager();
