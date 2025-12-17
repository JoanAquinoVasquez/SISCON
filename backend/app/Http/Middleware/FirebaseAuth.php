<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\FirebaseService;
use App\Models\User;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;

class FirebaseAuth
{
    protected FirebaseService $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Extract token from Authorization header
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'error' => 'No token provided',
                'message' => 'Authorization token is required'
            ], 401);
        }

        try {
            // Verify Firebase token
            $firebaseUser = $this->firebaseService->verifyIdToken($token);

            // Check if user email exists in database (WHITELIST VALIDATION)
            $user = User::where('email', $firebaseUser['email'])->first();

            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized',
                    'message' => 'Su correo electrónico no está autorizado para acceder a este sistema. Por favor, contacte con un administrador.'
                ], 403);
            }

            // Check if user is active
            if (!$user->is_active) {
                return response()->json([
                    'error' => 'Account disabled',
                    'message' => 'Su cuenta ha sido deshabilitada. Por favor, contacte con un administrador.'
                ], 403);
            }

            // Sync Firebase UID if not already set
            if (!$user->firebase_uid) {
                $user->firebase_uid = $firebaseUser['uid'];
                $user->save();
            }

            // Update name if changed in Firebase
            if ($user->name !== $firebaseUser['name']) {
                $user->name = $firebaseUser['name'];
                $user->save();
            }

            // Attach user to request
            $request->merge(['auth_user' => $user]);
            auth()->setUser($user);

        } catch (FailedToVerifyToken $e) {
            return response()->json([
                'error' => 'Invalid token',
                'message' => 'The provided token is invalid or expired'
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Authentication failed',
                'message' => 'Error al autenticar con Firebase: ' . $e->getMessage()
            ], 500);
        }

        return $next($request);
    }
}
