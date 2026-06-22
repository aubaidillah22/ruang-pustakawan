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
        $followerId = Auth::id();
        $followingId = $request->user_id ?? 0;

        if (!$followingId || $followingId == $followerId) {
            return response()->json(['success' => false, 'message' => 'Invalid user']);
        }

        if (!User::find($followingId)) {
            return response()->json(['success' => false, 'message' => 'User not found']);
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

            // Create notification
            $notification = Notification::create([
                'user_id' => $followingId,
                'from_user_id' => $followerId,
                'type' => 'follow',
            ]);
            try { broadcast(new NewNotification($notification)); } catch (\Throwable $e) { }
        }

        return response()->json(['success' => true, 'following' => $following]);
    }
}
