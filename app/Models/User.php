<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'email',
        'password',
        'fullname',
        'bio',
        'avatar',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

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

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function isOnline(): bool
    {
        return $this->last_seen_at && \Carbon\Carbon::parse($this->last_seen_at)->diffInMinutes(now()) < 5;
    }

    public function isFollowing(int $userId): bool
    {
        return Follow::where('follower_id', $this->id)
            ->where('following_id', $userId)
            ->exists();
    }

    public function hasLiked(int $postId): bool
    {
        return Like::where('user_id', $this->id)
            ->where('post_id', $postId)
            ->exists();
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function getAvatarUrlAttribute(): string
    {
        if (empty($this->avatar) || $this->avatar === 'default.svg') {
            return asset('assets/avatars/default.svg');
        }
        return asset('assets/avatars/' . $this->avatar);
    }
}
