<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>RuangPustakawan - Perpustakaan Ibrahimy</title>
    <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
    <link rel="alternate icon" href="{{ asset('favicon.ico') }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
    <script src="https://unpkg.com/laravel-echo@1.16.1/dist/echo.iife.js"></script>
    <link rel="stylesheet" href="{{ asset('assets/css/style.css') }}?v=5">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }

        /* === NAVBAR === */
        .navbar {
            background: linear-gradient(135deg, #075e54 0%, #0a7a6a 100%) !important;
            box-shadow: 0 2px 24px rgba(7,94,84,0.2);
            padding: 10px 0;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            transition: all 0.3s ease;
            backdrop-filter: blur(2px);
        }
        body.dark-mode .navbar {
            background: linear-gradient(135deg, #0d1117 0%, #161b22 100%) !important;
            border-bottom: 1px solid rgba(37,211,102,0.06);
            box-shadow: 0 2px 24px rgba(0,0,0,0.25);
        }
        .navbar-brand {
            font-weight: 800; font-size: 1.25rem; color: white !important;
            display: flex; align-items: center; gap: 10px;
            letter-spacing: -0.3px; padding: 4px 0;
        }
        .navbar-brand i { font-size: 1.3rem; color: #25d366; }
        .navbar-brand span { color: #25d366; font-weight: 800; }

        .navbar-nav { gap: 4px; }
        .nav-link {
            font-weight: 500; transition: all 0.25s ease; border-radius: 10px;
            padding: 8px 14px !important; color: rgba(255,255,255,0.8) !important;
            font-size: 0.85rem; position: relative;
        }
        .nav-link i { margin-right: 7px; font-size: 0.8rem; width: 16px; text-align: center; }
        .nav-link:hover {
            background: rgba(255,255,255,0.08);
            color: white !important;
        }
        .nav-link.active {
            background: rgba(255,255,255,0.1);
            color: white !important;
        }
        body.dark-mode .nav-link { color: rgba(240,240,240,0.7) !important; }
        body.dark-mode .nav-link:hover { background: rgba(255,255,255,0.05); color: #fff !important; }
        body.dark-mode .nav-link.active { background: rgba(37,211,102,0.1); color: #25d366 !important; }

        .nav-link-logout {
            background: rgba(255,255,255,0.06) !important;
            border: 1px solid rgba(255,255,255,0.08) !important;
            border-radius: 10px !important;
        }
        .nav-link-logout:hover {
            background: rgba(237,73,86,0.15) !important;
            border-color: rgba(237,73,86,0.2) !important;
        }
        body.dark-mode .nav-link-logout {
            background: rgba(255,255,255,0.03) !important;
            border-color: rgba(255,255,255,0.05) !important;
        }

        .btn-success { background: linear-gradient(135deg, #25d366, #1aa34a) !important; border: none; box-shadow: 0 4px 14px rgba(37,211,102,0.3); }

        .theme-toggle {
            background: rgba(255,255,255,0.06); border: none; border-radius: 8px;
            padding: 7px 10px; color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.25s ease;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.9rem; line-height: 1;
        }
        .theme-toggle:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .theme-toggle i { transition: transform 0.4s ease; }
        .theme-toggle:hover i { transform: rotate(15deg); }
        body.dark-mode .theme-toggle { background: rgba(255,255,255,0.04); }
        body.dark-mode .theme-toggle:hover { background: rgba(255,255,255,0.08); }

        .container { max-width: 1600px; }

        .navbar-end { display: flex; align-items: center; gap: 2px; }

        .nav-search {
            position: relative;
            display: flex;
            align-items: center;
        }
        .nav-search input {
            background: rgba(255,255,255,0.06); border: 1px solid transparent; border-radius: 8px;
            padding: 7px 12px 7px 32px; color: white; font-size: 0.82rem; font-weight: 400;
            width: 170px; transition: all 0.25s;
        }
        .nav-search input::placeholder { color: rgba(255,255,255,0.3); font-weight: 400; }
        .nav-search input:focus { outline: none; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.12); width: 220px; }
        body.dark-mode .nav-search input { background: rgba(255,255,255,0.03); }
        body.dark-mode .nav-search input:focus { background: rgba(255,255,255,0.06); border-color: rgba(37,211,102,0.12); }

        .nav-search::before {
            content: '\f002'; font-family: 'Font Awesome 6 Free'; font-weight: 900;
            position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
            color: rgba(255,255,255,0.25); font-size: 0.7rem; z-index: 1; pointer-events: none;
        }

        #searchResults {
            position: absolute; top: calc(100% + 6px); left: 0; right: 0;
            background: var(--glass-bg); backdrop-filter: blur(12px);
            border: 1px solid var(--glass-border);
            border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 1050; display: none; overflow: hidden;
        }
        #searchResults .search-result-item {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 16px; transition: background 0.2s;
            text-decoration: none; border-bottom: 1px solid var(--glass-border);
        }
        #searchResults .search-result-item:last-child { border-bottom: none; }
        #searchResults .search-result-item:hover { background: rgba(0,0,0,0.05); }
        body.dark-mode #searchResults .search-result-item:hover { background: rgba(255,255,255,0.05); }
        #searchResults .search-result-item img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        #searchResults .search-result-item .notif-text { flex: 1; font-size: 13px; color: var(--text-primary); font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        #searchResults .search-result-item .notif-time { font-size: 11px; color: var(--text-secondary); flex-shrink: 0; }

        /* Mobile nav */
        @media (max-width: 991.98px) {
            .navbar-collapse {
                background: rgba(7, 94, 84, 0.98);
                backdrop-filter: blur(20px);
                border-radius: 16px;
                padding: 10px;
                margin-top: 10px;
                border: 1px solid rgba(255,255,255,0.06);
                box-shadow: 0 16px 48px rgba(0,0,0,0.25);
            }
            body.dark-mode .navbar-collapse {
                background: rgba(13, 17, 23, 0.98);
                border-color: rgba(255,255,255,0.04);
            }
            .navbar-nav { gap: 2px !important; }
            .nav-link { padding: 10px 14px !important; border-radius: 10px; }
            .nav-link i { width: 20px; }
            .nav-link-logout { margin-top: 4px; }
            .nav-search { margin: 2px 0; width: 100%; }
            .nav-search input { width: 100%; padding: 9px 12px 9px 34px; }
            .nav-search input:focus { width: 100%; }
            .nav-search::before { left: 12px; }
            .navbar-end .theme-toggle { padding: 8px; }
            .navbar-brand { font-size: 1.1rem; }
            #searchResults { left: 0; right: 0; border-radius: 12px; }
        }

        /* Floating nav shadow on scroll */
        .navbar-scrolled { box-shadow: 0 4px 30px rgba(0,0,0,0.15) !important; }
    </style>
</head>
<body @auth data-user-id="{{ auth()->id() }}" @endauth>
<nav class="navbar navbar-expand-lg navbar-dark fixed-top">
    <div class="container">
        <a class="navbar-brand" href="{{ route('home') }}">
            <i class="fas fa-book-open"></i> Ruang<span style="color: #25d366;">Pustakawan</span>
        </a>
        <div class="navbar-end">
            <li class="nav-item d-lg-none" x-data="themeToggle">
                <button @click="toggle()" class="theme-toggle" :title="isDark ? 'Mode Terang' : 'Mode Gelap'">
                    <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
                </button>
            </li>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
        </div>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto align-items-center gap-2">
                @auth
                    <li class="nav-item"><a class="nav-link" href="{{ route('home') }}"><i class="fas fa-home"></i> Beranda</a></li>
                    <li class="nav-item nav-search">
                        <input type="text" id="searchInput" placeholder="Cari anggota..." autocomplete="off">
                        <div id="searchResults"></div>
                    </li>
                    <li class="nav-item notification-bell">
                        <button class="nav-link" id="notificationBell" style="position:relative;cursor:pointer;background:none;border:none;">
                            <i class="fas fa-bell"></i>
                            @php
                                $unreadCount = \App\Models\Notification::where('user_id', auth()->id())->where('is_read', false)->count();
                            @endphp
                            @if($unreadCount > 0)
                                <span class="notification-badge">{{ $unreadCount }}</span>
                            @endif
                        </button>
                        <div class="notification-dropdown" id="notificationDropdown">
                            <div class="notification-dropdown-header">Notifikasi</div>
                            <div id="notificationList">
                                <div class="notification-empty">Memuat...</div>
                            </div>
                        </div>
                    </li>
                    <li class="nav-item"><a class="nav-link" href="{{ route('messages.index') }}" id="messagesLink"><i class="fas fa-comment-dots"></i> Pesan <span class="messages-badge" id="messagesBadge" style="display:none;"></span></a></li>
                    <li class="nav-item"><a class="nav-link" href="{{ route('profile') }}"><i class="fas fa-user-circle"></i> Profil</a></li>
                    <li class="nav-item">
                        <form action="{{ route('logout') }}" method="POST" style="display:inline;">
                            @csrf
                            <button type="submit" class="nav-link" style="background:none;border:none;cursor:pointer;">
                                <i class="fas fa-sign-out-alt"></i> Keluar
                            </button>
                        </form>
                    </li>
                @else
                    <li class="nav-item"><a class="nav-link" href="{{ route('login') }}"><i class="fas fa-sign-in-alt"></i> Masuk</a></li>
                    <li class="nav-item"><a class="nav-link btn btn-success text-white px-4 ms-2" href="{{ route('register') }}"><i class="fas fa-user-plus"></i> Daftar</a></li>
                @endauth
                <li class="nav-item d-none d-lg-flex align-items-center" x-data="themeToggle">
                    <button @click="toggle()" class="theme-toggle" :title="isDark ? 'Mode Terang' : 'Mode Gelap'">
                        <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
                    </button>
                </li>
            </ul>
        </div>
    </div>
</nav>

<div class="main-content" style="padding-top: 76px; flex: 1;">
    @yield('content')
</div>

<!-- Toast Container -->
<div id="toastContainer" class="toast-container"></div>

<!-- Image Compression Indicator -->
<div id="compressionIndicator" class="compression-indicator" style="display:none;">
    <div class="compression-spinner"></div>
    <span>Mengompres gambar...</span>
</div>

<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('themeToggle', () => ({
        isDark: localStorage.getItem('darkMode') === 'enabled',
        init() {
            this.apply();
        },
        toggle() {
            this.isDark = !this.isDark;
            localStorage.setItem('darkMode', this.isDark ? 'enabled' : 'disabled');
            this.apply();
        },
        apply() {
            if (this.isDark) {
                document.body.classList.remove('light-mode');
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
                document.body.classList.add('light-mode');
            }
        }
    }));
});

@auth
@if(config('broadcasting.default') !== 'log' && config('broadcasting.default') !== 'null')
@php
    $driver = config('broadcasting.default');
    $conn = config("broadcasting.connections.$driver");
    $key = $conn['key'] ?? '';
    $opts = $conn['options'] ?? [];
    $host = $opts['host'] ?? '127.0.0.1';
    $port = $opts['port'] ?? ($driver === 'reverb' ? 8080 : 443);
    $scheme = $opts['scheme'] ?? ($driver === 'pusher' ? 'https' : 'http');
    $cluster = $opts['cluster'] ?? '';
@endphp
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: '{{ $key }}',
    cluster: '{{ $cluster }}',
    wsHost: '{{ $host }}',
    wsPort: {{ $driver === 'pusher' ? 80 : $port }},
    @if($scheme === 'https')
    wssPort: {{ $port }},
    forceTLS: true,
    encrypted: true,
    @else
    forceTLS: false,
    encrypted: false,
    @endif
    disableStats: true,
    enabledTransports: ['ws', 'wss']
});
@endif
@endauth

// Navbar shadow on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.toggle('navbar-scrolled', window.scrollY > 10);
    }
});
</script>

<!-- Footer -->
<footer class="site-footer">
    <div class="container">
        <div class="site-footer__main">
            <div class="site-footer__brand">
                <div class="site-footer__logo">
                    <span class="site-footer__logo-icon"><i class="fas fa-book-open"></i></span>
                    <span class="site-footer__logo-text">Ruang<span>Pustakawan</span></span>
                </div>
                <p class="site-footer__tagline">Komunitas Digital Pustakawan Perpustakaan Ibrahimy</p>
            </div>
            <div class="site-footer__contact">
                <a href="mailto:aubaidillah756@gmail.com" class="site-footer__contact-item">
                    <span class="site-footer__contact-icon"><i class="fas fa-envelope"></i></span>
                    <span>aubaidillah756@gmail.com</span>
                </a>
                <a href="https://wa.me/6285111661997" target="_blank" rel="noopener noreferrer" class="site-footer__contact-item">
                    <span class="site-footer__contact-icon site-footer__contact-icon--wa"><i class="fab fa-whatsapp"></i></span>
                    <span>+62 851-1166-1997</span>
                </a>
            </div>
        </div>
        <div class="site-footer__bottom">
            <p>&copy; {{ date('Y') }} RuangPustakawan · Perpustakaan Ibrahimy</p>
        </div>
    </div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="{{ asset('assets/js/app.js') }}?v=8"></script>
@stack('scripts')
</body>
</html>
