<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Guest / Welcome page
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('feed');
    }
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

// Dashboard redirect to feed (Breeze defaults to 'dashboard' after login)
Route::get('/dashboard', function () {
    return redirect()->route('feed');
})->middleware(['auth'])->name('dashboard');

// Authenticated routes
Route::middleware(['auth', 'active'])->group(function () {
    // Feed & Explore
    Route::get('/feed', [PostController::class, 'index'])->name('feed');
    Route::get('/explore', [PostController::class, 'explore'])->name('explore');
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::post('/posts/update', [PostController::class, 'update'])->name('posts.update');
    Route::post('/posts/delete', [PostController::class, 'destroy'])->name('posts.destroy');

    // Likes
    Route::post('/like', [LikeController::class, 'toggle'])->name('like.toggle');

    // Comments
    Route::get('/comments', [CommentController::class, 'index'])->name('comments.index');
    Route::post('/comments', [CommentController::class, 'store'])->name('comments.store');

    // Follow
    Route::post('/follow', [FollowController::class, 'toggle'])->name('follow.toggle');
    Route::get('/follow/status', [FollowController::class, 'status'])->name('follow.status');

    // Search
    Route::get('/search', [SearchController::class, 'search'])->name('search');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-read', [NotificationController::class, 'markRead'])->name('notifications.markRead');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unreadCount');
    Route::get('/notifications/latest', [NotificationController::class, 'latest'])->name('notifications.latest');

    // Messages (Chat)
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/{user}', [MessageController::class, 'show'])->name('messages.show');
    Route::post('/messages/send', [MessageController::class, 'store'])->name('messages.store');
    Route::get('/messages/fetch/{user}', [MessageController::class, 'fetch'])->name('messages.fetch');
    Route::post('/messages/mark-read/{user}', [MessageController::class, 'markRead'])->name('messages.markRead');
    Route::get('/messages/unread/count', [MessageController::class, 'unreadCount'])->name('messages.unreadCount');
    Route::get('/messages/status/all', [MessageController::class, 'status'])->name('messages.status');
    Route::post('/messages/delete', [MessageController::class, 'destroyMessage'])->name('messages.destroy');
    Route::post('/messages/delete-conversation/{user}', [MessageController::class, 'destroyConversation'])->name('messages.destroyConversation');
    Route::post('/messages/typing', [MessageController::class, 'typing'])->name('messages.typing');
    Route::get('/messages/conversations/data', [MessageController::class, 'conversations'])->name('messages.conversations');

    // Profile
    Route::get('/profile/{user?}', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/settings/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile/settings', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile/settings', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/update-avatar', [ProfileController::class, 'updateAvatar'])->name('profile.updateAvatar');
});

// Auth routes (Breeze)
require __DIR__ . '/auth.php';
