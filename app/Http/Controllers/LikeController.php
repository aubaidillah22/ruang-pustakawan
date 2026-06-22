<?php

namespace App\Http\Controllers;

use App\Events\NewNotification;
use App\Models\Like;
use App\Models\Notification;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function toggle(Request $request)
    {
        $userId = Auth::id();
        $postId = $request->post_id ?? 0;

        if (!$postId) {
            return response()->json(['success' => false, 'message' => 'No post ID']);
        }

        $existing = Like::where('user_id', $userId)->where('post_id', $postId)->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            Like::create(['user_id' => $userId, 'post_id' => $postId]);
            $liked = true;

            // Create notification for post owner
            $post = Post::find($postId);
            if ($post && $post->user_id != $userId) {
                $notification = Notification::create([
                    'user_id' => $post->user_id,
                    'from_user_id' => $userId,
                    'type' => 'like',
                    'post_id' => $postId,
                ]);
                try { broadcast(new NewNotification($notification)); } catch (\Throwable $e) { }
            }
        }

        $likeCount = Like::where('post_id', $postId)->count();

        return response()->json([
            'success' => true,
            'liked' => $liked,
            'like_count' => $likeCount,
        ]);
    }
}
