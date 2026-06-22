<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\Post;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = Auth::user();
        $postsPerPage = 20;
        $page = max(1, (int) $request->get('page', 1));

        // AJAX pagination
        if ($request->ajax()) {
            $posts = Post::with('user')
                ->withCount(['likes', 'comments'])
                ->orderBy('created_at', 'desc')
                ->skip(($page - 1) * $postsPerPage)
                ->take($postsPerPage)
                ->get();

            $totalAll = Post::count();
            $hasMore = ($page * $postsPerPage) < $totalAll;

            $result = $posts->map(function ($post) use ($currentUser) {
                return [
                    'id' => $post->id,
                    'html' => view('partials.post', ['post' => $post, 'currentUser' => $currentUser])->render(),
                ];
            });

            return response()->json(['posts' => $result, 'has_more' => $hasMore]);
        }

        // Handle post creation
        if ($request->isMethod('post') && $request->has('post_content')) {
            return $this->createPost($request);
        }

        // Initial page load
        $posts = Post::with('user')
            ->withCount(['likes', 'comments'])
            ->orderBy('created_at', 'desc')
            ->take($postsPerPage)
            ->get();

        $totalAll = Post::count();
        $hasMore = $totalAll > $postsPerPage;

        // Stories members
        $members = User::where('id', '!=', $currentUser->id)
            ->inRandomOrder()
            ->limit(10)
            ->get();

        return view('home', compact(
            'currentUser', 'posts', 'hasMore', 'members'
        ));
    }

    private function createPost(Request $request)
    {
        $request->validate(['post_content' => 'nullable|string']);

        $content = trim($request->post_content ?? '');
        $imagePath = null;
        $videoPath = null;

        if ($request->hasFile('post_image')) {
            $file = $request->file('post_image');
            $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (in_array($file->getClientOriginalExtension(), $allowed)) {
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('assets/uploads'), $filename);
                $imagePath = 'assets/uploads/' . $filename;
            }
        }

        if ($request->hasFile('post_video')) {
            $file = $request->file('post_video');
            $allowed = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
            if (in_array($file->getClientOriginalExtension(), $allowed)) {
                $filename = time() . '_vid_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('assets/uploads'), $filename);
                $videoPath = 'assets/uploads/' . $filename;
            }
        }

        if (!empty($content) || $imagePath || $videoPath) {
            Post::create([
                'user_id' => Auth::id(),
                'content' => $content,
                'image' => $imagePath,
                'video' => $videoPath,
            ]);
        }

        return redirect()->route('home');
    }
}
