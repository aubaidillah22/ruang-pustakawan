<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $currentUser = Auth::user();
        $viewUserId = $request->get('id') ? (int) $request->get('id') : $currentUser->id;
        $isOwnProfile = ($viewUserId === (int) $currentUser->id);

        $profileUser = User::findOrFail($viewUserId);

        // Fetch user's posts with counts
        $myPosts = Post::with('user')
            ->withCount(['likes', 'comments'])
            ->where('user_id', $viewUserId)
            ->orderBy('created_at', 'desc')
            ->get();

        $totalLikes = $myPosts->sum('likes_count');
        $totalPosts = $myPosts->count();

        // Follower/following counts
        $followersCount = Follow::where('following_id', $viewUserId)->count();
        $followingCount = Follow::where('follower_id', $viewUserId)->count();

        // Check if current user follows this profile
        $isFollowing = false;
        if (!$isOwnProfile) {
            $isFollowing = $currentUser->isFollowing($viewUserId);
        }

        return view('profile', compact(
            'currentUser', 'profileUser', 'myPosts', 'totalLikes', 'totalPosts',
            'followersCount', 'followingCount', 'isFollowing', 'isOwnProfile'
        ));
    }

    public function update(Request $request)
    {
        $currentUser = Auth::user();

        $rules = [
            'fullname' => 'required|string|max:100',
            'bio' => 'nullable|string',
            'username' => 'nullable|string|min:3|max:50|regex:/^[a-z0-9_]+$/|unique:users,username,' . $currentUser->id,
            'current_password' => 'nullable|required_with:new_password|current_password',
            'new_password' => 'nullable|min:8|confirmed',
        ];

        $messages = [
            'username.regex' => 'Username hanya boleh huruf kecil, angka, dan underscore',
            'username.unique' => 'Username sudah digunakan',
            'current_password.current_password' => 'Password saat ini tidak cocok',
            'new_password.confirmed' => 'Konfirmasi password tidak cocok',
            'new_password.min' => 'Password minimal 8 karakter',
        ];

        $request->validate($rules, $messages);

        $currentUser->fullname = trim($request->fullname);
        $currentUser->bio = trim($request->bio ?? '');

        if ($request->filled('username')) {
            $currentUser->username = trim($request->username);
        }

        if ($request->filled('new_password')) {
            $currentUser->password = bcrypt($request->new_password);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (in_array($file->getClientOriginalExtension(), $allowed)) {
                $filename = 'avatar_' . $currentUser->id . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('assets/avatars'), $filename);
                $currentUser->avatar = $filename;
            }
        }

        $currentUser->save();

        return redirect()->route('profile')->with('success', 'Profil berhasil diperbarui');
    }
}
