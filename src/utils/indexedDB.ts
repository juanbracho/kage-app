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
        const stores = ['goals', 'tasks', 'habits', 'journal', 'calendar', 'settings', 'user'];
        
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
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  async clearAllData(): Promise<boolean> {
    if (!this.db) await this.init();
    
    const stores = ['goals', 'tasks', 'habits', 'journal', 'calendar', 'settings', 'user'];
    
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
    const stores = ['goals', 'tasks', 'habits', 'journal', 'calendar', 'settings', 'user'];
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
}

export const indexedDB = new IndexedDBManager();
export default indexedDB;