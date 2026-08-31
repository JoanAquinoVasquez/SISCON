<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class FileUpload extends Model
{
    protected $fillable = [
        'uuid',
        'uploadable_type',
        'uploadable_id',
        'status',
        'local_path',
        'drive_url',
        'original_name',
        'error_message',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (FileUpload $fileUpload) {
            if (empty($fileUpload->uuid)) {
                $fileUpload->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the parent uploadable model (Expediente, PagoDocente, Devolucion).
     */
    public function uploadable()
    {
        return $this->morphTo();
    }

    /**
     * Scope for pending uploads.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Check if upload is still in progress.
     */
    public function isInProgress(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }
}
