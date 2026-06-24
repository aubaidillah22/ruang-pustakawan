import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4"
             style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                                 style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                                RP
                            </div>
                            <div className="text-left">
                                <h1 className="text-2xl font-bold text-gray-900">RuangPustakawan</h1>
                                <p className="text-sm text-gray-500">Komunitas Digital Pustakawan</p>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
                    {children}
                </div>
                <p className="text-center text-xs text-gray-400 mt-6">
                    &copy; {new Date().getFullYear()} RuangPustakawan. Perpustakaan Ibrahimy
                </p>
            </div>
        </div>
    );
}
