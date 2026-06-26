import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => { reset('password'); };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: 'linear-gradient(135deg, #1e40af, #7c3aed)' }}>
                    RP
                </div>
                <h2 className="text-xl font-extrabold font-heading tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700">
                    Selamat Datang Kembali
                </h2>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">Masuk ke akun RuangPustakawan Anda</p>
            </div>

            {status && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">{status}</div>}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Username / Email
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                        placeholder="Masukkan username atau email"
                        autoFocus
                    />
                    {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                        placeholder="Masukkan password"
                    />
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Ingat saya
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            Lupa password?
                        </Link>
                    )}
                </div>

                <button type="submit" disabled={processing}
                        className="w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                    {processing ? 'Memproses...' : 'Masuk'}
                </button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-gray-400">atau</span>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-500">
                    Belum punya akun?{' '}
                    <Link href={route('register')} className="text-blue-600 font-semibold hover:text-blue-800">
                        Daftar sekarang
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
