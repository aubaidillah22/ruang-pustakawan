<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = 20;
        $page = max(1, (int) $request->get('page', 1));

        $notifications = Notification::with('fromUser')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Transform time_ago for each notification
        $notifications->getCollection()->transform(function ($notif) {
            $notif->time_ago = $notif->created_at->diffForHumans();
            return $notif;
        });

        // AJAX pagination request
        if ($request->wantsJson()) {
            return response()->json([
                'notifications' => $notifications->items(),
                'has_more' => $notifications->hasMorePages(),
            ]);
        }

        return Inertia::render('Notifications', [
            'notifications' => $notifications->items(),
            'hasMore' => $notifications->hasMorePages(),
        ]);
    }

    public function markRead(Request $request)
    {
        $request->validate(['id' => 'required|exists:notifications,id']);

        Notification::where('id', $request->id)
            ->where('user_id', Auth::id())
            ->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    public function markAllRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    public function unreadCount()
    {
        $count = Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function latest()
    {
        $notifications = Notification::with('fromUser')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json($notifications);
    }
}
