<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login - Ruang Pustakawan</title>
    <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
    <link rel="alternate icon" href="{{ asset('favicon.ico') }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #075e54; position: relative; overflow: hidden; }
        #bg-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }

        .auth-container {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 960px;
            display: flex;
            align-items: center;
            gap: 40px;
            padding: 20px;
            animation: fadeInScale 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }

        @keyframes fadeInScale { 0% { opacity: 0; transform: scale(0.96); } 100% { opacity: 1; transform: scale(1); } }

        /* Left — Illustration */
        .auth-illustration {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
        }

        .auth-illustration .big-icon {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, #25d366, #075e54);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 28px;
            box-shadow: 0 20px 40px rgba(37, 211, 102, 0.35);
        }
        .auth-illustration .big-icon i { font-size: 50px; color: white; }

        .auth-illustration h1 {
            color: white;
            font-weight: 800;
            font-size: 2.4rem;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #FFFFFF, #bbf0d0);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
        }
        .auth-illustration h1 span { background: linear-gradient(135deg, #25d366, #afffcf); background-clip: text; -webkit-background-clip: text; color: transparent; }
        .auth-illustration p { color: rgba(230, 255, 240, 0.75); font-size: 0.95rem; max-width: 320px; line-height: 1.6; }

        .auth-illustration .floating-icons {
            display: flex;
            gap: 32px;
            margin-top: 36px;
        }
        .auth-illustration .floating-icons .fi-item {
            width: 56px;
            height: 56px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, 0.7);
            font-size: 22px;
            transition: all 0.3s;
            animation: floatUp 3s ease-in-out infinite;
        }
        .auth-illustration .floating-icons .fi-item:nth-child(2) { animation-delay: 0.4s; }
        .auth-illustration .floating-icons .fi-item:nth-child(3) { animation-delay: 0.8s; }
        .auth-illustration .floating-icons .fi-item:hover { background: rgba(37, 211, 102, 0.2); color: #25d366; transform: translateY(-6px); }

        @keyframes floatUp {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        /* Right — Form */
        .auth-form-wrap {
            width: 400px;
            flex-shrink: 0;
        }

        .login-card {
            background: rgba(10, 30, 26, 0.55);
            backdrop-filter: blur(18px) saturate(180%);
            -webkit-backdrop-filter: blur(18px);
            border: 1px solid rgba(37, 211, 102, 0.3);
            border-radius: 32px;
            box-shadow: 0 30px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.08);
            overflow: hidden;
        }
        .login-header { text-align: center; padding: 32px 36px 20px; position: relative; background: radial-gradient(ellipse at 50% 0%, rgba(37, 211, 102, 0.12), transparent); }
        .login-header::after { content: ''; position: absolute; bottom: 0; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, rgba(37, 211, 102, 0.6), rgba(37, 211, 102, 0.9), rgba(37, 211, 102, 0.6), transparent); }
        .login-header h3 { color: white; font-weight: 800; font-size: 1.5rem; margin-bottom: 4px; }
        .login-header h3 span { color: #25d366; }
        .login-header p { color: rgba(230, 255, 240, 0.6); font-size: 0.8rem; font-weight: 500; }
        .login-body { padding: 24px 36px 36px; }
        .login-body .form-label { color: rgba(240, 255, 245, 0.8); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 6px; }
        .input-icon-wrap { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 14px; color: rgba(255,255,255,0.3); font-size: 0.85rem; pointer-events: none; z-index: 1; }
        .login-body .form-control { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #f0fff4; padding: 12px 14px 12px 40px; font-size: 0.9rem; font-weight: 400; transition: all 0.25s ease; width: 100%; }
        .login-body .form-control::placeholder { color: rgba(255,255,255,0.25); font-weight: 400; }
        .login-body .form-control:focus { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); box-shadow: none; color: white; outline: none; }
        .login-body .form-control:focus ~ .input-icon,
        .input-icon-wrap:focus-within .input-icon { color: rgba(255,255,255,0.6); }
        .btn-login { background: linear-gradient(105deg, #1fbc60, #0f8545); border: none; padding: 14px; border-radius: 40px; color: white; font-weight: 700; font-size: 1rem; letter-spacing: 0.5px; transition: all 0.3s; box-shadow: 0 10px 22px -5px rgba(37, 211, 102, 0.4); margin-top: 12px; position: relative; overflow: hidden; }
        .btn-login:hover:not(:disabled) { background: linear-gradient(105deg, #29d46e, #159a50); transform: translateY(-2px); box-shadow: 0 18px 28px -6px rgba(37, 211, 102, 0.55); }
        .btn-login:disabled { opacity: 0.5; cursor: not-allowed; }
        .login-footer { text-align: center; margin-top: 20px; }
        .login-footer a { color: #76e8a2; text-decoration: none; font-weight: 600; border-bottom: 1px dashed rgba(118, 232, 162, 0.4); }
        .login-footer a:hover { color: #bcffda; }
        .login-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0 10px; color: rgba(190, 240, 215, 0.45); font-size: 0.75rem; font-weight: 500; }
        .login-divider::before, .login-divider::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(100, 210, 140, 0.5), transparent); }
        .alert-glass { background: rgba(220, 53, 69, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(255, 100, 100, 0.4); border-radius: 24px; color: #ffb4b9; font-size: 0.85rem; font-weight: 500; padding: 12px 18px; margin-bottom: 20px; }

        .auth-footer-text { color: rgba(220, 250, 225, 0.7); font-size: 0.85rem; margin-bottom: 6px; }
        .auth-footer-text a { color: #76e8a2; text-decoration: none; font-weight: 600; }
        .auth-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 999px; font-size: 0.7rem; font-weight: 500; color: rgba(190, 240, 215, 0.8); background: rgba(37, 211, 102, 0.1); border: 1px solid rgba(37, 211, 102, 0.15); }

        /* Mobile */
        @media (max-width: 768px) {
            .auth-container { flex-direction: column; max-width: 440px; gap: 24px; }
            .auth-illustration { padding: 10px; }
            .auth-illustration .big-icon { width: 80px; height: 80px; }
            .auth-illustration .big-icon i { font-size: 34px; }
            .auth-illustration h1 { font-size: 1.6rem; }
            .auth-illustration p { font-size: 0.85rem; }
            .auth-illustration .floating-icons { gap: 20px; margin-top: 24px; }
            .auth-illustration .floating-icons .fi-item { width: 46px; height: 46px; font-size: 18px; }
            .auth-form-wrap { width: 100%; }
            .login-header { padding: 24px 24px 16px; }
            .login-body { padding: 20px 24px 28px; }
        }
    </style>
</head>
<body>
    <canvas id="bg-canvas"></canvas>

    <div class="auth-container">
        <!-- Left: Illustration -->
        <div class="auth-illustration">
            <div class="big-icon">
                <i class="fas fa-book-open"></i>
            </div>
            <h1>Ruang<span>Pustakawan</span></h1>
            <p>Komunitas Digital Pustakawan Perpustakaan Ibrahimy tempat berbagi ilmu, karya, dan inspirasi.</p>
            <div class="floating-icons">
                <div class="fi-item"><i class="fas fa-book"></i></div>
                <div class="fi-item"><i class="fas fa-graduation-cap"></i></div>
                <div class="fi-item"><i class="fas fa-users"></i></div>
            </div>
        </div>

        <!-- Right: Login Form -->
        <div class="auth-form-wrap">
            <div class="login-card">
                <div class="login-header">
                    <h3>Masuk <span>Akun</span></h3>
                    <p>Silakan login untuk melanjutkan</p>
                </div>
                <div class="login-body">
                    @if(isset($error) && $error)
                        <div class="alert-glass"><i class="fas fa-exclamation-circle me-2"></i>{{ $error }}</div>
                    @endif
                    <form method="POST" action="{{ route('login') }}">
                        @csrf
                        <div class="mb-3">
                            <label class="form-label"><i class="far fa-user me-1"></i> Username atau Email</label>
                            <div class="input-icon-wrap">
                                <i class="fas fa-user input-icon"></i>
                                <input type="text" name="username" class="form-control" placeholder="Masukkan username atau email" required autofocus>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label"><i class="fas fa-lock me-1"></i> Password</label>
                            <div class="input-icon-wrap">
                                <i class="fas fa-lock input-icon"></i>
                                <input type="password" name="password" class="form-control" placeholder="Masukkan password" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-login w-100"><i class="fas fa-sign-in-alt me-2"></i>Login</button>
                    </form>
                    <div class="login-divider">✦ akses anggota ✦</div>
                    <div class="login-footer">
                        <p class="auth-footer-text">
                            Belum punya akun? <a href="{{ route('register') }}">Daftar di sini</a>
                        </p>
                        <span class="auth-badge"><i class="fas fa-shield-alt"></i> lingkungan aman & terpercaya</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Animated background particles
        (function() {
            const c = document.getElementById('bg-canvas'), ctx = c.getContext('2d');
            let w, h, particles = [];
            function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
            window.addEventListener('resize', resize); resize();
            for (let i = 0; i < 40; i++) {
                particles.push({
                    x: Math.random() * w, y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
                    r: Math.random() * 3 + 1, o: Math.random() * 0.5 + 0.15
                });
            }
            function draw() {
                ctx.clearRect(0, 0, w, h);
                particles.forEach(p => {
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < 0 || p.x > w) p.vx *= -1;
                    if (p.y < 0 || p.y > h) p.vy *= -1;
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(37, 211, 102, ${p.o})`;
                    ctx.fill();
                });
                requestAnimationFrame(draw);
            }
            draw();
        })();
    </script>
</body>
</html>
