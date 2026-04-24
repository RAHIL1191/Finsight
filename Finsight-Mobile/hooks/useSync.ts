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
    console.log('[Sync] Starting Gmail Sync (Clerk Mode)...');
    
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      // We no longer fetch the token on the mobile app.
      // Instead, we just tell the backend which Clerk user is syncing.
      // The backend will fetch the token securely using its secret key.
      const response = await apiFetch<{ success: boolean; data: any }>('/api/gmail/import', {
        method: 'POST',
        body: JSON.stringify({
          clerkUserId: user.id, // Tell backend who we are
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
