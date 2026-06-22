<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['users' => [], 'posts' => []]);
        }

        $query = trim($request->get('q', ''));

        if (strlen($query) < 2) {
            return response()->json(['users' => [], 'posts' => []]);
        }

        $searchTerm = '%' . $query . '%';

        // Search users
        $users = User::where('username', 'like', $searchTerm)
            ->orWhere('fullname', 'like', $searchTerm)
            ->orderBy('fullname')
            ->limit(10)
            ->get(['id', 'username', 'fullname', 'avatar']);

        // Search posts
        $posts = Post::with('user')
            ->where('content', 'like', $searchTerm)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($p) {
                $p->time_ago = $this->timeAgo($p->created_at);
                if (strlen($p->content) > 100) {
                    $p->content = substr($p->content, 0, 100) . '...';
                }
                return $p;
            });

        return response()->json(['users' => $users, 'posts' => $posts]);
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
