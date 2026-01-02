<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth as FirebaseAuth;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;
use Exception;

class FirebaseService
{
    protected FirebaseAuth $auth;

    public function __construct()
    {
        // Use base_path to get absolute path
        $credentialsPath = base_path('config/firebase_credentials.json');

        if (!file_exists($credentialsPath)) {
            throw new Exception("Firebase credentials file not found at: {$credentialsPath}. Please download it from Firebase Console.");
        }

        try {
            $factory = (new Factory)->withServiceAccount($credentialsPath);
            $this->auth = $factory->createAuth();
        } catch (\Exception $e) {
            throw new Exception("Failed to initialize Firebase: " . $e->getMessage());
        }
    }

    /**
     * Verify Firebase ID token
     *
     * @param string $idToken
     * @return array User data from token
     * @throws FailedToVerifyToken
     */
    public function verifyIdToken(string $idToken): array
    {
        try {
            // Add leeway to handle clock skew between servers (5 minutes tolerance)
            $verifiedIdToken = $this->auth->verifyIdToken($idToken, true, 300);

            return [
                'uid' => $verifiedIdToken->claims()->get('sub'),
                'email' => $verifiedIdToken->claims()->get('email'),
                'name' => $verifiedIdToken->claims()->get('name'),
                'email_verified' => $verifiedIdToken->claims()->get('email_verified'),
            ];
        } catch (FailedToVerifyToken $e) {
            throw $e;
        }
    }

    /**
     * Get Firebase user by UID
     *
     * @param string $uid
     * @return \Kreait\Firebase\Auth\UserRecord
     */
    public function getUser(string $uid)
    {
        return $this->auth->getUser($uid);
    }

    /**
     * Create a new Firebase user
     *
     * @param array $userData
     * @return \Kreait\Firebase\Auth\UserRecord
     */
    public function createUser(array $userData)
    {
        return $this->auth->createUser($userData);
    }

    /**
     * Delete Firebase user
     *
     * @param string $uid
     * @return void
     */
    public function deleteUser(string $uid): void
    {
        $this->auth->deleteUser($uid);
    }

    /**
     * Update Firebase user
     *
     * @param string $uid
     * @param array $properties
     * @return \Kreait\Firebase\Auth\UserRecord
     */
    public function updateUser(string $uid, array $properties)
    {
        return $this->auth->updateUser($uid, $properties);
    }
}
