<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('presence-online', function ($user) {
    return ['id' => $user->id, 'name' => $user->fullname];
}, ['guards' => ['web']]);
