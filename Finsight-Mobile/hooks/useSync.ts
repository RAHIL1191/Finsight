import { useState } from 'react';
import { useUser } from '@clerk/expo';
import { apiFetch } from '../lib/api';

export const useSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const syncGmail = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      // 1. Get the Google account from the current login session
      const googleAccount = user?.externalAccounts.find(acc => acc.provider === 'google');
      
      if (!googleAccount) {
        throw new Error('Please sign in with Google to sync emails');
      }

      // 2. Fetch the access token from Clerk for this account
      const tokenResponse = await googleAccount.getToken();
      const accessToken = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;

      if (!accessToken) {
        throw new Error('Could not retrieve token from Clerk');
      }

      // We call the backend import endpoint
      const response = await apiFetch<{ success: boolean; data: any }>('/api/gmail/import', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: accessToken,
          maxMessages: 100
        })
      });
      if (response.success) {
        console.log(`[Sync] Gmail success: Imported ${response.data.imported} items.`);
        setLastSync(new Date());
      }
    } catch (err: any) {
      setError(err.message || 'Gmail sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncPlaid = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const response = await apiFetch<{ success: boolean; data: any }>('/api/plaid/sync', {
        method: 'POST',
      });
      if (response.success) {
        setLastSync(new Date());
      }
    } catch (err: any) {
      setError(err.message || 'Plaid sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncAll = async () => {
    setIsSyncing(true);
    await Promise.allSettled([syncPlaid(), syncGmail()]);
    setIsSyncing(false);
  };

  return {
    isSyncing,
    lastSync,
    error,
    syncGmail,
    syncPlaid,
    syncAll,
  };
};
