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
            ->with('user')
            ->withCount(['likes', 'comments'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $posts->getCollection()->transform(function ($post) use ($currentUser) {
            $post->is_liked = $post->isLikedBy($currentUser);
            $isOwner = $post->user_id === $currentUser->id;
            $isAdmin = $currentUser->role === 'admin';
            $post->can_delete = $isOwner || $isAdmin;
            $post->can_edit = $isOwner || $isAdmin;
            $post->is_edited = $post->created_at->ne($post->updated_at);
            return $post;
        });

        return Inertia::render('Profile/Show', [
            'profileUser' => $profileUser->loadCount(['posts', 'followers', 'following']),
            'isOwnProfile' => $isOwnProfile,
            'isFollowing' => $isFollowing,
            'posts' => $posts->items(),
            'hasMorePosts' => $posts->hasMorePages(),
        ]);
    }

    public function edit()
    {
        return Inertia::render('Profile/Edit');
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $rules = [
            'email' => 'required|email|max:100|unique:users,email,' . $user->id,
        ];

        // Support both 'fullname' (our custom form) and 'name' (Breeze default form)
        if ($request->filled('fullname') || $request->filled('name')) {
            $rules['fullname'] = 'string|max:100';
        }
        if ($request->filled('username')) {
            $rules['username'] = 'required|string|max:50|regex:/^[a-z0-9_]+$/|unique:users,username,' . $user->id;
        }
        if ($request->has('bio')) {
            $rules['bio'] = 'nullable|string|max:500';
        }

        $request->validate($rules, [
            'username.regex' => 'Username hanya boleh huruf kecil, angka, dan underscore!',
        ]);

        $data = [
            'fullname' => trim($request->fullname ?? $request->name ?? $user->fullname),
        ];
        if ($request->filled('username')) {
            $data['username'] = strtolower(trim($request->username));
        }
        if ($request->has('bio')) {
            $data['bio'] = trim($request->bio ?? '');
        }
        if ($request->filled('email')) {
            $data['email'] = trim($request->email);
        }

        $user->update($data);

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

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = Auth::user();

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
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
