<?php

namespace App\Http\Controllers;

use App\Events\NewMessage;
use App\Events\NewNotification;
use App\Models\ChatMessage;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index()
    {
        $currentUser = Auth::user();
        $userId = $currentUser->id;

        // Get unique conversations
        $conversationUserIds = ChatMessage::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->selectRaw('CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as contact_id', [$userId])
            ->distinct()
            ->pluck('contact_id');

        $conversations = User::whereIn('id', $conversationUserIds)
            ->get()
            ->map(function ($user) use ($userId) {
                $lastMessage = ChatMessage::where(function ($q) use ($userId, $user) {
                    $q->where('sender_id', $userId)->where('receiver_id', $user->id);
                })->orWhere(function ($q) use ($userId, $user) {
                    $q->where('sender_id', $user->id)->where('receiver_id', $userId);
                })->latest()->first();

                $unreadCount = ChatMessage::where('sender_id', $user->id)
                    ->where('receiver_id', $userId)
                    ->where('is_read', false)
                    ->count();

                return [
                    'user' => $user,
                    'last_message' => $lastMessage,
                    'unread_count' => $unreadCount,
                    'is_online' => $user->isOnline(),
                ];
            })
            ->sortByDesc(function ($conv) {
                return $conv['last_message']?->created_at ?? now()->subYear();
            })
            ->values();

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(User $user)
    {
        $currentUser = Auth::user();

        if ($user->id === $currentUser->id) {
            return redirect()->route('messages.index');
        }

        // Mark messages as read
        ChatMessage::where('sender_id', $user->id)
            ->where('receiver_id', $currentUser->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        $messages = ChatMessage::where(function ($q) use ($currentUser, $user) {
            $q->where('sender_id', $currentUser->id)->where('receiver_id', $user->id);
        })->orWhere(function ($q) use ($currentUser, $user) {
            $q->where('sender_id', $user->id)->where('receiver_id', $currentUser->id);
        })->with('sender')->orderBy('created_at', 'asc')->get();

        return Inertia::render('Messages/Show', [
            'conversationUser' => $user,
            'messages' => $messages,
            'isOnline' => $user->isOnline(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:10000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:5120',
        ]);

        $senderId = Auth::id();

        if ($request->receiver_id == $senderId) {
            return response()->json(['success' => false, 'message' => 'Cannot send message to yourself']);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_chat_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('assets/uploads/chat'), $filename);
            $imagePath = 'assets/uploads/chat/' . $filename;
        }

        if (empty($request->message) && !$imagePath) {
            return response()->json(['success' => false, 'message' => 'Message cannot be empty']);
        }

        $message = ChatMessage::create([
            'sender_id' => $senderId,
            'receiver_id' => $request->receiver_id,
            'message' => trim($request->message ?? ''),
            'image' => $imagePath,
        ]);

        $message->load('sender');

        // Broadcast real-time
        try {
            broadcast(new NewMessage($message))->toOthers();
        } catch (\Throwable $e) {}

        // Send notification
        try {
            $notification = Notification::create([
                'user_id' => $request->receiver_id,
                'from_user_id' => $senderId,
                'type' => 'message',
                'message' => substr(trim($request->message ?? '(image)'), 0, 100),
            ]);
            broadcast(new NewNotification($notification))->toOthers();
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    public function fetch(User $user, Request $request)
    {
        $currentUser = Auth::user();
        $offset = $request->get('offset', 0);
        $limit = 30;

        $messages = ChatMessage::where(function ($q) use ($currentUser, $user) {
            $q->where('sender_id', $currentUser->id)->where('receiver_id', $user->id);
        })->orWhere(function ($q) use ($currentUser, $user) {
            $q->where('sender_id', $user->id)->where('receiver_id', $currentUser->id);
        })->with('sender')
            ->orderBy('created_at', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get()
            ->reverse()
            ->values();

        return response()->json([
            'messages' => $messages,
            'has_more' => $messages->count() >= $limit,
        ]);
    }

    public function markRead(User $user)
    {
        $currentUser = Auth::user();

        ChatMessage::where('sender_id', $user->id)
            ->where('receiver_id', $currentUser->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function unreadCount()
    {
        $count = ChatMessage::where('receiver_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function status()
    {
        $users = User::where('id', '!=', Auth::id())
            ->select('id', 'fullname', 'last_seen_at')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'fullname' => $user->fullname,
                    'is_online' => $user->isOnline(),
                ];
            });

        return response()->json($users);
    }
}
