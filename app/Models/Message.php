<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    public $timestamps = false;

    protected $fillable = ['sender_id', 'receiver_id', 'message', 'image', 'created_at', 'is_read', 'read_at'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($message) {
            $message->created_at = now();
        });
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
