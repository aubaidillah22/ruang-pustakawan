import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect, useRef } from 'react';

export default function MessagesIndex({ conversations }) {
    const { auth } = usePage().props;
    const currentUserId = auth.user.id;

    const [convos, setConvos] = useState(conversations || []);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const searchRef = useRef(null);

    // Listen for new messages via Echo
    useEffect(() => {
        if (!window.Echo) return;
        const channel = window.Echo.private(`chat.${currentUserId}`);

        channel.listen('.NewMessage', () => {
            router.reload({ only: ['conversations'], preserveScroll: true, preserveState: true });
        });

        channel.listen('.UserTyping', () => {});

        return () => {
            try { window.Echo.leave(`chat.${currentUserId}`); } catch {}
        };
    }, [currentUserId]);

    // Periodic refresh for online status & read receipts
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['conversations'], preserveScroll: true, preserveState: true });
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleSearch = async (q) => {
        setSearch(q);
        if (q.length < 2) { setSearchResults([]); return; }
        setSearching(true);
        try {
            const res = await axios.get(`/search?q=${encodeURIComponent(q)}`);
            setSearchResults(res.data);
        } catch {}
        setSearching(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setSearch('');
            setSearchResults([]);
            searchRef.current?.blur();
        }
    };

    const timeAgo = (timestamp) => {
        if (!timestamp) return '';
        const now = new Date();
        const date = new Date(timestamp);
        const diffMinutes = Math.floor((now - date) / 60000);

        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffDays = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return 'Baru saja';
        if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffDays === 0) return `${diffHours} jam lalu`;
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const lastSeenText = (conv) => {
        if (conv.is_online) return null;
        if (!conv.user.last_seen_at) return 'Offline';
        const diff = Math.floor((new Date() - new Date(conv.user.last_seen_at)) / 60000);
        if (diff < 1) return 'Online';
        if (diff < 60) return `${diff} menit lalu`;
        const hours = Math.floor(diff / 60);
        if (hours < 24) return `${hours} jam lalu`;
        const days = Math.floor(hours / 24);
        return `${days} hari lalu`;
    };

    const handleDeleteConversation = async (e, userId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Hapus seluruh percakapan ini?')) return;
        setDeletingId(userId);
        try {
            const user = convos.find(c => c.user.id === userId)?.user;
            await axios.post(`/messages/delete-conversation/${user?.username || userId}`);
            setConvos(prev => prev.filter(c => c.user.id !== userId));
        } catch {}
        setDeletingId(null);
    };

    const filteredConvos = filterText
        ? convos.filter(c =>
            c.user.fullname.toLowerCase().includes(filterText.toLowerCase()) ||
            c.user.username.toLowerCase().includes(filterText.toLowerCase())
          )
        : convos;

    return (
        <AuthenticatedLayout>
            <Head title="Pesan" />

            <div className="post-card p-0 overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Pesan</h2>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {convos.length} percakapan
                    </span>
                </div>

                {/* Search */}
                <div className="px-5 py-3 space-y-2">
                    {/* Global user search */}
                    <div className="relative">
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Cari pengguna baru..."
                            className="input-modern"
                        />
                        {search && (
                            <button onClick={() => { setSearch(''); setSearchResults([]); }}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filter existing conversations */}
                    {convos.length > 0 && (
                        <div className="relative">
                            <input
                                type="text"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Filter percakapan..."
                                className="input-modern text-sm"
                            />
                            {filterText && (
                                <button onClick={() => setFilterText('')}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="rounded-xl shadow-lg border overflow-hidden"
                             style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                            {searchResults.map(u => (
                                <Link key={u.id} href={`/messages/${u.username}`}
                                      className="flex items-center gap-3 px-4 py-3 transition-colors hover-scale"
                                      style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <div className="relative">
                                        <img src={u.avatar_url || `/assets/avatars/${u.avatar || 'default.svg'}`}
                                             alt={u.fullname} className="w-10 h-10 rounded-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{u.fullname}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>@{u.username}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {search.length >= 2 && searchResults.length === 0 && !searching && (
                        <p className="text-center text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Tidak ditemukan
                        </p>
                    )}
                </div>

                {/* Conversations */}
                <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                    {filteredConvos.length === 0 && convos.length > 0 && (
                        <div className="text-center py-12 px-5">
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Tidak ada percakapan yang cocok dengan "{filterText}"
                            </p>
                        </div>
                    )}
                    {filteredConvos.map((conv) => (
                        <div key={conv.user.id} className="group relative">
                            <Link href={`/messages/${conv.user.username}`}
                                  className="flex items-center gap-3 px-5 py-4 transition-all duration-200 hover-scale"
                                  style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <div className="relative flex-shrink-0">
                                    <img src={conv.user.avatar_url || `/assets/avatars/${conv.user.avatar || 'default.svg'}`}
                                         alt={conv.user.fullname} className="w-12 h-12 rounded-full object-cover" />
                                    {conv.is_online && <span className="online-dot w-3.5 h-3.5 border-2" style={{ borderColor: 'var(--card-bg)' }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                            {conv.user.fullname}
                                        </p>
                                        {conv.last_message && (
                                            <span className="text-xs whitespace-nowrap flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                                                {timeAgo(conv.last_message?.created_at)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-sm truncate flex-1" style={{ color: conv.unread_count > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                            {conv.last_message?.message
                                                ? (conv.last_message.sender_id === currentUserId ? 'Anda: ' : '') + conv.last_message.message
                                                : (conv.last_message?.image ? <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Gambar</span> : 'Mulai percakapan')}
                                        </p>
                                        {conv.unread_count > 0 && (
                                            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-bold rounded-full text-white animate-pulse-once"
                                                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                                                {conv.unread_count > 99 ? '99+' : conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    {!conv.is_online && conv.user.last_seen_at && (
                                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                            {lastSeenText(conv) ? `Terakhir dilihat ${lastSeenText(conv)}` : ''}
                                        </p>
                                    )}
                                </div>
                            </Link>
                            <button
                                onClick={(e) => handleDeleteConversation(e, conv.user.id)}
                                disabled={deletingId === conv.user.id}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                                style={{ color: 'var(--text-secondary)' }}
                                title="Hapus percakapan">
                                {deletingId === conv.user.id ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    ))}
                    {convos.length === 0 && (
                        <div className="text-center py-16 px-5">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                 style={{ background: 'var(--bg-color)' }}>
                                <svg className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Belum ada pesan</h3>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cari pengguna untuk memulai chat!</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
