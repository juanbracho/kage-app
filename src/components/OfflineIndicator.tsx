import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RotateCw, CheckCircle, XCircle } from 'lucide-react';
import { offlineStorage } from '../utils/offlineStorage';

const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [queueLength, setQueueLength] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      handleSync();
    };

    const handleOffline = () => {
      setIsOffline(true);
      setSyncStatus('idle');
    };

    const handleSync = async () => {
      const queue = offlineStorage.getSyncQueue();
      if (queue.length > 0) {
        setSyncStatus('syncing');
        try {
          const result = await offlineStorage.processSyncQueue();
          setSyncStatus(result.success ? 'success' : 'error');
          setQueueLength(queue.length - result.synced.length);
        } catch (error) {
          setSyncStatus('error');
        }
        
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    };

    // Update queue length periodically
    const updateQueueLength = () => {
      setQueueLength(offlineStorage.getSyncQueue().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const interval = setInterval(updateQueueLength, 5000);
    updateQueueLength(); // Initial update

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Don't show anything if online and no pending sync
  if (!isOffline && syncStatus === 'idle' && queueLength === 0) {
    return null;
  }

  const getStatusIcon = () => {
    if (isOffline) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    
    switch (syncStatus) {
      case 'syncing':
        return <RotateCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return queueLength > 0 ? 
          <RotateCw className="w-4 h-4 text-orange-500" /> : 
          <Wifi className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusText = () => {
    if (isOffline) {
      return queueLength > 0 ? `Offline (${queueLength} pending)` : 'Offline';
    }
    
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Sync failed';
      default:
        return queueLength > 0 ? `${queueLength} pending` : 'Online';
    }
  };

  const getStatusColor = () => {
    if (isOffline) return 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200';
    
    switch (syncStatus) {
      case 'syncing':
        return 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200';
      case 'success':
        return 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200';
      case 'error':
        return 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200';
      default:
        return queueLength > 0 ? 
          'bg-orange-100 border-orange-200 text-orange-800 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200' :
          'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200';
    }
  };

  const handleRetrySync = async () => {
    if (!isOffline && queueLength > 0) {
      setSyncStatus('syncing');
      try {
        const result = await offlineStorage.processSyncQueue();
        setSyncStatus(result.success ? 'success' : 'error');
        setQueueLength(result.failed.length);
      } catch (error) {
        setSyncStatus('error');
      }
      
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer ${getStatusColor()}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
      
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={isOffline ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                {isOffline ? 'Offline' : 'Online'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Pending sync:</span>
              <span className="text-gray-900 dark:text-white">{queueLength}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last sync:</span>
              <span className="text-gray-900 dark:text-white">
                {offlineStorage.getLastSyncTime() > 0 ? 
                  new Date(offlineStorage.getLastSyncTime()).toLocaleTimeString() : 
                  'Never'
                }
              </span>
            </div>
            
            {!isOffline && queueLength > 0 && (
              <button
                onClick={handleRetrySync}
                disabled={syncStatus === 'syncing'}
                className="w-full mt-3 px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-1"
              >
                <RotateCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;