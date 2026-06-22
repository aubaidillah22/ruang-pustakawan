<?php

namespace App\Http\Controllers;

use App\Events\NewMessage;
use App\Events\NewNotification;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class MessageController extends Controller
{
    private function getUser(): User
    {
        return Auth::user();
    }

    public function index()
    {
        $currentUser = $this->getUser();
        $userId = $currentUser->id;

        $conversations = Message::with('sender:id,fullname,avatar,last_seen_at', 'receiver:id,fullname,avatar,last_seen_at')
            ->where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->unique(function ($msg) use ($userId) {
                return $msg->sender_id === $userId ? $msg->receiver_id : $msg->sender_id;
            })
            ->values()
            ->map(function ($msg) use ($userId) {
                $otherId = $msg->sender_id === $userId ? $msg->receiver_id : $msg->sender_id;
                $otherUser = $msg->sender_id === $userId ? $msg->receiver : $msg->sender;

                $msg->other_user = $otherUser;
                $msg->unread_count = $this->getUnreadCount($userId, $otherId);
                $msg->is_online = $otherUser && $otherUser->last_seen_at &&
                    Carbon::parse($otherUser->last_seen_at)->diffInMinutes(now()) < 5;
                return $msg;
            });

        return view('messages.index', compact('currentUser', 'conversations'));
    }

    public function show(User $user)
    {
        $currentUser = $this->getUser();

        if ($user->id === $currentUser->id) {
            return redirect()->route('messages.index');
        }

        // Mark messages as read
        Message::where('sender_id', $user->id)
            ->where('receiver_id', $currentUser->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        // Load only last 20 messages initially
        $messages = Message::with('sender:id,fullname,avatar')
            ->where(function ($q) use ($currentUser, $user) {
                $q->where('sender_id', $currentUser->id)->where('receiver_id', $user->id);
            })->orWhere(function ($q) use ($currentUser, $user) {
                $q->where('sender_id', $user->id)->where('receiver_id', $currentUser->id);
            })->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->reverse()
            ->values();

        $totalMessages = Message::where(function ($q) use ($currentUser, $user) {
            $q->where('sender_id', $currentUser->id)->where('receiver_id', $user->id);
        })->orWhere(function ($q) use ($currentUser, $user) {
            $q->where('sender_id', $user->id)->where('receiver_id', $currentUser->id);
        })->count();

        $hasMore = $totalMessages > 20;

        return view('messages.show', compact('currentUser', 'messages', 'user', 'hasMore'));
    }

    public function fetch(User $user, Request $request)
    {
        $currentUser = $this->getUser();
        $offset = max(0, (int) $request->get('offset', 0));
        $limit = 20;

        $messages = Message::with('sender:id,fullname,avatar')
            ->where(function ($q) use ($currentUser, $user) {
                $q->where('sender_id', $currentUser->id)->where('receiver_id', $user->id);
            })->orWhere(function ($q) use ($currentUser, $user) {
                $q->where('sender_id', $user->id)->where('receiver_id', $currentUser->id);
            })->orderBy('created_at', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get()
            ->reverse()
            ->values()
            ->map(function ($msg) {
                $msg->time_formatted = $msg->created_at ? Carbon::parse($msg->created_at)->format('H:i') : '';
                return $msg;
            });

        $totalMessages = Message::where(function ($q) use ($currentUser, $user) {
            $q->where('sender_id', $currentUser->id)->where('receiver_id', $user->id);
        })->orWhere(function ($q) use ($currentUser, $user) {
            $q->where('sender_id', $user->id)->where('receiver_id', $currentUser->id);
        })->count();

        $hasMore = ($offset + $limit) < $totalMessages;

        return response()->json([
            'messages' => $messages,
            'has_more' => $hasMore,
            'next_offset' => $offset + $limit,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:1000',
        ]);

        $senderId = Auth::id();
        $receiverId = $request->receiver_id;
        $text = trim($request->message ?? '');
        $imagePath = null;

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (in_array($file->getClientOriginalExtension(), $allowed)) {
                $filename = 'chat_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('assets/uploads'), $filename);
                $imagePath = 'assets/uploads/' . $filename;
            }
        }

        if (empty($text) && !$imagePath) {
            return response()->json(['success' => false, 'message' => 'Pesan tidak boleh kosong']);
        }

        $message = Message::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'message' => $text,
            'image' => $imagePath,
        ]);

        $message->load('sender:id,fullname,avatar');
        $message->time_formatted = $message->created_at ? Carbon::parse($message->created_at)->format('H:i') : '';

        try { broadcast(new NewMessage($message)); } catch (\Throwable $e) { }

        // Create notification for receiver
        if ($receiverId !== $senderId) {
            $notification = Notification::create([
                'user_id' => $receiverId,
                'from_user_id' => $senderId,
                'type' => 'message',
                'post_id' => null,
            ]);
            try { broadcast(new NewNotification($notification)); } catch (\Throwable $e) { }
        }

        // Clear cache for both users
        Cache::forget("unread.{$receiverId}.{$senderId}");
        Cache::forget("unread.total.{$receiverId}");

        return response()->json(['success' => true, 'message' => $message]);
    }

    public function unreadCount()
    {
        $userId = Auth::id();

        $count = Cache::remember("unread.total.{$userId}", 30, function () use ($userId) {
            return Message::where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();
        });

        return response()->json(['count' => $count]);
    }

    public function conversations()
    {
        $currentUser = $this->getUser();
        $userId = $currentUser->id;

        $conversations = Message::with('sender:id,fullname,avatar,last_seen_at', 'receiver:id,fullname,avatar,last_seen_at')
            ->where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->unique(function ($msg) use ($userId) {
                return $msg->sender_id === $userId ? $msg->receiver_id : $msg->sender_id;
            })
            ->values()
            ->map(function ($msg) use ($userId) {
                $otherId = $msg->sender_id === $userId ? $msg->receiver_id : $msg->sender_id;
                $otherUser = $msg->sender_id === $userId ? $msg->receiver : $msg->sender;

                $lastMsg = Message::where(function ($q) use ($userId, $otherId) {
                    $q->where('sender_id', $userId)->where('receiver_id', $otherId);
                })->orWhere(function ($q) use ($userId, $otherId) {
                    $q->where('sender_id', $otherId)->where('receiver_id', $userId);
                })->orderBy('created_at', 'desc')->first();

                return [
                    'user_id' => $otherId,
                    'fullname' => $otherUser->fullname ?? 'Unknown',
                    'username' => $otherUser->username ?? '',
                    'avatar_url' => $otherUser->avatar_url ?? asset('assets/avatars/default.svg'),
                    'is_online' => $otherUser && $otherUser->last_seen_at &&
                        Carbon::parse($otherUser->last_seen_at)->diffInMinutes(now()) < 5,
                    'last_message' => $lastMsg ? ($lastMsg->message ? \Str::limit($lastMsg->message, 50) : '[Gambar]') : '',
                    'last_time' => $lastMsg && $lastMsg->created_at ? Carbon::parse($lastMsg->created_at)->diffForHumans() : '',
                    'unread_count' => $this->getUnreadCount($userId, $otherId),
                ];
            });

        return response()->json($conversations);
    }

    public function markRead(User $user)
    {
        $currentUser = $this->getUser();

        Message::where('sender_id', $user->id)
            ->where('receiver_id', $currentUser->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        Cache::forget("unread.total.{$currentUser->id}");
        Cache::forget("unread.{$currentUser->id}.{$user->id}");

        return response()->json(['success' => true]);
    }

    private function getUnreadCount(int $userId, int $otherId): int
    {
        return Cache::remember("unread.{$userId}.{$otherId}", 30, function () use ($userId, $otherId) {
            return Message::where('sender_id', $otherId)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();
        });
    }

    public function status($user)
    {
        $otherUser = User::findOrFail($user);
        return response()->json([
            'online' => $otherUser->isOnline(),
            'last_seen' => $otherUser->last_seen_at
                ? \Carbon\Carbon::parse($otherUser->last_seen_at)->diffForHumans()
                : null,
        ]);
    }

    public function typing(Request $request, $user)
    {
        $senderId = Auth::id();
        Cache::put("typing.{$user}.{$senderId}", true, now()->addSeconds(10));
        return response()->json(['success' => true]);
    }

    public function checkTyping(Request $request, $user)
    {
        $userId = Auth::id();
        $isTyping = Cache::get("typing.{$userId}.{$user}", false);
        return response()->json(['typing' => (bool) $isTyping]);
    }
}
