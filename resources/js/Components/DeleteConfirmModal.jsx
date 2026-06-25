export default function DeleteConfirmModal({ show, onClose, onConfirm, deleting }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
             onClick={onClose}
             style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />

            <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6"
                 style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                 onClick={(e) => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                     style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                    <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>

                <h3 className="text-lg font-semibold text-center mb-2"
                    style={{ color: 'var(--text-primary)' }}>
                    Hapus postingan?
                </h3>
                <p className="text-sm text-center mb-6"
                   style={{ color: 'var(--text-secondary)' }}>
                    Postingan ini akan dihapus secara permanen. Kamu tidak bisa membatalkannya.
                </p>

                <div className="flex flex-col gap-2">
                    <button onClick={onConfirm} disabled={deleting}
                            className="w-full py-2.5 rounded-xl font-medium text-sm text-white transition-all disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                        {deleting ? 'Menghapus...' : 'Ya, Hapus'}
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
