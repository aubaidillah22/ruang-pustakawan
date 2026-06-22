<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Follow extends Model
{
    public $timestamps = false;

    protected $fillable = ['follower_id', 'following_id', 'created_at'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($follow) {
            $follow->created_at = now();
        });
    }

    public function follower()
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    public function following()
    {
        return $this->belongsTo(User::class, 'following_id');
    }
}
