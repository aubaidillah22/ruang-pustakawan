import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
    const [notifCount, setNotifCount] = useState(0);
    const [msgCount, setMsgCount] = useState(0);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Fetch unread counts
    useEffect(() => {
        const fetchCounts = () => {
            axios.get('/notifications/unread-count').then(r => setNotifCount(r.data.count)).catch(() => {});
            axios.get('/messages/unread/count').then(r => setMsgCount(r.data.count)).catch(() => {});
        };
        fetchCounts();
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, []);

    const navigation = [
        { name: 'Beranda', href: '/feed', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Explore', href: '/feed?explore=1', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
        { name: 'Pesan', href: '/messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', badge: msgCount },
        { name: 'Notifikasi', href: '/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', badge: notifCount },
        { name: 'Profil', href: `/profile/${user.username}`, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ];

    const isActive = (href) => {
        if (href.includes('/profile/')) return window.location.pathname.startsWith('/profile/');
        return window.location.pathname === href || window.location.pathname + window.location.search === href;
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
                 style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}>
                <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 rounded-lg" style={{ color: 'var(--text-primary)' }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showMobileMenu
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        }
                    </svg>
                </button>
                <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>RuangPustakawan</span>
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg" style={{ color: 'var(--text-primary)' }}>
                    {darkMode ? '☀️' : '🌙'}
                </button>
            </div>

            {/* Overlay for mobile menu */}
            {showMobileMenu && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setShowMobileMenu(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 overflow-y-auto
                ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
                style={{ width: 'var(--sidebar-width)', background: 'var(--card-bg)', borderRight: '1px solid var(--border-color)' }}>
                
                {/* Logo */}
                <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <Link href="/feed" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                             style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                            RP
                        </div>
                        <div>
                            <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>RuangPustakawan</h1>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Komunitas Pustakawan</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                            onClick={() => setShowMobileMenu(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            <span>{item.name}</span>
                            {item.badge > 0 && (
                                <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full text-white"
                                      style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
                        <img
                            src={user.avatar_url || `/assets/avatars/${user.avatar || 'default.svg'}`}
                            alt={user.fullname}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user.fullname}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>@{user.username}</p>
                        </div>
                        <Link href={route('profile.edit')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:pl-[280px] pt-16 lg:pt-0">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
