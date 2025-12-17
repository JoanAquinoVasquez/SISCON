# Firebase Authentication - Setup Instructions

## 📋 Prerequisites

1. Access to Firebase Console
2. Laravel backend running
3. React frontend with Firebase Auth configured

## 🔧 Backend Setup

### Step 1: Download Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Project Settings** (gear icon)
4. Navigate to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded JSON file as `firebase_credentials.json`
7. Move it to `backend/config/firebase_credentials.json`

### Step 2: Configure Environment Variables

Add this line to your `.env` file:

2. **Frontend**: Gets Firebase ID token from authenticated user
3. **Frontend**: Sends token in `Authorization: Bearer {token}` header
4. **Backend**: Middleware verifies token with Firebase
5. **Backend**: Checks if user email exists in database (whitelist)
6. **Backend**: If authorized, allows access to API

### Whitelist Validation

The system uses **email-based whitelist**:

-   ✅ User exists in database → Access granted
-   ❌ User not in database → 403 Forbidden
-   ❌ User is_active = false → 403 Account disabled

## 🧪 Testing

### Test Authentication

1. **Login in Frontend**:

    - Open your React app
    - Sign in with Google
    - Check browser console for Firebase user

2. **Get Firebase Token**:

    ```javascript
    // In browser console
    const user = auth.currentUser;
    const token = await user.getIdToken();
    console.log(token);
    ```

3. **Test API Call**:

    ```bash
    curl -X GET http://localhost:8000/api/auth/me \
      -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
    ```

    Expected response:

    ```json
    {
        "user": {
            "id": 1,
            "firebase_uid": "abc123...",
            "name": "Admin User",
            "email": "admin@example.com",
            "role": "admin",
            "is_active": true
        }
    }
    ```

### Test Whitelist

1. **Try with unauthorized email**:

    - Sign in with email not in database
    - Should get 403 error: "Your email is not authorized"

2. **Try with disabled account**:
    - Set `is_active = 0` in database
    - Should get 403 error: "Your account has been disabled"

## 🚨 Troubleshooting

### Error: "Firebase credentials file not found"

**Solution**: Make sure `firebase_credentials.json` is in `backend/config/` directory

### Error: "Your email is not authorized"

**Solution**: Add user email to database:

```bash
php artisan tinker
User::create(['name' => 'Name', 'email' => 'email@example.com', 'role' => 'user', 'is_active' => true]);
```

### Error: "Invalid token"

**Causes**:

-   Token expired (Firebase tokens last 1 hour)
-   Token format incorrect
-   Wrong Firebase project

**Solution**: Get fresh token from frontend

### Error: "Class 'Kreait\Firebase\Factory' not found"

**Solution**: Run `composer install` to ensure Firebase SDK is installed

## 📝 Managing Users

### Add New User

1. Create in database:

    ```bash
    php artisan tinker
    User::create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'role' => 'user',
        'is_active' => true
    ]);
    ```

2. Create in Firebase Console (or let them sign up with Google)

### Disable User

```bash
php artisan tinker
User::where('email', 'user@example.com')->update(['is_active' => false]);
```

### Change User Role

```bash
php artisan tinker
User::where('email', 'user@example.com')->update(['role' => 'admin']);
```

## 🔐 Security Notes

-   ✅ Firebase credentials file is in `.gitignore`
-   ✅ Only whitelisted emails can access API
-   ✅ Tokens are verified server-side
-   ✅ Tokens expire after 1 hour
-   ⚠️ Never commit `firebase_credentials.json` to Git
-   ⚠️ Keep your Firebase project private

## 📚 Next Steps

1. Update frontend to send Firebase tokens in API calls
2. Test all API endpoints with authentication
3. Implement role-based permissions (admin vs user)
4. Add logging for authentication attempts
5. Set up Firebase security rules
