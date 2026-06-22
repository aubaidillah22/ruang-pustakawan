<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect()->route('home');
        }
        return view('auth.login');
    }

    public function login(Request $request)
    {
        if (Auth::check()) {
            return redirect()->route('home');
        }

        // Rate limiting
        $key = 'login:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return view('auth.login', [
                'error' => 'Terlalu banyak percobaan login. Coba lagi dalam ' . ceil($seconds / 60) . ' menit.'
            ]);
        }

        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $field = filter_var($request->username, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (Auth::attempt([$field => $request->username, 'password' => $request->password])) {
            RateLimiter::clear($key);
            $request->session()->regenerate();
            $request->session()->flash('login_success', true);
            return redirect()->route('home');
        }

        RateLimiter::hit($key, 300);

        return view('auth.login', [
            'error' => 'Username/email atau password salah!'
        ]);
    }

    public function showRegister()
    {
        if (Auth::check()) {
            return redirect()->route('home');
        }
        return view('auth.register');
    }

    public function register(Request $request)
    {
        if (Auth::check()) {
            return redirect()->route('home');
        }

        // Rate limiting
        $key = 'register:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 3)) {
            return view('auth.register', [
                'error' => 'Terlalu banyak percobaan pendaftaran. Tunggu beberapa menit.'
            ]);
        }

        $request->validate([
            'fullname' => 'required|string|max:100',
            'username' => 'required|string|max:50|regex:/^[a-z0-9_]+$/|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'username.regex' => 'Username hanya boleh huruf kecil, angka, dan underscore!',
            'username.unique' => 'Username sudah terdaftar!',
            'email.unique' => 'Email sudah terdaftar!',
            'password.min' => 'Password minimal 8 karakter!',
            'password.confirmed' => 'Password tidak cocok!',
        ]);

        User::create([
            'username' => strtolower(trim($request->username)),
            'email' => trim($request->email),
            'password' => $request->password,
            'fullname' => trim($request->fullname),
        ]);

        return view('auth.register', [
            'success' => 'Pendaftaran berhasil! Silakan login.'
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }
}
