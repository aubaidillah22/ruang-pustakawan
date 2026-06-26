import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function GuestLayout({ children }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    return (
        <div className="min-h-screen flex">
            {/* Left side: Image */}
            <div className={`hidden lg:flex lg:w-1/2 relative items-start justify-center overflow-hidden bg-slate-900 pt-24 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <img src="/images/auth-bg.jpg" alt="RuangPustakawan"
                     className="absolute inset-0 w-full h-full object-cover" />

                <div className="relative z-10 flex flex-col items-center text-center px-8">
                    {/* Decorative line */}
                    <div className="w-12 h-1 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-6" />

                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-3 mb-4 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                            style={{ background: 'linear-gradient(135deg, #1e40af, #7c3aed)' }}>
                            <svg viewBox="0 0 32 32" className="w-full h-full p-1.5">
                                <path d="M7 10 C7 8, 9 7, 11 7 L16 7 L16 25 L11 25 C9 25, 7 24, 7 22 Z" fill="rgba(255,255,255,0.9)"/>
                                <path d="M16 7 L21 7 C23 7, 25 8, 25 10 L25 22 C25 24, 23 25, 21 25 L16 25 Z" fill="rgba(255,255,255,0.6)"/>
                                <rect x="15.3" y="7" width="1.4" height="18" rx="0.5" fill="rgba(255,255,255,0.9)"/>
                            </svg>
                        </div>
                        <span className="text-2xl font-extrabold font-heading tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700">
                            RuangPustakawan
                        </span>
                    </Link>

                    <h2 className="text-lg font-bold font-heading tracking-tight text-gray-800">
                        Komunitas Digital Pustakawan
                    </h2>

                    <div className="flex items-center gap-2 my-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0s', animationDuration: '1s' }} />
                        <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1s' }} />
                        <div className="w-2 h-2 rounded-full bg-pink-600 animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1s' }} />
                    </div>

                    <p className="text-gray-600 text-sm max-w-xs leading-relaxed font-medium">
                        Berbagi ilmu, berdiskusi, dan saling terhubung dalam satu ekosistem digital.
                    </p>
                </div>
            </div>

            {/* Right side: Form */}
            <div className={`flex-1 flex items-center justify-center px-6 py-8 lg:py-0 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #f0f5ff 30%, #faf5ff 60%, #fdf2f8 100%)' }}>
                <div className="w-full max-w-sm">
                    {/* Logo for mobile */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold transition-all group-hover:scale-110"
                                style={{ background: 'linear-gradient(135deg, #1e40af, #7c3aed)' }}>
                                RP
                            </div>
                            <span className="text-xl font-bold text-gray-900">RuangPustakawan</span>
                        </Link>
                    </div>

                    {/* Form card */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/80">
                        {children}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400 mt-6">
                        &copy; {new Date().getFullYear()} RuangPustakawan &mdash; Perpustakaan Ibrahimy
                    </p>
                </div>
            </div>
        </div>
    );
}
