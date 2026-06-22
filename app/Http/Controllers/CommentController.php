<?php

namespace App\Http\Controllers;

use App\Events\NewNotification;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $userId = Auth::id();
        $postId = $request->post_id ?? 0;
        $comment = trim($request->comment ?? '');

        if (empty($comment)) {
            return response()->json(['success' => false, 'message' => 'Comment is empty']);
        }

        $success = Comment::create([
            'user_id' => $userId,
            'post_id' => $postId,
            'comment' => $comment,
        ]);

        // Create notification for post owner
        if ($success) {
            $post = Post::find($postId);
            if ($post && $post->user_id != $userId) {
                $notification = Notification::create([
                    'user_id' => $post->user_id,
                    'from_user_id' => $userId,
                    'type' => 'comment',
                    'post_id' => $postId,
                ]);
                try { broadcast(new NewNotification($notification)); } catch (\Throwable $e) { }
            }
        }

        return response()->json(['success' => (bool) $success]);
    }

    public function index(Request $request)
    {
        $postId = $request->get('post_id', 0);

        $comments = Comment::with('user')
            ->where('post_id', $postId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($c) {
                $c->time_ago = $this->timeAgo($c->created_at);
                $c->avatar = $c->user->avatar ?? 'default.svg';
                $c->fullname = $c->user->fullname;
                return $c;
            });

        return response()->json($comments);
    }

    private function timeAgo($timestamp): string
    {
        if (!$timestamp) return "Baru saja";
        $now = Carbon::now('Asia/Jakarta');
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
