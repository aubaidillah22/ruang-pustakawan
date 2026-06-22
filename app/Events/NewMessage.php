<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class NewMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('messages.' . $this->message->receiver_id),
        ];
    }

    public function broadcastWith(): array
    {
        $this->message->loadMissing('sender');

        return [
            'id' => $this->message->id,
            'sender_id' => $this->message->sender_id,
            'receiver_id' => $this->message->receiver_id,
            'message' => $this->message->message,
            'image' => $this->message->image,
            'sender_name' => $this->message->sender->fullname ?? 'Unknown',
            'sender_avatar' => $this->message->sender->avatar ?? 'default.svg',
            'time_formatted' => $this->message->created_at ? \Carbon\Carbon::parse($this->message->created_at)->format('H:i') : '',
        ];
    }
}
