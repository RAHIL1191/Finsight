import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useOAuth, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

interface GmailConnectButtonProps {
  onSuccess: () => void;
}

export const GmailConnectButton = ({ onSuccess }: GmailConnectButtonProps) => {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!isLoaded || !user) return;
    
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL('/oauth-callback');
      console.log('Clerk Redirect URL:', redirectUrl);

      // 1. Create the External Account Link
      // Ensure we pass the EXACT scopes we need here
      const externalAccount = await user.createExternalAccount({
        strategy: 'oauth_google',
        redirectUrl: redirectUrl,
        additionalScopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      });

      // 2. Open the browser to the verification URL
      if (externalAccount.verification?.externalAccountRedirectUrl) {
        const result = await WebBrowser.openAuthSessionAsync(
          externalAccount.verification.externalAccountRedirectUrl.toString(),
          redirectUrl
        );

        if (result.type === 'success') {
          Alert.alert('Success', 'Gmail connected successfully!');
          onSuccess();
        }
      } else {
        throw new Error('Clerk Dashboard might not have Google Linking enabled');
      }
    } catch (error: any) {
      console.error('Clerk OAuth/Linking Error:', error);
      Alert.alert('Error', error.message || 'Failed to link Gmail account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handleConnect}
      disabled={loading}
      style={styles.connectButton}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.connectText}>Link Receipt Email (Clerk)</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  connectButton: {
    backgroundColor: '#6C63FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 54,
  },
  connectText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 10,
  },
});
