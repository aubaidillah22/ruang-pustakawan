<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show(?User $user = null)
    {
        $currentUser = Auth::user();
        $profileUser = $user ?: $currentUser;

        $isOwnProfile = $profileUser->id === $currentUser->id;
        $isFollowing = $isOwnProfile ? false : $profileUser->isFollowedBy($currentUser);

        $posts = $profileUser->posts()
            ->withCount(['likes', 'comments'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $posts->getCollection()->transform(function ($post) use ($currentUser) {
            $post->is_liked = $post->isLikedBy($currentUser);
            return $post;
        });

        return Inertia::render('Profile/Show', [
            'profileUser' => $profileUser->loadCount(['posts', 'followers', 'following' => function ($q) {
                $q->where('follower_id', Auth::id());
            }]),
            'isOwnProfile' => $isOwnProfile,
            'isFollowing' => $isFollowing,
            'posts' => $posts->items(),
            'hasMorePosts' => $posts->hasMorePages(),
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'fullname' => 'required|string|max:100',
            'username' => 'required|string|max:50|regex:/^[a-z0-9_]+$/|unique:users,username,' . $user->id,
            'bio' => 'nullable|string|max:500',
            'email' => 'required|email|max:100|unique:users,email,' . $user->id,
        ], [
            'username.regex' => 'Username hanya boleh huruf kecil, angka, dan underscore!',
        ]);

        $user->update([
            'fullname' => trim($request->fullname),
            'username' => strtolower(trim($request->username)),
            'bio' => trim($request->bio ?? ''),
            'email' => trim($request->email),
        ]);

        if ($request->filled('current_password') && $request->filled('new_password')) {
            $request->validate([
                'current_password' => 'required|current_password',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            $user->update([
                'password' => Hash::make($request->new_password),
            ]);
        }

        return back()->with('success', 'Profile updated!');
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,gif,webp|max:5120',
        ]);

        $user = Auth::user();
        $file = $request->file('avatar');
        $filename = 'avatar_' . $user->id . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('assets/avatars'), $filename);

        // Delete old avatar
        if ($user->avatar && $user->avatar !== 'default.svg' && file_exists(public_path('assets/avatars/' . $user->avatar))) {
            unlink(public_path('assets/avatars/' . $user->avatar));
        }

        $user->update(['avatar' => $filename]);

        return back()->with('success', 'Avatar updated!');
    }
}
