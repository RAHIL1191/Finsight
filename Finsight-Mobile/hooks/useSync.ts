import { useState } from 'react';
import { useUser, useAuth } from '@clerk/expo';
import { apiFetch } from '../lib/api';

export const useSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const { getToken } = useAuth();

  const syncGmail = async () => {
    setError(null);
    console.log('[Sync] Starting Gmail Sync (Clerk Mode)...');
    
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      const sessionToken = await getToken();
      
      const response = await apiFetch<{ success: boolean; data: any }>('/api/gmail/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          clerkUserId: user.id,
          maxMessages: 100
        })
      });

      if (response.success) {
        console.log(`[Sync] Gmail success: Processed ${response.data.totalMessages} items.`);
        setLastSync(new Date());
      }
    } catch (err: any) {
      console.error('[Sync] Gmail Error:', err);
      setError(err.message || 'Gmail sync failed');
    }
  };

  const syncPlaid = async () => {
    setError(null);
    // Plaid still requires an accountId usually, but we'll leave it for now
    try {
      // Plaid sync logic...
    } catch (err: any) {
      console.error('[Sync] Plaid Error:', err);
    }
  };

  const syncAll = async () => {
    setIsSyncing(true);
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
