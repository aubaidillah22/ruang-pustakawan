import { Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Welcome({ canLogin, canRegister }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const features = [
        { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', title: 'Posting & Berbagi', desc: 'Bagikan ilmu, karya, dan pemikiran dengan sesama pustakawan' },
        { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', title: 'Chat Real-time', desc: 'Diskusi langsung dengan rekan pustakawan secara real-time' },
        { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', title: 'Jaringan Profesional', desc: 'Bangun koneksi dan jaringan dengan komunitas pustakawan' },
    ];

    const stats = [
        { label: 'Pustakawan Aktif', value: '1.200+' },
        { label: 'Diskusi & Posting', value: '8.500+' },
        { label: 'Server Uptime', value: '99.9%' },
    ];

    return (
        <>
            <Head title="Selamat Datang" />
            <div className="min-h-screen flex flex-col overflow-hidden relative bg-slate-950">
                {/* Animated background blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="blob blob-1" />
                    <div className="blob blob-2" />
                    <div className="blob blob-3" />
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(var(--primary-rgb), 0.25) 0%, transparent 60%)' }} />
                </div>

                {/* Nav */}
                <nav className={`relative z-10 flex items-center justify-between px-6 py-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
                            <svg viewBox="0 0 32 32" className="w-full h-full">
                                <circle cx="16" cy="16" r="15" fill="var(--primary)" opacity="0.08"/>
                                <path d="M7 10 C7 8, 9 7, 11 7 L16 7 L16 25 L11 25 C9 25, 7 24, 7 22 Z" fill="var(--primary-dark)"/>
                                <path d="M16 7 L21 7 C23 7, 25 8, 25 10 L25 22 C25 24, 23 25, 21 25 L16 25 Z" fill="var(--primary)"/>
                                <rect x="15.3" y="7" width="1.4" height="18" rx="0.5" fill="var(--primary-dark)"/>
                                <path d="M15.5 8.5 L15.5 15 L13 13 L10.5 15 L10.5 8.5" fill="var(--accent)" stroke="var(--accent)" strokeWidth="0.3"/>
                                <line x1="9" y1="13" x2="14.5" y2="13" stroke="#ffffff" strokeWidth="0.6" opacity="0.35"/>
                                <line x1="9" y1="16" x2="14.5" y2="16" stroke="#ffffff" strokeWidth="0.6" opacity="0.35"/>
                                <line x1="9" y1="19" x2="14.5" y2="19" stroke="#ffffff" strokeWidth="0.6" opacity="0.35"/>
                                <line x1="17.5" y1="13" x2="23" y2="13" stroke="#ffffff" strokeWidth="0.6" opacity="0.35"/>
                                <line x1="17.5" y1="16" x2="23" y2="16" stroke="#ffffff" strokeWidth="0.6" opacity="0.35"/>
                                <line x1="17.5" y1="19" x2="23" y2="19" stroke="#ffffff" strokeWidth="0.6" opacity="0.35"/>
                            </svg>
                        </div>
                        <span className="text-white font-bold text-lg">RuangPustakawan</span>
                    </Link>
                    <div className="flex gap-3">
                        {canLogin && (
                            <Link href={route('login')}
                                  className="px-6 py-2 rounded-xl text-white font-medium border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all">
                                Masuk
                            </Link>
                        )}
                        {canRegister && (
                            <Link href={route('register')}
                                  className="px-6 py-2 rounded-xl font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/25"
                                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                Daftar
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Hero */}
                <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            {/* Left: Text */}
                            <div className={`flex-1 text-center lg:text-left transition-all duration-1000 delay-150 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 mb-6">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                    Komunitas Pustakawan Digital
                                </div>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                    Ruang<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Pustakawan</span>
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                    Komunitas Digital untuk Para Pustakawan — Berbagi ilmu, berdiskusi,
                                    dan saling terhubung dalam satu ekosistem digital yang elegan dan profesional.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    {canRegister && (
                                        <Link href={route('register')}
                                              className="group relative px-8 py-3.5 rounded-xl font-semibold text-white text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30"
                                              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                            <span className="relative z-10">Mulai Bergabung</span>
                                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
                                        </Link>
                                    )}
                                    {canLogin && (
                                        <Link href={route('login')}
                                              className="px-8 py-3.5 rounded-xl font-semibold text-white text-lg border border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
                                            Masuk
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Right: Illustration mockup */}
                            <div className={`flex-1 flex justify-center transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                                <div className="relative w-72 h-[500px]">
                                    {/* Phone frame */}
                                    <div className="absolute inset-0 rounded-[40px] border-4 border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-blue-500/20">
                                        {/* Status bar */}
                                        <div className="flex items-center justify-between px-6 pt-6 pb-3">
                                            <span className="text-white/60 text-xs font-semibold">9:41</span>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                                                <svg className="w-3.5 h-3.5 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                                            </div>
                                        </div>
                                        {/* App content inside phone */}
                                        <div className="px-4 space-y-3">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span className="text-white/80 text-xs font-semibold">Feed</span>
                                            </div>
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className={`rounded-xl p-3 ${i === 2 ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-white/5'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                                                        <div className="flex-1">
                                                            <div className="h-2 w-20 rounded bg-white/10" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="h-2 rounded bg-white/10 w-full" />
                                                        <div className="h-2 rounded bg-white/10 w-3/4" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Bottom nav */}
                                        <div className="absolute bottom-0 inset-x-0 flex items-center justify-around px-6 py-3 border-t border-white/10 bg-slate-900/60 backdrop-blur">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className={`w-5 h-5 rounded ${i === 0 ? 'bg-blue-500' : 'bg-white/20'}`} />
                                            ))}
                                        </div>
                                        {/* Notch */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[18px] bg-black rounded-b-2xl" />
                                    </div>
                                    {/* Floating glow */}
                                    <div className="absolute -top-6 -right-6 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl" />
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className={`grid grid-cols-3 gap-4 sm:gap-8 mt-16 max-w-lg mx-auto lg:mx-0 lg:max-w-none transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center lg:text-left">
                                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Features */}
                        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-20 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            {features.map((feature, i) => (
                                <div key={i}
                                     className="group relative rounded-2xl p-6 text-center overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-500/10"
                                     style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                                            </svg>
                                        </div>
                                        <h3 className="text-white font-semibold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">{feature.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className={`relative z-10 text-center py-6 text-gray-500 text-sm border-t border-white/5 transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    &copy; {new Date().getFullYear()} RuangPustakawan — Perpustakaan Ibrahimy
                </footer>
            </div>
        </>
    );
}
