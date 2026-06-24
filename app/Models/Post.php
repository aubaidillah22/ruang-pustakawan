<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $appends = ['image_url', 'video_url', 'likes_count', 'comments_count'];

    protected $fillable = [
        'user_id',
        'content',
        'image',
        'video',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    // Accessors
    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }

    public function getCommentsCountAttribute()
    {
        return $this->comments()->count();
    }

    public function getImageUrlAttribute()
    {
        return $this->image ? asset($this->image) : null;
    }

    public function getVideoUrlAttribute()
    {
        return $this->video ? asset($this->video) : null;
    }

    public function isLikedBy(User $user)
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }
}
