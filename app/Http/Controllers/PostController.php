<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = Auth::user();
        $perPage = 20;
        $page = max(1, (int) $request->get('page', 1));

        $posts = Post::with('user')
            ->withCount(['likes', 'comments'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $posts->getCollection()->transform(function ($post) use ($currentUser) {
            $post->is_liked = $post->isLikedBy($currentUser);
            $isOwner = $post->user_id === $currentUser->id;
            $isAdmin = $currentUser->role === 'admin';
            $post->can_delete = $isOwner || $isAdmin;
            $post->can_edit = $isOwner || $isAdmin;
            $post->is_edited = $post->created_at->ne($post->updated_at);
            return $post;
        });

        if ($request->wantsJson()) {
            return response()->json([
                'posts' => $posts->items(),
                'has_more' => $posts->hasMorePages(),
            ]);
        }

        return Inertia::render('Feed', [
            'posts' => $posts->items(),
            'hasMore' => $posts->hasMorePages(),
        ]);
    }

    public function explore(Request $request)
    {
        $currentUser = Auth::user();
        $perPage = 10;
        $page = max(1, (int) $request->get('page', 1));

        // Trending posts: most liked + most commented
        $posts = Post::with('user')
            ->withCount(['likes', 'comments'])
            ->orderBy('likes_count', 'desc')
            ->orderBy('comments_count', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $posts->getCollection()->transform(function ($post) use ($currentUser) {
            $post->is_liked = $post->isLikedBy($currentUser);
            $isOwner = $post->user_id === $currentUser->id;
            $isAdmin = $currentUser->role === 'admin';
            $post->can_delete = $isOwner || $isAdmin;
            $post->can_edit = $isOwner || $isAdmin;
            $post->is_edited = $post->created_at->ne($post->updated_at);
            return $post;
        });

        // AJAX pagination request
        if ($request->wantsJson()) {
            return response()->json([
                'posts' => $posts->items(),
                'has_more' => $posts->hasMorePages(),
            ]);
        }

        // Suggested users to follow (exclude self & already following)
        $followingIds = \App\Models\Follow::where('follower_id', $currentUser->id)
            ->pluck('following_id')
            ->toArray();

        $suggestedUsers = \App\Models\User::withCount('posts')
            ->where('id', '!=', $currentUser->id)
            ->whereNotIn('id', $followingIds)
            ->inRandomOrder()
            ->take(6)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'fullname' => $u->fullname,
                    'username' => $u->username,
                    'avatar' => $u->avatar,
                    'avatar_url' => $u->avatar_url,
                    'bio' => $u->bio,
                    'posts_count' => $u->posts_count,
                ];
            });

        return Inertia::render('Explore', [
            'trendingPosts' => $posts->items(),
            'hasMore' => $posts->hasMorePages(),
            'suggestedUsers' => $suggestedUsers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'nullable|string|max:10000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:10240',
            'video' => 'nullable|mimes:mp4,webm,ogg,mov,avi|max:51200',
        ]);

        $content = trim($request->content ?? '');
        $imagePath = null;
        $videoPath = null;

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('assets/uploads'), $filename);
            $imagePath = 'assets/uploads/' . $filename;
        }

        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $filename = time() . '_vid_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('assets/uploads'), $filename);
            $videoPath = 'assets/uploads/' . $filename;
        }

        if (empty($content) && !$imagePath && !$videoPath) {
            return back()->withErrors(['content' => 'Post cannot be empty']);
        }

        $post = Post::create([
            'user_id' => Auth::id(),
            'content' => $content,
            'image' => $imagePath,
            'video' => $videoPath,
        ]);

        return redirect()->route('home')->with('success', 'Post created!');
    }

    public function update(Request $request)
    {
        $request->validate([
            'post_id' => 'required|exists:posts,id',
            'content' => 'nullable|string|max:10000',
        ]);

        $post = Post::findOrFail($request->post_id);

        $currentUser = Auth::user();
        if ($post->user_id !== $currentUser->id && $currentUser->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $post->update([
            'content' => trim($request->content ?? ''),
        ]);

        return response()->json(['success' => true, 'post' => $post]);
    }

    public function destroy(Request $request)
    {
        $request->validate(['post_id' => 'required|exists:posts,id']);

        $post = Post::findOrFail($request->post_id);
        $currentUser = Auth::user();

        if ($post->user_id !== $currentUser->id && $currentUser->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Delete associated images
        if ($post->image && file_exists(public_path($post->image))) {
            unlink(public_path($post->image));
        }
        if ($post->video && file_exists(public_path($post->video))) {
            unlink(public_path($post->video));
        }

        $post->delete();
        return response()->json(['success' => true]);
    }
}
