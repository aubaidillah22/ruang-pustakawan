<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'from_user_id', 'type', 'post_id', 'is_read', 'created_at'];

    protected $appends = ['message'];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($notification) {
            $notification->created_at = now();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function getMessageAttribute(): string
    {
        return match ($this->type) {
            'like' => 'menyukai postingan Anda',
            'comment' => 'mengomentari postingan Anda',
            'follow' => 'mulai mengikuti Anda',
            'message' => 'mengirimi Anda pesan',
            default => 'berinteraksi dengan Anda',
        };
    }
}
