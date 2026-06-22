<p align="center">
  <a href="#">
    <img src="https://img.shields.io/badge/Laravel-12-red?logo=laravel" alt="Laravel 12">
    <img src="https://img.shields.io/badge/PHP-8.2-777BB4?logo=php" alt="PHP 8.2">
    <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss" alt="TailwindCSS v4">
    <img src="https://img.shields.io/badge/WebSocket-Reverb-FF6B6B" alt="Reverb WebSocket">
  </a>
</p>

# RuangPustakawan

**Komunitas Digital Pustakawan Perpustakaan Ibrahimy** — Sebuah platform sosial media mikro berbasis web untuk para pustakawan agar dapat berbagi ilmu, karya, berdiskusi, dan saling terhubung dalam satu ekosistem digital.

---

## Fitur

### 🔐 Autentikasi
- Registrasi & login dengan username atau email
- Rate limiting pada halaman login & register (cegah brute force)
- Session regeneration setelah login
- Logout (invalidate session)

### 📝 Postingan (Feed)
- Buat postingan dengan teks, gambar, dan video
- Kompresi gambar otomatis di sisi klien sebelum upload
- Edit & hapus postingan (pemilik + admin)
- Like/unlike postingan (real-time tanpa reload)
- Komentar pada postingan
- Pagination dengan infinite scroll + tombol "Muat Lebih Banyak"
- Skeleton loading saat memuat data

### 👥 Profil Pengguna
- Halaman profil publik dengan avatar, bio, dan statistik
- Edit profil (nama, username, bio, password, avatar)
- Follow/unfollow pengguna lain
- Upload avatar dengan preview & kompresi
- Validasi username (hanya huruf kecil, angka, underscore)

### 🔍 Pencarian
- Pencarian real-time pengguna (minimum 2 karakter)
- Dropdown hasil pencarian di navbar

### 💬 Pesan Pribadi (Real-time Chat)
- Kirim pesan teks & gambar antar pengguna
- Read receipts (tandai sudah dibaca)
- Online/offline status (WebSocket + polling fallback)
- Typing indicator
- Daftar percakapan dengan unread count
- Load more pesan lama (pagination)
- Notifikasi pesan baru via WebSocket

### 🔔 Notifikasi Real-time
- Notifikasi like, comment, follow, dan pesan baru
- Broadcast via WebSocket (Laravel Echo + Pusher/Reverb)
- Dropdown notifikasi di navbar
- Unread count badge
- Mark all as read

### 🌙 Dark Mode
- Toggle tema terang/gelap
- Persisted di localStorage
- Diperbarui secara real-time via Alpine.js

### 🎨 UI/UX
- Desain glassmorphism modern
- Animasi smooth
- Kompresi gambar client-side
- Toast notification system
- SweetAlert2 untuk konfirmasi aksi
- Fully responsive (mobile-first)
- Footer dengan kontak & informasi

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Backend** | Laravel 12, PHP 8.2 |
| **Frontend** | Bootstrap 5.1, Alpine.js, Vanilla JS, Font Awesome 6 |
| **Database** | MySQL (default), SQLite fallback |
| **Realtime** | Laravel Reverb + Pusher, Laravel Echo |
| **Build** | Vite 7, TailwindCSS v4 |
| **Queue** | Database driver |
| **Session/Cache** | Database driver |

### Package Utama (Composer)
- `laravel/framework` ^12.0
- `laravel/reverb` ^1.10 — WebSocket server
- `pusher/pusher-php-server` ^7.2 — Pusher integration

### Package Frontend (NPM)
- `laravel-echo` ^2.3.7 — WebSocket client
- `pusher-js` ^8.5.0 — Pusher JS client
- `alpinejs` ^3.14.8 — Reactive UI components
- `@tailwindcss/vite` v4 — CSS framework (terintegrasi Vite)

---

## Entity Relationship

### Models

| Model     | Relasi Utama                                           |
|-----------|--------------------------------------------------------|
| **User**  | `hasMany` Post, Like, Comment, Notification; Followers/Following via `Follow` |
| **Post**  | `belongsTo` User; `hasMany` Like, Comment              |
| **Comment** | `belongsTo` User, Post                               |
| **Like**  | `belongsTo` User, Post                                  |
| **Follow** | `belongsTo` User (follower & following)               |
| **Message** | `belongsTo` User (sender & receiver)                 |
| **Notification** | `belongsTo` User, fromUser, Post (opsional)       |

### Database Tables
- `users` — username, email, password, fullname, bio, avatar, role, last_seen_at
- `posts` — user_id, content, image, video, timestamps
- `likes` — user_id, post_id (unique pair)
- `comments` — user_id, post_id, comment, created_at
- `follows` — follower_id, following_id (unique pair)
- `messages` — sender_id, receiver_id, message, image, is_read, read_at
- `notifications` — user_id, from_user_id, type, post_id, is_read

---

## Route Structure

### Guest Routes
| Method | URI | Controller |
|--------|-----|------------|
| GET    | `/login` | AuthController@showLogin |
| POST   | `/login` | AuthController@login |
| GET    | `/register` | AuthController@showRegister |
| POST   | `/register` | AuthController@register |

### Authenticated Routes
| Method | URI | Controller |
|--------|-----|------------|
| GET/POST | `/` | HomeController@index (feed + create post) |
| POST | `/logout` | AuthController@logout |
| GET/POST | `/profile` | ProfileController@show / update |
| POST | `/like` | LikeController@toggle |
| POST | `/comment` | CommentController@store |
| GET | `/comment` | CommentController@index |
| POST | `/follow` | FollowController@toggle |
| POST | `/edt_post` | PostController@update |
| POST | `/delete_post` | PostController@destroy |
| GET | `/search` | SearchController@search |
| GET/POST | `/notifications` | NotificationController@handle |
| GET | `/messages` | MessageController@index |
| GET | `/messages/{user}` | MessageController@show |
| GET | `/messages/fetch/{user}` | MessageController@fetch |
| POST | `/messages/send` | MessageController@store |
| GET | `/messages/unread/count` | MessageController@unreadCount |
| GET | `/messages/api/conversations` | MessageController@conversations |
| POST | `/messages/mark-read/{user}` | MessageController@markRead |
| GET | `/messages/status/{user}` | MessageController@status |
| GET/POST | `/messages/typing/{user}` | MessageController@checkTyping/typing |

### WebSocket Channels
| Channel | Tipe | Deskripsi |
|---------|------|-----------|
| `private-App.Models.User.{id}` | Private | Notifikasi per-user |
| `private-notifications.{id}` | Private | Notifikasi real-time |
| `private-messages.{id}` | Private | Pesan real-time |
| `presence-online` | Presence | Status online pengguna |

---

## Instalasi & Setup

```bash
# Clone repositori
git clone <repo-url>
cd ruang-pustakawan

# Setup environment
copy .env.example .env
# Edit .env — atur DB_DATABASE, DB_USERNAME, DB_PASSWORD, BROADCAST_DRIVER

# Install dependencies & migrate
composer install
npm install
php artisan key:generate
php artisan migrate --seed

# Build frontend
npm run build

# Jalankan development server
composer run dev
# atau manual:
php artisan serve
php artisan queue:listen --tries=1
php artisan reverb:start
npm run dev
```

### Script `composer run dev`
Menjalankan 4 proses concurrently:
| Proses | Port | Deskripsi |
|--------|------|-----------|
| `php artisan serve` | 8000 | Web server |
| `php artisan queue:listen` | — | Queue worker |
| `php artisan pail` | — | Log viewer |
| `npm run dev` | 5173 | Vite HMR |

---

## Broadcasting (Realtime)

Aplikasi mendukung dua driver broadcasting:

### 1. Laravel Reverb (self-hosted)
```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=...
REVERB_APP_KEY=...
REVERB_APP_SECRET=...
```

### 2. Pusher (cloud)
```env
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=...
PUSHER_APP_KEY=...
PUSHER_APP_SECRET=...
PUSHER_CLUSTER=...
```

---

## Struktur Direktori

```
ruang-pustakawan/
├── app/
│   ├── Events/              # NewMessage, NewNotification
│   ├── Http/
│   │   ├── Controllers/     # 10 controller
│   │   └── Middleware/      # UpdateUserActivity
│   ├── Models/              # 7 model (User, Post, Comment, etc.)
│   └── Providers/
├── database/
│   ├── migrations/          # 7 migration files
│   └── seeders/
├── resources/
│   └── views/
│       ├── auth/            # login, register
│       ├── layouts/         # app.blade.php (main layout)
│       ├── messages/        # index, show (chat)
│       └── partials/        # post component
├── public/
│   └── assets/
│       ├── avatars/         # user avatar uploads
│       ├── css/             # style.css
│       ├── js/              # app.js (851 lines)
│       └── uploads/         # post image/video & chat image uploads
├── routes/
│   ├── web.php              # 25+ routes
│   ├── channels.php         # WebSocket channel authorization
│   └── console.php
└── config/                  # 12 config files
```

---

## Developer

**Perpustakaan Ibrahimy** — Platform dikembangkan oleh tim Perpustakaan Ibrahimy untuk memfasilitasi komunikasi dan kolaborasi antar pustakawan.

- ✉️ aubaidillah756@gmail.com
- 📱 +62 851-1166-1997

---

## Lisensi

MIT License — lihat file [LICENSE](LICENSE) untuk detail.
