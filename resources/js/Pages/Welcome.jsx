import { Link, Head } from '@inertiajs/react';

export default function Welcome({ canLogin, canRegister, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Selamat Datang" />
            <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #065f46 100%)' }}>
                {/* Nav */}
                <nav className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                             style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                            RP
                        </div>
                        <span className="text-white font-bold text-lg">RuangPustakawan</span>
                    </div>
                    <div className="flex gap-3">
                        {canLogin && (
                            <Link href={route('login')}
                                  className="px-6 py-2 rounded-xl text-white font-medium border border-white/20 hover:bg-white/10 transition-all">
                                Masuk
                            </Link>
                        )}
                        {canRegister && (
                            <Link href={route('register')}
                                  className="px-6 py-2 rounded-xl font-medium text-white transition-all"
                                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                Daftar
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Hero */}
                <main className="flex-1 flex items-center justify-center px-6">
                    <div className="max-w-3xl text-center">
                        <div className="text-7xl mb-6">📚</div>
                        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
                            Ruang<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa, #a78bfa)' }}>Pustakawan</span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Komunitas Digital untuk Para Pustakawan — Berbagi ilmu, berdiskusi, 
                            dan saling terhubung dalam satu ekosistem digital yang elegan dan profesional.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {canRegister && (
                                <Link href={route('register')}
                                      className="px-8 py-3 rounded-xl font-semibold text-white text-lg transition-all hover:scale-105"
                                      style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                    Mulai Bergabung
                                </Link>
                            )}
                            {canLogin && (
                                <Link href={route('login')}
                                      className="px-8 py-3 rounded-xl font-semibold text-white text-lg border border-white/30 hover:bg-white/10 transition-all">
                                    Masuk
                                </Link>
                            )}
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20">
                            {[
                                { icon: '📝', title: 'Posting & Berbagi', desc: 'Bagikan ilmu, karya, dan pemikiran dengan sesama pustakawan' },
                                { icon: '💬', title: 'Chat Real-time', desc: 'Diskusi langsung dengan rekan pustakawan secara real-time' },
                                { icon: '👥', title: 'Jaringan Profesional', desc: 'Bangun koneksi dan jaringan dengan komunitas pustakawan' },
                            ].map((feature, i) => (
                                <div key={i} className="glass-card rounded-2xl p-6 text-center"
                                     style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                                    <div className="text-4xl mb-3">{feature.icon}</div>
                                    <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="text-center py-6 text-gray-500 text-sm border-t border-white/10">
                    &copy; {new Date().getFullYear()} RuangPustakawan — Perpustakaan Ibrahimy
                </footer>
            </div>
        </>
    );
}
