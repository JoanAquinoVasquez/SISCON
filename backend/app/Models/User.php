<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'firebase_uid',
        'name',
        'email',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    // Scopes
    public function scopeByFirebaseUid($query, string $uid)
    {
        return $query->where('firebase_uid', $uid);
    }

    // Check if user is admin
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    // Create user from Firebase data
    public static function createFromFirebase(array $firebaseUser): self
    {
        return self::create([
            'firebase_uid' => $firebaseUser['uid'],
            'name' => $firebaseUser['name'] ?? 'User',
            'email' => $firebaseUser['email'],
            'role' => 'user',
            'is_active' => true,
        ]);
    }
}