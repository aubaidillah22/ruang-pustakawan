<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function handle(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['notifications' => [], 'count' => 0]);
        }

        $userId = Auth::id();
        $action = $request->get('action') ?? $request->input('action') ?? '';

        // Mark all as read
        if ($action === 'mark_read') {
            Notification::where('user_id', $userId)
                ->where('is_read', false)
                ->update(['is_read' => true]);
            return response()->json(['success' => true]);
        }

        // Get unread count
        if ($action === 'count') {
            $count = Notification::where('user_id', $userId)
                ->where('is_read', false)
                ->count();
            return response()->json(['count' => $count]);
        }

        // Get notifications
        if ($action === 'get') {
            $notifications = Notification::with(['fromUser', 'post'])
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get()
                ->map(function ($n) {
                    $n->time_ago = $this->timeAgo($n->created_at);
                    $n->fullname = $n->fromUser->fullname ?? 'Unknown';
                    $n->avatar = $n->fromUser->avatar ?? 'default.svg';
                    return $n;
                });

            return response()->json(['notifications' => $notifications]);
        }

        return response()->json(['notifications' => []]);
    }

    private function timeAgo($timestamp): string
    {
        if (!$timestamp) return "Baru saja";
        $now = Carbon::now();
        $time = Carbon::parse($timestamp);
        $diffMinutes = (int) $now->diffInMinutes($time);
        $diffHours = (int) $now->diffInHours($time);
        $diffDays = (int) $now->diffInDays($time);

        if ($diffMinutes < 1) return "Baru saja";
        if ($diffMinutes < 60) return $diffMinutes . " menit lalu";
        if ($diffHours < 24) return $diffHours . " jam lalu";
        if ($diffDays < 7) return $diffDays . " hari lalu";
        return $time->format('d M Y');
    }
}
