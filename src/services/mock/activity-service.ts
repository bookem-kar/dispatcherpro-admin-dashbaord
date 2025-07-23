// Mock Activity Service - In-memory event logging and retrieval

import type { 
  ActivityEvent, 
  ActivityFilter, 
  NewActivityEvent 
} from '@/types/domain';
import type { ActivityService } from '@/services/interfaces';
import { mockActivityEvents, generateMockActivity } from '@/data/mock-fixtures';

export class MockActivityService implements ActivityService {
  private events: ActivityEvent[] = generateMockActivity(100); // Start with rich data

  async listActivity(filter?: ActivityFilter): Promise<ActivityEvent[]> {
    let result = [...this.events];

    // Apply filters
    if (filter?.companyId) {
      result = result.filter(e => e.companyId === filter.companyId);
    }
    
    if (filter?.userId) {
      result = result.filter(e => e.userId === filter.userId);
    }
    
    if (filter?.type) {
      result = result.filter(e => e.type === filter.type);
    }
    
    if (filter?.targetType) {
      result = result.filter(e => e.targetType === filter.targetType);
    }

    // Date range filter
    if (filter?.startDate) {
      const startDate = new Date(filter.startDate);
      result = result.filter(e => new Date(e.timestamp) >= startDate);
    }
    
    if (filter?.endDate) {
      const endDate = new Date(filter.endDate);
      result = result.filter(e => new Date(e.timestamp) <= endDate);
    }

    // Sort by timestamp desc (most recent first)
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const page = filter?.page || 1;
    const limit = filter?.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return result.slice(start, end);
  }

  async logEvent(evt: NewActivityEvent): Promise<void> {
    const newEvent: ActivityEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...evt,
      timestamp: new Date().toISOString()
    };

    this.events.unshift(newEvent); // Add to front for recent-first ordering
    
    // Keep only last 1000 events to prevent memory bloat
    if (this.events.length > 1000) {
      this.events = this.events.slice(0, 1000);
    }

    // Log to console for dev visibility
    console.info('[Activity]', newEvent.type, {
      company: newEvent.companyId,
      user: newEvent.userId,
      target: `${newEvent.targetType}:${newEvent.targetId}`,
      meta: newEvent.meta
    });
  }

  // Helper methods for testing/dev
  reset(): void {
    this.events = generateMockActivity(100);
  }

  getAll(): ActivityEvent[] {
    return [...this.events];
  }

  getRecentActivity(limit: number = 10): Promise<ActivityEvent[]> {
    return this.listActivity({ limit });
  }
}
