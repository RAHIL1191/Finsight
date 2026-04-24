import { useState } from 'react';
import { useUser } from '@clerk/expo';
import { apiFetch } from '../lib/api';

export const useSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const syncGmail = async () => {
    setError(null);
    console.log('[Sync] Starting Gmail Sync...');
    try {
      console.log(`🔍 USER STATE: ${user?.externalAccounts.length || 0} external accounts found.`);
      const googleAccount = user?.externalAccounts.find(acc => acc.provider === 'google');
      
      if (!googleAccount) {
        console.warn('[Sync] ⚠️ No Google account found in Clerk session.');
        throw new Error('Please sign in with Google to sync emails');
      }

      console.log('[Sync] 🔑 Account found, fetching token...');
      const tokenResponse = await googleAccount.getToken();
      const accessToken = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;

      if (!accessToken) {
        throw new Error('Could not retrieve token from Clerk');
      }

      console.log('[Sync] 🚀 CALLING GMAIL IMPORT API...');
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
      console.error('[Sync] Gmail Error:', err);
      setError(err.message || 'Gmail sync failed');
    }
  };

  const syncPlaid = async () => {
    setError(null);
    console.log('[Sync] Starting Plaid Sync...');
    try {
      const response = await apiFetch<{ success: boolean; data: any }>('/api/plaid/sync', {
        method: 'POST',
      });
      if (response.success) {
        console.log('[Sync] Plaid success');
        setLastSync(new Date());
      }
    } catch (err: any) {
      console.error('[Sync] Plaid Error:', err);
      // We don't necessarily want Plaid failure to block Gmail success
    }
  };

  const syncAll = async () => {
    setIsSyncing(true);
    // Temporarily disabled Plaid to focus on Gmail debugging
    // await syncPlaid(); 
    await syncGmail();
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
