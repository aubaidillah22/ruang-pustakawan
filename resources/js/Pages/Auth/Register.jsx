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

            <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: 'linear-gradient(135deg, #1e40af, #7c3aed)' }}>
                    RP
                </div>
                <h2 className="text-xl font-extrabold font-heading tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700">
                    Bergabung Sekarang
                </h2>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">Buat akun baru untuk memulai</p>
            </div>

            <form onSubmit={submit} className="space-y-3.5">
                <div>
                    <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input id="fullname" type="text" value={data.fullname}
                           onChange={(e) => setData('fullname', e.target.value)}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                           placeholder="Nama lengkap" autoFocus />
                    {errors.fullname && <p className="mt-1 text-xs text-red-500">{errors.fullname}</p>}
                </div>

                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input id="username" type="text" value={data.username}
                           onChange={(e) => setData('username', e.target.value.toLowerCase())}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                           placeholder="username_huruf_kecil" />
                    {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input id="email" type="email" value={data.email}
                           onChange={(e) => setData('email', e.target.value)}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                           placeholder="email@example.com" />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input id="password" type="password" value={data.password}
                           onChange={(e) => setData('password', e.target.value)}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                           placeholder="Minimal 8 karakter" />
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                    <input id="password_confirmation" type="password" value={data.password_confirmation}
                           onChange={(e) => setData('password_confirmation', e.target.value)}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                           placeholder="Ulangi password" />
                    {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
                </div>

                <button type="submit" disabled={processing}
                        className="w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                    {processing ? 'Memproses...' : 'Daftar'}
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
                    Sudah punya akun?{' '}
                    <Link href={route('login')} className="text-blue-600 font-semibold hover:text-blue-800">
                        Masuk
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
