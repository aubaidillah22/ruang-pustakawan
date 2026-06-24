import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Notifications({ notifications: initialNotifs, hasMore }) {
    const [notifications, setNotifications] = useState(initialNotifs || []);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.is_read).length);
    }, [notifications]);

    // Listen for new notifications via Echo
    useEffect(() => {
        if (!window.Echo) return;
        const channel = window.Echo.private(`notifications.${window.__user?.id || ''}`);
        channel.listen('.NewNotification', (e) => {
            setNotifications(prev => [{
                id: e.id || Date.now(),
                type: e.type,
                message: e.message,
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
            case 'like': return '❤️';
            case 'comment': return '💬';
            case 'follow': return '👤';
            case 'message': return '✉️';
            default: return '🔔';
        }
    };

    const getMessage = (notif) => {
        if (notif.message) return notif.message;
        switch (notif.type) {
            case 'like': return 'menyukai postingan Anda';
            case 'comment': return 'mengomentari postingan Anda';
            case 'follow': return 'mulai mengikuti Anda';
            case 'message': return 'mengirim pesan';
            default: return 'melakukan sesuatu';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notifikasi" />

            <div className="post-card">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Notifikasi
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full text-white"
                                  style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                                {unreadCount}
                            </span>
                        )}
                    </h2>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-sm font-medium" style={{ color: 'var(--primary-light)' }}>
                            Tandai semua dibaca
                        </button>
                    )}
                </div>

                <div className="space-y-1">
                    {notifications.map((notif, idx) => (
                        <div key={notif.id || idx}
                             className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-colors ${
                                 !notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                             }`}>
                            <div className="text-xl mt-1">{getIcon(notif.type)}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    <span className="font-medium">{notif.from_user?.fullname || notif.fullname || 'Seseorang'}</span>
                                    {' '}{getMessage(notif)}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                    {notif.time_ago || 'Baru saja'}
                                </p>
                            </div>
                            {!notif.is_read && (
                                <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--primary-light)' }} />
                            )}
                        </div>
                    ))}
                    {notifications.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">🔔</div>
                            <p style={{ color: 'var(--text-secondary)' }}>Belum ada notifikasi</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
