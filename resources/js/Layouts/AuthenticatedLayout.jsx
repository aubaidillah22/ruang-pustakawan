import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        localStorage.getItem('sidebar_collapsed') === 'true'
    );
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
    const [notifCount, setNotifCount] = useState(0);
    const [msgCount, setMsgCount] = useState(0);

    const sidebarWidth = sidebarCollapsed ? '80px' : '280px';

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed));
    }, [sidebarCollapsed]);

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
        { name: 'Explore', href: '/explore', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
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
                ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
                ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
                style={{ width: sidebarWidth, background: 'var(--card-bg)', borderRight: '1px solid var(--border-color)' }}>

                {/* Logo */}
                <div className="p-6 border-b sidebar-logo" style={{ borderColor: 'var(--border-color)' }}>
                    <Link href="/feed" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                             style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                            RP
                        </div>
                        <div className="sidebar-logo-text">
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
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            <span className="truncate">{item.name}</span>
                            {item.badge > 0 && (
                                <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full text-white badge-text"
                                      style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </Link>
                    ))}

                    {/* Sidebar Collapse Toggle - Desktop only */}
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="sidebar-link w-full sidebar-toggle-desktop">
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d={sidebarCollapsed
                                      ? 'M13 5l7 7-7 7M5 5l7 7-7 7'
                                      : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'
                                  } />
                        </svg>
                        <span>{sidebarCollapsed ? 'Perluas' : 'Ciutkan'}</span>
                    </button>
                </nav>

                {/* Dark Mode Toggle & User Info */}
                <div className="absolute bottom-0 left-0 right-0 border-t" style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}>
                    {/* Dark Mode Toggle */}
                    <div className="px-4 pt-3">
                        <button onClick={() => setDarkMode(!darkMode)}
                                className="theme-toggle-btn">
                            {darkMode ? (
                                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                            <span>{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-4 sidebar-user-section">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
                            <img
                                src={user.avatar_url || `/assets/avatars/${user.avatar || 'default.svg'}`}
                                alt={user.fullname}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0 sidebar-user-info">
                                <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user.fullname}</p>
                                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>@{user.username}</p>
                            </div>
                            <button onClick={() => { if (confirm('Logout?')) router.post(route('logout')); }} 
                                    className="p-1.5 rounded-lg btn-icon flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`pt-16 lg:pt-0 transition-all duration-300`}
                  style={window.innerWidth >= 1024 ? { marginLeft: sidebarCollapsed ? '80px' : '280px' } : {}}>
                <div className="max-w-3xl mx-auto px-4 py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
