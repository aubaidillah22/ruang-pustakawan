import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function LogoutModal({ show, onClose }) {
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = () => {
        setLoggingOut(true);
        router.post(route('logout'));
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
             onClick={onClose}
             style={{ animation: 'fadeIn 0.2s ease-out' }}>
            {/* Backdrop */}
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />

            {/* Modal */}
            <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6"
                 style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                 onClick={(e) => e.stopPropagation()}>
                {/* Icon */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                     style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                    <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-center mb-2"
                    style={{ color: 'var(--text-primary)' }}>
                    Keluar dari akun?
                </h3>
                <p className="text-sm text-center mb-6"
                   style={{ color: 'var(--text-secondary)' }}>
                    Anda akan keluar dari sesi saat ini. Anda dapat masuk kembali kapan saja.
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <button onClick={handleLogout} disabled={loggingOut}
                            className="w-full py-2.5 rounded-xl font-medium text-sm text-white transition-all disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                        {loggingOut ? 'Keluar...' : 'Ya, Keluar'}
                    </button>
                    <button onClick={onClose}
                            className="w-full py-2.5 rounded-xl font-medium text-sm transition-all"
                            style={{ color: 'var(--text-primary)', background: 'var(--bg-color)' }}>
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}
