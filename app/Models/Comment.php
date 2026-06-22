<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'post_id', 'comment', 'created_at'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($comment) {
            $comment->created_at = now();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
