<?php

namespace App\Http\Controllers;

use App\Events\NewNotification;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $userId = Auth::id();

        $request->validate([
            'post_id' => 'required|exists:posts,id',
            'comment' => 'required|string|max:5000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = Comment::create([
            'user_id' => $userId,
            'post_id' => $request->post_id,
            'parent_id' => $request->parent_id,
            'comment' => trim($request->comment),
        ]);

        // Send notification to post owner
        $post = Post::find($request->post_id);
        if ($post && $post->user_id != $userId) {
            $notification = Notification::create([
                'user_id' => $post->user_id,
                'from_user_id' => $userId,
                'type' => 'comment',
                'post_id' => $request->post_id,
            ]);
            try { broadcast(new NewNotification($notification)); } catch (\Throwable $e) {}
        }

        $comment->load('user');
        $comment->time_ago = $this->timeAgo($comment->created_at);

        return response()->json([
            'success' => true,
            'comment' => $comment,
        ]);
    }

    public function index(Request $request)
    {
        $request->validate(['post_id' => 'required|exists:posts,id']);

        $comments = Comment::with('user')
            ->where('post_id', $request->post_id)
            ->whereNull('parent_id')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($comment) {
                $comment->time_ago = $this->timeAgo($comment->created_at);
                $comment->replies = Comment::with('user')
                    ->where('parent_id', $comment->id)
                    ->orderBy('created_at', 'asc')
                    ->get()
                    ->map(function ($reply) {
                        $reply->time_ago = $this->timeAgo($reply->created_at);
                        return $reply;
                    });
                return $comment;
            });

        return response()->json($comments);
    }

    private function timeAgo($timestamp): string
    {
        if (!$timestamp) return 'Baru saja';
        $now = now();
        $time = $timestamp;
        $diffMinutes = (int) $now->diffInMinutes($time);
        $diffHours = (int) $now->diffInHours($time);
        $diffDays = (int) $now->diffInDays($time);

        if ($diffMinutes < 1) return 'Baru saja';
        if ($diffMinutes < 60) return $diffMinutes . ' menit lalu';
        if ($diffHours < 24) return $diffHours . ' jam lalu';
        if ($diffDays < 7) return $diffDays . ' hari lalu';
        return $time->format('d M Y');
    }
}
