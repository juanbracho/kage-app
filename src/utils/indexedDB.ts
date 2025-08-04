// IndexedDB manager for robust local database storage
// Provides structured database-like storage in the browser

interface KageDB {
  goals: any[];
  tasks: any[];
  habits: any[];
  journal: any[];
  calendar: any[];
  settings: any;
  user: any;
  metadata: any; // Installation tracking and app metadata
}

class IndexedDBManager {
  private dbName = 'KageDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB failed to open');
        reject(false);
      };

      request.onsuccess = (event: any) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(true);
      };

      request.onupgradeneeded = (event: any) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for each data type
        const stores = ['goals', 'tasks', 'habits', 'journal', 'calendar', 'settings', 'user', 'metadata'];
        
        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            store.createIndex('createdAt', 'createdAt', { unique: false });
            store.createIndex('updatedAt', 'updatedAt', { unique: false });
          }
        });
      };
    });
  }

  async saveData<T>(storeName: keyof KageDB, data: T): Promise<boolean> {
    if (!this.db) await this.init();
    
    return new Promise((resolve) => {
      if (!this.db) {
        resolve(false);
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Clear existing data and add new data
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        if (Array.isArray(data)) {
          data.forEach(item => {
            const addItem = {
              ...item,
              updatedAt: new Date().toISOString()
            };
            store.add(addItem);
          });
        } else if (data && typeof data === 'object') {
          const addItem = {
            ...data as any,
            id: 1, // Single settings/user object
            updatedAt: new Date().toISOString()
          };
          store.add(addItem);
        }
        resolve(true);
      };

      clearRequest.onerror = () => resolve(false);
    });
  }

  async getData<T>(storeName: keyof KageDB): Promise<T[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve) => {
      if (!this.db) {
        resolve([]);
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => resolve([]);
    });
  }

  async addItem<T>(storeName: keyof KageDB, item: T): Promise<boolean> {
    if (!this.db) await this.init();
    
    return new Promise((resolve) => {
      if (!this.db) {
        resolve(false);
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const addItem = {
        ...item as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const request = store.add(addItem);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async updateItem<T>(storeName: keyof KageDB, id: number, updates: Partial<T>): Promise<boolean> {
    if (!this.db) await this.init();
    
    return new Promise((resolve) => {
      if (!this.db) {
        resolve(false);
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existingItem = getRequest.result;
        if (existingItem) {
          const updatedItem = {
            ...existingItem,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          
          const putRequest = store.put(updatedItem);
          putRequest.onsuccess = () => resolve(true);
          putRequest.onerror = () => resolve(false);
        } else {
          resolve(false);
        }
      };
      
      getRequest.onerror = () => resolve(false);
    });
  }

  async deleteItem(storeName: keyof KageDB, id: number): Promise<boolean> {
    if (!this.db) await this.init();
    
    return new Promise((resolve) => {
      if (!this.db) {
        resolve(false);
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async exportAllData(): Promise<KageDB | null> {
    const data: Partial<KageDB> = {};
    
    try {
      data.goals = await this.getData('goals');
      data.tasks = await this.getData('tasks');
      data.habits = await this.getData('habits');
      data.journal = await this.getData('journal');
      data.calendar = await this.getData('calendar');
      
      const settings = await this.getData('settings');
      data.settings = settings[0] || {};
      
      const user = await this.getData('user');
      data.user = user[0] || {};
      
      const metadata = await this.getData('metadata');
      data.metadata = metadata[0] || {};
      
      return data as KageDB;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  async importAllData(data: KageDB): Promise<boolean> {
    try {
      await this.saveData('goals', data.goals || []);
      await this.saveData('tasks', data.tasks || []);
      await this.saveData('habits', data.habits || []);
      await this.saveData('journal', data.journal || []);
      await this.saveData('calendar', data.calendar || []);
      await this.saveData('settings', data.settings || {});
      await this.saveData('user', data.user || {});
      
      // Don't overwrite metadata during import to preserve installation info
      if (data.metadata && Object.keys(data.metadata).length > 0) {
        const existing = await this.getInstallationMetadata();
        if (!existing) {
          await this.saveData('metadata', data.metadata);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  async clearAllData(): Promise<boolean> {
    if (!this.db) await this.init();
    
    const stores = ['goals', 'tasks', 'habits', 'journal', 'calendar', 'settings', 'user']; // Preserve metadata
    
    try {
      for (const storeName of stores) {
        await new Promise<void>((resolve, reject) => {
          if (!this.db) {
            reject();
            return;
          }
          
          const transaction = this.db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject();
        });
      }
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  async getStorageStats(): Promise<{
    totalItems: number;
    storeStats: Record<string, number>;
    estimatedSize: number;
  }> {
    const stores = ['goals', 'tasks', 'habits', 'journal', 'calendar', 'settings', 'user', 'metadata'];
    const storeStats: Record<string, number> = {};
    let totalItems = 0;
    let estimatedSize = 0;

    for (const storeName of stores) {
      const data = await this.getData(storeName as keyof KageDB);
      storeStats[storeName] = data.length;
      totalItems += data.length;
      estimatedSize += JSON.stringify(data).length;
    }

    return {
      totalItems,
      storeStats,
      estimatedSize
    };
  }

  // Installation and version tracking
  async getInstallationMetadata(): Promise<{
    installationId: string;
    deviceId: string;
    appVersion: string;
    dataVersion: number;
    firstInstall: string;
    lastUpdate: string;
    isFirstRun: boolean;
  } | null> {
    const metadataArray = await this.getData('metadata');
    return metadataArray.length > 0 ? metadataArray[0] : null;
  }

  async initializeAppMetadata(appVersion: string = '1.0.0'): Promise<{
    installationId: string;
    deviceId: string;
    isFirstRun: boolean;
    isUpdate: boolean;
    migrationNeeded: boolean;
  }> {
    const existing = await this.getInstallationMetadata();
    const now = new Date().toISOString();
    const currentDataVersion = 1; // Increment this when data structure changes
    
    if (existing) {
      // App update detected
      const isUpdate = existing.appVersion !== appVersion;
      const migrationNeeded = (existing.dataVersion || 1) < currentDataVersion;
      
      if (isUpdate || migrationNeeded) {
        // Perform data migration if needed
        if (migrationNeeded) {
          console.log(`📊 Data migration needed: v${existing.dataVersion || 1} → v${currentDataVersion}`);
          await this.performDataMigration(existing.dataVersion || 1, currentDataVersion);
        }
        
        await this.saveData('metadata', [{
          ...existing,
          appVersion,
          dataVersion: currentDataVersion,
          lastUpdate: now,
          isFirstRun: false
        }]);
      }
      return {
        installationId: existing.installationId,
        deviceId: existing.deviceId,
        isFirstRun: false,
        isUpdate,
        migrationNeeded
      };
    } else {
      // First installation
      const installationId = this.generateId();
      const deviceId = this.generateDeviceId();
      
      await this.saveData('metadata', [{
        installationId,
        deviceId,
        appVersion,
        dataVersion: currentDataVersion,
        firstInstall: now,
        lastUpdate: now,
        isFirstRun: true
      }]);
      
      return {
        installationId,
        deviceId,
        isFirstRun: true,
        isUpdate: false,
        migrationNeeded: false
      };
    }
  }

  // Data migration system for handling schema changes
  private async performDataMigration(fromVersion: number, toVersion: number): Promise<void> {
    console.log(`🔄 Performing data migration: v${fromVersion} → v${toVersion}`);
    
    try {
      // Create backup before migration
      const backupData = await this.exportAllData();
      if (backupData) {
        localStorage.setItem(`kage-migration-backup-${Date.now()}`, JSON.stringify(backupData));
      }
      
      // Perform migrations step by step
      for (let version = fromVersion; version < toVersion; version++) {
        await this.migrateFromVersion(version);
      }
      
      console.log('✅ Data migration completed successfully');
    } catch (error) {
      console.error('❌ Data migration failed:', error);
      throw error;
    }
  }

  private async migrateFromVersion(version: number): Promise<void> {
    switch (version) {
      case 1:
        // Future migration from v1 to v2
        // Example: await this.migrateV1ToV2();
        break;
      case 2:
        // Future migration from v2 to v3
        // Example: await this.migrateV2ToV3();
        break;
      default:
        console.log(`No migration needed for version ${version}`);
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
  }

  private generateDeviceId(): string {
    // Create a semi-persistent device ID based on available browser info
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('device-fingerprint', 10, 10);
    const fingerprint = canvas.toDataURL();
    
    const deviceInfo = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      fingerprint.slice(-50) // Last 50 chars of canvas fingerprint
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < deviceInfo.length; i++) {
      const char = deviceInfo.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return 'dev_' + Math.abs(hash).toString(36);
  }

  // Auto-backup system
  async createAutoBackup(): Promise<boolean> {
    try {
      const data = await this.exportAllData();
      if (!data) return false;
      
      const backupKey = `kage-auto-backup-${Date.now()}`;
      const backupData = {
        ...data,
        backupInfo: {
          createdAt: new Date().toISOString(),
          type: 'auto',
          version: '1.0.0'
        }
      };
      
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      // Clean old auto-backups (keep last 3)
      this.cleanupOldBackups();
      
      console.log('💾 Auto-backup created:', backupKey);
      return true;
    } catch (error) {
      console.error('Failed to create auto-backup:', error);
      return false;
    }
  }

  private cleanupOldBackups(): void {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('kage-auto-backup-'))
        .sort()
        .reverse(); // Most recent first
      
      // Remove all but the last 3 backups
      if (backupKeys.length > 3) {
        backupKeys.slice(3).forEach(key => {
          localStorage.removeItem(key);
          console.log('🗑️ Removed old backup:', key);
        });
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  async getAvailableBackups(): Promise<Array<{
    key: string;
    createdAt: string;
    type: string;
    size: number;
  }>> {
    const backups = [];
    
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('kage-auto-backup-') || key.startsWith('kage-migration-backup-')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            backups.push({
              key,
              createdAt: parsed.backupInfo?.createdAt || 'Unknown',
              type: parsed.backupInfo?.type || 'auto',
              size: data.length
            });
          }
        } catch (error) {
          console.warn('Invalid backup data for key:', key);
        }
      }
    }
    
    return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const indexedDB = new IndexedDBManager();
export default indexedDB;