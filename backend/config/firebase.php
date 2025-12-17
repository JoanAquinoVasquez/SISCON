<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Firebase Credentials
    |--------------------------------------------------------------------------
    |
    | Path to the Firebase service account JSON file.
    | Download from: Firebase Console > Project Settings > Service Accounts
    |
    */
    'credentials' => [
        'file' => env('FIREBASE_CREDENTIALS', base_path('config/firebase_credentials.json')),
    ],
];
