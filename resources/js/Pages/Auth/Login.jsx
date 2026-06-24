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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang Kembali</h2>
            <p className="text-sm text-gray-500 mb-8">Masuk ke akun RuangPustakawan Anda</p>

            {status && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">{status}</div>}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Username / Email
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Masukkan username atau email"
                        autoFocus
                    />
                    {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Masukkan password"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
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
                        <Link href={route('password.request')} className="text-sm text-blue-600 hover:text-blue-800">
                            Lupa password?
                        </Link>
                    )}
                </div>

                <button type="submit" disabled={processing}
                        className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                    {processing ? 'Memproses...' : 'Masuk'}
                </button>

                <p className="text-center text-sm text-gray-500">
                    Belum punya akun?{' '}
                    <Link href={route('register')} className="text-blue-600 font-medium hover:text-blue-800">
                        Daftar sekarang
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
