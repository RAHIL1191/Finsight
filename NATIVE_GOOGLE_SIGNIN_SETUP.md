# Native Google Sign-In Setup Guide

## Summary of Changes

Replaced WebBrowser-based OAuth with native Google Sign-In SDK to fix Android dark mode rendering bug (white text on white background).

## What Was Implemented

### Backend Changes
✅ **New API endpoint**: `/api/auth/mobile/google` - Accepts ID tokens from native SDK
✅ **Token verification**: Uses `google-auth-library` to verify tokens with Google
✅ **User creation**: Automatically creates/finds users from verified Google accounts
✅ **Session management**: Returns JWT tokens and cookies

### Mobile Changes
✅ **Installed**: `@react-native-google-signin/google-signin` package
✅ **Updated**: `lib/auth.ts` - Configures and uses native SDK
✅ **Removed**: WebBrowser OAuth implementation (black screen issue resolved)
✅ **Cleaned**: Removed unused imports

## Remaining Configuration

### Step 1: Add Environment Variables

Create `.env.local` in Finsight-Mobile root:

```ini
# Web OAuth Client ID (from Google Cloud Console)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# iOS Client ID (optional - if different from web)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

### Step 2: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create new one
3. Navigate to **APIs & Services** → **Credentials**
4. Create OAuth 2.0 Client IDs for:

#### For iOS:
- Click **CREATE CREDENTIALS** → **OAuth client ID**
- Application type: **iOS**
- Bundle ID: `com.rahil.finsight`
- Copy the **Client ID** → use for `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- Download **GoogleService-Info.plist**

#### For Android:
- Click **CREATE CREDENTIALS** → **OAuth client ID**
- Application type: **Android**
- Package name: `com.rahil.finsight`
- SHA-1 certificate fingerprint: Get from:
  ```bash
  cd Finsight-Mobile
  keytool -keystore android/app/debug.keystore -list -v
  ```
  (Password: `android`)
- Copy the **Client ID**
- Download **google-services.json**

### Step 3: Add Native Configuration Files

#### iOS (GoogleService-Info.plist)
1. Place file at: `Finsight-Mobile/ios/GoogleService-Info.plist`
2. If using Expo managed workflow, add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleSignIn": {
          "reservedClientId": "YOUR_REVERSED_CLIENT_ID"
        }
      }
    }
  }
}
```

#### Android (google-services.json)
1. Place file at: `Finsight-Mobile/android/app/google-services.json`
2. Add to `app.json`:
```json
{
  "expo": {
    "android": {
      "config": {
        "googleSignIn": {
          "apiKey": "AIza...",
          "certificateHash": "..."
        }
      }
    }
  }
}
```

### Step 4: Configure Redirect URIs

In Google Cloud Console, add authorized redirect URIs:
- `https://finsight-one-chi.vercel.app/api/auth/callback/google`
- `com.rahil.finsight:/` (for native sign-in callback)

## Testing

### Android Testing
1. Enable **Developer Mode** on device
2. Run: `expo run:android` (requires native build)
3. Test with device in **Dark Mode** (Settings → Display → Dark mode)
4. Sign in should show native Google account picker (no black screen)

### iOS Testing
1. Build with Xcode or use `expo run:ios`
2. Sign in should show native iOS account picker

## Benefits

✅ **No more black screen** - Native UI renders correctly in all themes
✅ **Faster authentication** - No browser redirect overhead
✅ **Better UX** - Native account picker feels polished
✅ **Production-ready** - Used by Monarch, YNAB, Copilot, etc.
✅ **Biometric support** - Can integrate Face ID/Touch ID for auto-fill

## Troubleshooting

### Error: `DEVELOPER_ERROR`
**Cause**: Wrong SHA-1 fingerprint or package name
**Fix**: Verify certificate fingerprint and package name match in Google Cloud Console

### Error: `SIGN_IN_FAILED`
**Cause**: OAuth client ID not configured for iOS/Android
**Fix**: Ensure you created OAuth client IDs for both platforms

### Error: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` undefined
**Cause**: Environment variable not set or wrong name
**Fix**: Check `.env.local` exists and variables start with `EXPO_PUBLIC_`

### Error: Native module not found
**Cause**: Package not linked or native build needed
**Fix**: Run `expo prebuild` then `expo run:android` or `expo run:ios`

## Migration Checklist

- [ ] Added environment variables to `.env.local`
- [ ] Created OAuth client IDs in Google Cloud Console
- [ ] Downloaded GoogleService-Info.plist (iOS)
- [ ] Downloaded google-services.json (Android)
- [ ] Copied native config files to correct locations
- [ ] Tested on Android device in dark mode
- [ ] Tested on iOS device
- [ ] Verified sign-in completes successfully
- [ ] Verified user record created in MongoDB
- [ ] Updated backend environment variables (GOOGLE_CLIENT_ID)

## Next Steps

After configuration is complete and testing passes:
1. Remove old OAuth files if desired (WebBrowser-based)
2. Update documentation
3. Deploy backend changes to production
4. Test production build on both platforms
