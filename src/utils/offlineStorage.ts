// Enhanced offline storage utility for PWA
// Provides advanced localStorage management with sync capabilities

export interface OfflineData {
  goals: any[];
  tasks: any[];
  habits: any[];
  journal: any[];
  calendar: any[];
  settings: any;
  user: any;
  lastSync: number;
  version: string;
}

export interface SyncResult {
  success: boolean;
  synced: string[];
  failed: string[];
  lastSync: number;
}

class OfflineStorageManager {
  private readonly APP_VERSION = '1.0.0';
  private readonly STORAGE_KEY = 'kage-app-data';
  private readonly SYNC_QUEUE_KEY = 'kage-sync-queue';
  private readonly LAST_SYNC_KEY = 'kage-last-sync';

  // Get all app data from localStorage
  getAllData(): OfflineData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading offline data:', error);
      return null;
    }
  }

  // Save all app data to localStorage
  saveAllData(data: Partial<OfflineData>): boolean {
    try {
      const existingData = this.getAllData() || {} as OfflineData;
      const updatedData: OfflineData = {
        ...existingData,
        ...data,
        lastSync: Date.now(),
        version: this.APP_VERSION
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
      return true;
    } catch (error) {
      console.error('Error saving offline data:', error);
      return false;
    }
  }

  // Get specific store data
  getStoreData(storeName: keyof OfflineData): any {
    const data = this.getAllData();
    return data ? data[storeName] : null;
  }

  // Save specific store data
  saveStoreData(storeName: keyof OfflineData, storeData: any): boolean {
    const data = this.getAllData() || {} as OfflineData;
    (data as any)[storeName] = storeData;
    return this.saveAllData(data);
  }

  // Check if data is stale (older than 24 hours)
  isDataStale(): boolean {
    const data = this.getAllData();
    if (!data || !data.lastSync) return true;
    
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - data.lastSync > twentyFourHours;
  }

  // Get storage usage information
  getStorageInfo(): {
    used: number;
    available: number;
    percentage: number;
    quota: number;
  } {
    try {
      const data = JSON.stringify(this.getAllData());
      const used = new Blob([data]).size;
      
      // Estimate available storage (5MB limit for localStorage)
      const quota = 5 * 1024 * 1024; // 5MB
      const available = quota - used;
      const percentage = (used / quota) * 100;
      
      return { used, available, percentage, quota };
    } catch (error) {
      console.error('Error calculating storage info:', error);
      return { used: 0, available: 0, percentage: 0, quota: 0 };
    }
  }

  // Clean up old data to free storage
  cleanupOldData(): boolean {
    try {
      const data = this.getAllData();
      if (!data) return true;

      // Remove old journal entries (keep last 100)
      if (data.journal && data.journal.length > 100) {
        data.journal = data.journal
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 100);
      }

      // Remove old calendar events (keep last 30 days)
      if (data.calendar) {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        data.calendar = data.calendar.filter(event => 
          new Date(event.date).getTime() > thirtyDaysAgo
        );
      }

      // Remove completed tasks older than 7 days
      if (data.tasks) {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        data.tasks = data.tasks.filter(task => 
          !task.completed || new Date(task.completedAt || task.createdAt).getTime() > sevenDaysAgo
        );
      }

      return this.saveAllData(data);
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      return false;
    }
  }

  // Add item to sync queue for later synchronization
  addToSyncQueue(action: {
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    store: string;
    id: string;
    data?: any;
    timestamp: number;
  }): void {
    try {
      const queue = this.getSyncQueue();
      queue.push(action);
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  // Get sync queue
  getSyncQueue(): any[] {
    try {
      const queue = localStorage.getItem(this.SYNC_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error reading sync queue:', error);
      return [];
    }
  }

  // Clear sync queue after successful sync
  clearSyncQueue(): void {
    try {
      localStorage.removeItem(this.SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }

  // Process sync queue (simulate server sync)
  async processSyncQueue(): Promise<SyncResult> {
    const queue = this.getSyncQueue();
    const synced: string[] = [];
    const failed: string[] = [];

    for (const action of queue) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`Syncing ${action.type} ${action.store}:${action.id}`);
        synced.push(`${action.store}:${action.id}`);
      } catch (error) {
        console.error(`Failed to sync ${action.store}:${action.id}`, error);
        failed.push(`${action.store}:${action.id}`);
      }
    }

    // Update last sync time
    const lastSync = Date.now();
    localStorage.setItem(this.LAST_SYNC_KEY, lastSync.toString());

    // Clear queue if all items synced successfully
    if (failed.length === 0) {
      this.clearSyncQueue();
    }

    return {
      success: failed.length === 0,
      synced,
      failed,
      lastSync
    };
  }

  // Get last sync time
  getLastSyncTime(): number {
    try {
      const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
      return lastSync ? parseInt(lastSync) : 0;
    } catch (error) {
      console.error('Error reading last sync time:', error);
      return 0;
    }
  }

  // Export all data for backup
  exportData(): string {
    const data = this.getAllData();
    return JSON.stringify(data, null, 2);
  }

  // Import data from backup
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }

      // Backup current data
      const currentData = this.getAllData();
      localStorage.setItem('kage-backup-' + Date.now(), JSON.stringify(currentData));

      // Import new data
      return this.saveAllData(data);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Check if offline mode is active
  isOffline(): boolean {
    return !navigator.onLine;
  }

  // Get offline status info
  getOfflineStatus(): {
    isOffline: boolean;
    hasQueuedChanges: boolean;
    queueLength: number;
    lastSync: number;
  } {
    return {
      isOffline: this.isOffline(),
      hasQueuedChanges: this.getSyncQueue().length > 0,
      queueLength: this.getSyncQueue().length,
      lastSync: this.getLastSyncTime()
    };
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorageManager();

// Enhanced Zustand persistence middleware with offline support
export const createOfflinePersist = (name: string) => ({
  name,
  getStorage: () => ({
    getItem: (_key: string) => {
      const data = offlineStorage.getStoreData(name as keyof OfflineData);
      return data ? JSON.stringify(data) : null;
    },
    setItem: (_key: string, value: string) => {
      const data = JSON.parse(value);
      offlineStorage.saveStoreData(name as keyof OfflineData, data);
      
      // Add to sync queue if online
      if (!offlineStorage.isOffline()) {
        offlineStorage.addToSyncQueue({
          type: 'UPDATE',
          store: name,
          id: 'store-data',
          data,
          timestamp: Date.now()
        });
      }
    },
    removeItem: (_key: string) => {
      offlineStorage.saveStoreData(name as keyof OfflineData, null);
    }
  })
});

export default offlineStorage;