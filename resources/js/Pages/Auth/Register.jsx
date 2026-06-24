import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        fullname: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => { reset('password', 'password_confirmation'); };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Daftar" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bergabung Sekarang</h2>
            <p className="text-sm text-gray-500 mb-8">Buat akun baru untuk memulai</p>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                    <input id="fullname" type="text" value={data.fullname}
                           onChange={(e) => setData('fullname', e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                           placeholder="Nama lengkap" autoFocus />
                    {errors.fullname && <p className="mt-1 text-sm text-red-500">{errors.fullname}</p>}
                </div>

                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                    <input id="username" type="text" value={data.username}
                           onChange={(e) => setData('username', e.target.value.toLowerCase())}
                           className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                           placeholder="username_huruf_kecil" />
                    {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input id="email" type="email" value={data.email}
                           onChange={(e) => setData('email', e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                           placeholder="email@example.com" />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <input id="password" type="password" value={data.password}
                           onChange={(e) => setData('password', e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                           placeholder="Minimal 8 karakter" />
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
                    <input id="password_confirmation" type="password" value={data.password_confirmation}
                           onChange={(e) => setData('password_confirmation', e.target.value)}
                           className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                           placeholder="Ulangi password" />
                    {errors.password_confirmation && <p className="mt-1 text-sm text-red-500">{errors.password_confirmation}</p>}
                </div>

                <button type="submit" disabled={processing}
                        className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                    {processing ? 'Memproses...' : 'Daftar'}
                </button>

                <p className="text-center text-sm text-gray-500">
                    Sudah punya akun?{' '}
                    <Link href={route('login')} className="text-blue-600 font-medium hover:text-blue-800">
                        Masuk
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
