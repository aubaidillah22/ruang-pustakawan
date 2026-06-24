<?php

namespace App\Http\Controllers;

use App\Events\NewNotification;
use App\Models\Follow;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    public function toggle(Request $request)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $followerId = Auth::id();
        $followingId = $request->user_id;

        if ($followingId == $followerId) {
            return response()->json(['success' => false, 'message' => 'Cannot follow yourself']);
        }

        $existing = Follow::where('follower_id', $followerId)
            ->where('following_id', $followingId)
            ->first();

        if ($existing) {
            $existing->delete();
            $following = false;
        } else {
            Follow::create([
                'follower_id' => $followerId,
                'following_id' => $followingId,
            ]);
            $following = true;

            // Send notification
            $notification = Notification::create([
                'user_id' => $followingId,
                'from_user_id' => $followerId,
                'type' => 'follow',
            ]);
            try { broadcast(new NewNotification($notification)); } catch (\Throwable $e) {}
        }

        return response()->json(['success' => true, 'following' => $following]);
    }

    public function status(Request $request)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $isFollowing = Follow::where('follower_id', Auth::id())
            ->where('following_id', $request->user_id)
            ->exists();

        return response()->json(['following' => $isFollowing]);
    }
}
