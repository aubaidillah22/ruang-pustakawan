import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';

export default function MessagesIndex({ conversations }) {
    const [convos, setConvos] = useState(conversations || []);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = async (q) => {
        setSearch(q);
        if (q.length < 2) { setSearchResults([]); return; }
        try {
            const res = await axios.get(`/search?q=${encodeURIComponent(q)}`);
            setSearchResults(res.data);
        } catch {}
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pesan" />

            <div className="post-card">
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Pesan</h2>

                {/* Search users */}
                <div className="relative mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Cari pengguna..."
                        className="input-modern pl-10"
                    />
                    <svg className="w-5 h-5 absolute left-3 top-3.5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>

                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-10"
                             style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                            {searchResults.map(u => (
                                <Link key={u.id} href={`/messages/${u.id}`}
                                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <img src={u.avatar_url || `/assets/avatars/${u.avatar || 'default.svg'}`}
                                         alt={u.fullname} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{u.fullname}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>@{u.username}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Conversations */}
                <div className="space-y-1">
                    {convos.map((conv) => (
                        <Link key={conv.user.id} href={`/messages/${conv.user.id}`}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                            <div className="relative">
                                <img src={conv.user.avatar_url || `/assets/avatars/${conv.user.avatar || 'default.svg'}`}
                                     alt={conv.user.fullname} className="w-12 h-12 rounded-full object-cover" />
                                {conv.is_online && <span className="online-dot" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{conv.user.fullname}</p>
                                    {conv.last_message && (
                                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            {conv.last_message.created_at ? new Date(conv.last_message.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                                        {conv.last_message?.message || (conv.last_message?.image ? '(Gambar)' : 'Mulai percakapan')}
                                    </p>
                                    {conv.unread_count > 0 && (
                                        <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full text-white"
                                              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                    {convos.length === 0 && (
                        <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Belum ada percakapan. Cari pengguna untuk memulai chat!
                        </p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
