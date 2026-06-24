<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Notification channel - only the user can listen to their own notifications
Broadcast::channel('notifications.{userId}', function (User $user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Chat channel - only the receiver can listen to incoming messages
Broadcast::channel('chat.{userId}', function (User $user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Presence channel for online status
Broadcast::channel('online', function (User $user) {
    return [
        'id' => $user->id,
        'fullname' => $user->fullname,
        'avatar' => $user->avatar ?? 'default.svg',
    ];
});
