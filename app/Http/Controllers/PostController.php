<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    public function update(Request $request)
    {
        $userId = Auth::id();
        $postId = $request->post_id ?? 0;
        $content = trim($request->content ?? '');

        if (empty($content)) {
            return response()->json(['success' => false, 'message' => 'Content cannot be empty']);
        }

        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found']);
        }

        $currentUser = Auth::user();
        if ($post->user_id != $userId && !$currentUser->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized']);
        }

        $post->content = $content;
        $post->updated_at = now();
        $success = $post->save();

        return response()->json(['success' => $success]);
    }

    public function destroy(Request $request)
    {
        $userId = Auth::id();
        $postId = $request->post_id ?? 0;

        if (!$postId) {
            return response()->json(['success' => false, 'message' => 'No post ID']);
        }

        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found']);
        }

        $currentUser = Auth::user();
        if ($post->user_id != $userId && !$currentUser->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized']);
        }

        // Delete associated image file
        if ($post->image && file_exists(public_path($post->image))) {
            @unlink(public_path($post->image));
        }

        $success = $post->delete();

        return response()->json(['success' => $success]);
    }
}
