# Ruang Pustakawan — Project Overview

## Stack
- **Framework:** Laravel 12 (PHP ^8.2)
- **Frontend:** Blade, Tailwind CSS 4, Vite 7, Alpine.js (via CDN in layout)
- **Database:** MySQL
- **Auth:** Custom (no Breeze/Jetstream), session-based with rate limiting
- **Realtime:** Pusher + Laravel Echo (CDN)
- **Dev tools:** Laravel Pail (logs), Pint (linting), Sail (Docker), PHPUnit 11

## Architecture
- **Pattern:** Monolithic MVC with AJAX interactions + realtime via WebSocket
- **Rendering:** Server-side Blade, JSON responses for AJAX
- **Auth:** `auth` middleware group, manual login/register/logout via `AuthController`
- **File uploads:** `public/assets/uploads/` (post images/videos, chat images), `public/assets/avatars/` (profile pictures)

## Models (7)
| Model | Table | Key Relations |
|-------|-------|--------------|
| `User` | users | hasMany posts, likes, comments, followers, following, notifications, sentMessages, receivedMessages |
| `Post` | posts | belongsTo User, hasMany likes, comments |
| `Like` | likes | belongsTo User, Post (unique: user_id + post_id) |
| `Comment` | comments | belongsTo User, Post |
| `Follow` | follows | belongsTo User (follower_id, following_id) |
| `Notification` | notifications | belongsTo User, fromUser, Post |
| `Message` | messages | belongsTo User (sender_id, receiver_id) |

## Controllers (11)
| Controller | Routes | Type |
|-----------|--------|------|
| `AuthController` | login, register, logout | Form + redirect |
| `HomeController` | / (feed + create post) | Blade + AJAX pagination |
| `PostController` | edit/delete post | AJAX JSON |
| `LikeController` | toggle like | AJAX JSON |
| `CommentController` | add/show comments | AJAX JSON |
| `FollowController` | toggle follow | AJAX JSON |
| `ProfileController` | show/update profile | Blade + redirect |
| `SearchController` | search users & posts | AJAX JSON |
| `NotificationController` | get/count/mark-read | AJAX JSON |
| `MessageController` | messages index/show/send/fetch/conversations/markRead | Blade + AJAX JSON |

## Events (2)
| Event | Broadcast Channel | Purpose |
|-------|------------------|---------|
| `NewNotification` | `notifications.{user_id}` | Realtime like/comment/follow alerts |
| `NewMessage` | `messages.{user_id}` | Realtime chat messages |

## Routes (all in `routes/web.php`)
- Guest: `/login`, `/register`
- Auth: `/` (feed), `/logout`, `/profile`, `/like`, `/comment`, `/follow`, `/edt_post`, `/delete_post`, `/search`, `/notifications`, `/messages` (6 routes: index, show, fetch, store, unreadCount, conversations, markRead)

## Key Behaviors
- **Rate limiting** on login (5 attempts/5min) and register (3 attempts/5min)
- **Login** accepts username OR email (auto-detected)
- **Notifications** created on: like, comment, follow — broadcast via Pusher if configured
- **Admin role:** `User::isAdmin()` — can edit/delete any post
- **AJAX pagination** on home feed (20 posts per page, infinite scroll + load more)
- **Avatar default:** `assets/avatars/default.svg`
- **Messaging:** Private chat between users, realtime via Pusher + polling fallback (3s new msg, 30s unread count)
- **Online status:** `UpdateUserActivity` middleware updates `last_seen_at` per request; online if < 5min
- **Video upload:** Posts support video upload (mp4, webm, ogg) alongside images

## DB Migrations (7)
- `users` — id, username (unique), email (unique), password, fullname, bio, avatar, role (user/admin), **last_seen_at**, timestamps
- `posts` — id, user_id (FK), content, image, video, timestamps
- `messages` — id, sender_id (FK), receiver_id (FK), message, image, **is_read**, **read_at**, created_at
- `likes` — user_id (FK), post_id (FK), created_at (unique: user+post)
- `comments` — user_id (FK), post_id (FK), comment, created_at
- `follows` — follower_id (FK), following_id (FK), created_at (unique: follower+following)
- `notifications` — user_id (FK), from_user_id (FK), type (like/comment/follow), post_id (FK nullable), is_read, created_at

## Coding Conventions
- Models use `HasFactory` trait, `$fillable`, no `$guarded`
- Controllers are "fat" — business logic in controller methods (no service layer)
- Timestamps disabled on Like, Comment, Follow, Notification, Message (manual `created_at`)
- Carbon used for time ago formatting (WIB/Asia/Jakarta timezone)
- Indonesian language for UI messages
- Validation messages are custom inline
