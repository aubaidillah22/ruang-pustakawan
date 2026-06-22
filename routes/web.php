<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    // Home / Feed
    Route::match(['get', 'post'], '/', [HomeController::class, 'index'])->name('home');

    // Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Profile
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Like (AJAX)
    Route::post('/like', [LikeController::class, 'toggle'])->name('like.toggle');

    // Comments (AJAX)
    Route::post('/comment', [CommentController::class, 'store'])->name('comment.store');
    Route::get('/comment', [CommentController::class, 'index'])->name('comment.index');

    // Follow (AJAX)
    Route::post('/follow', [FollowController::class, 'toggle'])->name('follow.toggle');

    // Post edit/delete (AJAX)
    Route::post('/edt_post', [PostController::class, 'update'])->name('post.update');
    Route::post('/delete_post', [PostController::class, 'destroy'])->name('post.destroy');

    // Search (AJAX)
    Route::get('/search', [SearchController::class, 'search'])->name('search');

    // Notifications (AJAX)
    Route::match(['get', 'post'], '/notifications', [NotificationController::class, 'handle'])->name('notifications');

    // Messaging
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/{user}', [MessageController::class, 'show'])->name('messages.show');
    Route::get('/messages/fetch/{user}', [MessageController::class, 'fetch'])->name('messages.fetch');
    Route::post('/messages/send', [MessageController::class, 'store'])->name('messages.store');
    Route::get('/messages/unread/count', [MessageController::class, 'unreadCount'])->name('messages.unread');
    Route::get('/messages/api/conversations', [MessageController::class, 'conversations'])->name('messages.conversations');
    Route::post('/messages/mark-read/{user}', [MessageController::class, 'markRead'])->name('messages.markRead');
    Route::get('/messages/status/{user}', [MessageController::class, 'status'])->name('messages.status');
    Route::get('/messages/typing/{user}', [MessageController::class, 'checkTyping'])->name('messages.typing.check');
    Route::post('/messages/typing/{user}', [MessageController::class, 'typing'])->name('messages.typing');
});
