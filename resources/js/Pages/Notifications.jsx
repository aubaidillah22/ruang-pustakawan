import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Notifications({ notifications: initialNotifs, hasMore: initialHasMore }) {
    const [notifications, setNotifications] = useState(initialNotifs || []);
    const [hasMore, setHasMore] = useState(initialHasMore || false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const loadMoreRef = useRef(null);

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.is_read).length);
    }, [notifications]);

    // Infinite scroll
    useEffect(() => {
        if (!hasMore) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading) {
                loadMore();
            }
        }, { threshold: 0.1 });
        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, loading]);

    const loadMore = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/notifications?page=${page + 1}`);
            if (res.data.notifications) {
                setNotifications(prev => [...prev, ...res.data.notifications]);
                setHasMore(res.data.has_more);
                setPage(prev => prev + 1);
            }
        } catch (e) {
            console.error('Failed to load notifications', e);
        }
        setLoading(false);
    };

    // Listen for new notifications via Echo
    useEffect(() => {
        if (!window.Echo) return;
        const channel = window.Echo.private(`notifications.${window.__user?.id || ''}`);
        channel.listen('.NewNotification', (e) => {
            setNotifications(prev => [{
                id: e.id || Date.now(),
                type: e.type,
                message: e.message,
                post_id: e.post_id,
                from_user: { fullname: e.fullname, avatar: e.avatar },
                time_ago: 'Baru saja',
                is_read: false,
            }, ...prev]);
        });
        return () => { try { window.Echo.leave('notifications.'); } catch {} };
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch {}
    };

    const getIcon = (type) => {
        switch (type) {
            case 'like':
                return (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                );
            case 'comment':
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                );
            case 'follow':
                return (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                );
            case 'message':
                return (
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                );
        }
    };

    const getMessage = (notif) => {
        if (notif.message) return notif.message;
        switch (notif.type) {
            case 'like': return 'menyukai postingan Anda';
            case 'comment': return 'mengomentari postingan Anda';
            case 'follow': return 'mulai mengikuti Anda';
            case 'message': return 'mengirimi Anda pesan';
            default: return 'melakukan sesuatu';
        }
    };

    const getNavUrl = (notif) => {
        const username = notif.from_user?.username || notif.from_user_username;
        switch (notif.type) {
            case 'like':
            case 'comment':
                // Navigate to the post that was liked/commented
                if (notif.post_id) return `/feed?post=${notif.post_id}`;
                return '/feed';
            case 'follow':
                if (username) return `/profile/${username}`;
                return '/feed';
            case 'message':
                if (username) return `/messages/${username}`;
                return '/messages';
            default:
                return null;
        }
    };

    const handleNotificationClick = async (notif) => {
        const url = getNavUrl(notif);

        // Mark as read optimistically
        if (!notif.is_read) {
            setNotifications(prev =>
                prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
            );
            try {
                await axios.post('/notifications/mark-read', { id: notif.id });
            } catch {}
        }

        // Navigate
        if (url) {
            router.visit(url);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notifikasi" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Notifikasi
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {unreadCount > 0
                            ? `${unreadCount} notifikasi belum dibaca`
                            : 'Tidak ada notifikasi baru'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead}
                            className="btn-ghost text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Tandai dibaca
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="post-card p-0 overflow-hidden">
                {notifications.length > 0 ? (
                    <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                        {notifications.map((notif, idx) => (
                            <div key={notif.id || idx}
                                 onClick={() => handleNotificationClick(notif)}
                                 className="flex items-start gap-4 px-5 py-4 transition-all duration-200 cursor-pointer"
                                 style={{
                                     background: !notif.is_read
                                         ? 'rgba(var(--primary-rgb), 0.05)'
                                         : 'transparent',
                                     borderBottom: '1px solid var(--border-color)',
                                 }}
                                 onMouseEnter={(e) => { e.currentTarget.style.background = !notif.is_read ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(var(--primary-rgb), 0.03)'; }}
                                 onMouseLeave={(e) => { e.currentTarget.style.background = !notif.is_read ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent'; }}>
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                     style={{
                                         background: !notif.is_read
                                             ? 'rgba(var(--primary-rgb), 0.1)'
                                             : 'var(--bg-color)',
                                         boxShadow: !notif.is_read
                                             ? '0 0 0 2px var(--primary-light)'
                                             : 'none',
                                     }}>
                                    {getIcon(notif.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                        <span className="font-semibold">{notif.from_user?.fullname || notif.fullname || 'Seseorang'}</span>
                                        {' '}{getMessage(notif)}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                        {notif.time_ago || 'Baru saja'}
                                    </p>
                                </div>

                                {/* Unread dot */}
                                {!notif.is_read && (
                                    <span className="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--primary-light)' }} />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-5">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                             style={{ background: 'var(--bg-color)' }}>
                            <svg className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Belum ada notifikasi</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Notifikasi akan muncul di sini</p>
                    </div>
                )}

                {/* Load More */}
                {hasMore && (
                    <div ref={loadMoreRef} className="text-center py-6">
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary-light)', animationDelay: '0s' }} />
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary-light)', animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary-light)', animationDelay: '0.2s' }} />
                            </div>
                        ) : (
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Muat lebih banyak...</p>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
