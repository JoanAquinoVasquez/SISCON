<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Google Sheets Service
    |--------------------------------------------------------------------------
    */

    'scopes' => ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],

    'access_type' => 'offline',

    'approval_prompt' => 'force',

    'prompt' => 'consent',

    'client_id' => env('GOOGLE_CLIENT_ID', ''),

    'client_secret' => env('GOOGLE_CLIENT_SECRET', ''),

    'redirect_uri' => env('GOOGLE_REDIRECT_URI', ''),

    /*
    |--------------------------------------------------------------------------
    | Package Service
    |--------------------------------------------------------------------------
    */

    'service' => \Revolution\Google\Sheets\Sheets::class,
];
