<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'username',
        'email',
        'password',
        'fullname',
        'bio',
        'avatar',
        'role',
        'last_seen_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function followers()
    {
        return $this->hasMany(Follow::class, 'following_id');
    }

    public function following()
    {
        return $this->hasMany(Follow::class, 'follower_id');
    }

    public function sentMessages()
    {
        return $this->hasMany(ChatMessage::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(ChatMessage::class, 'receiver_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Accessors
    public function getFollowersCountAttribute()
    {
        return $this->followers()->count();
    }

    public function getFollowingCountAttribute()
    {
        return $this->following()->count();
    }

    public function getPostsCountAttribute()
    {
        return $this->posts()->count();
    }

    public function getAvatarUrlAttribute()
    {
        return $this->avatar
            ? asset('assets/avatars/' . $this->avatar)
            : asset('assets/avatars/default.svg');
    }

    public function isOnline()
    {
        if (!$this->last_seen_at) return false;
        return $this->last_seen_at->gt(now()->subMinutes(5));
    }

    public function isFollowedBy(User $user)
    {
        return Follow::where('follower_id', $user->id)
            ->where('following_id', $this->id)
            ->exists();
    }
}
