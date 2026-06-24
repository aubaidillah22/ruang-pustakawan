<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class NewNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public $notification;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications.' . $this->notification->user_id),
        ];
    }

    public function broadcastWith(): array
    {
        $this->notification->loadMissing('fromUser');
        return [
            'id' => $this->notification->id,
            'type' => $this->notification->type,
            'message' => $this->notification->message,
            'fullname' => $this->notification->fromUser->fullname ?? 'Unknown',
            'avatar' => $this->notification->fromUser->avatar ?? 'default.svg',
            'time_ago' => $this->notification->created_at?->diffForHumans() ?? '',
            'is_read' => false,
        ];
    }
}
