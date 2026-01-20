<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Get the authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    /**
     * Redirect the user to the Google authentication page.
     *
     * @return \Illuminate\Http\RedirectResponse|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Obtain the user information from Google.
     *
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $email = $googleUser->getEmail();

            // Check if user exists
            $user = User::where('email', $email)->first();

            if (!$user) {
                // User not found, redirect with error
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
                return redirect("{$frontendUrl}/siscon/login?error=unregistered_user");
            }

            // Update user info
            $user->update([
                'google_id' => $googleUser->getId(),
                'name' => $googleUser->getName(),
                'avatar' => $googleUser->getAvatar(),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect to frontend with token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect("{$frontendUrl}/siscon/auth/callback?token={$token}");

        } catch (\Exception $e) {
            return response()->json(['error' => 'Authentication failed', 'message' => $e->getMessage()], 401);
        }
    }

    /**
     * Get the authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        $user = auth()->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'google_id' => $user->google_id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at,
            ]
        ]);
    }
}
