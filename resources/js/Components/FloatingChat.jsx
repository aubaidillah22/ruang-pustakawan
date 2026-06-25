import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

const EMOJIS = ['😊','😂','❤️','🔥','👍','🥰','😍','🤣','😁','💪','😎','✨','🎉','💯','🙏','😭','🥺','😤','🤔','🤗'];

export default function FloatingChat() {
    const { auth } = usePage().props;
    const currentUserId = auth.user.id;

    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);

    const messagesEndRef = useRef(null);
    const panelRef = useRef(null);
    const searchRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const emojiRef = useRef(null);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            const res = await axios.get('/messages/conversations/data');
            setConversations(res.data.conversations || []);
            if (!isOpen) setUnreadCount(res.data.unread_count || 0);
        } catch {}
    }, [isOpen]);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 15000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    // Listen for new messages via Echo
    useEffect(() => {
        if (!window.Echo) return;
        const channel = window.Echo.private(`chat.${currentUserId}`);

        channel.listen('.NewMessage', (e) => {
            fetchConversations();
            // If chatting with this user, add message to the chat
            if (selectedUser && (e.sender_id === selectedUser.id || e.receiver_id === selectedUser.id)) {
                setMessages(prev => [...prev, {
                    id: e.id || Date.now(),
                    sender_id: e.sender_id,
                    receiver_id: e.receiver_id,
                    message: e.message,
                    image: e.image,
                    image_url: e.image ? (e.image.startsWith('http') ? e.image : `/${e.image}`) : null,
                    created_at: new Date().toISOString(),
                    is_read: false,
                    sender: { fullname: e.sender_name, avatar: e.sender_avatar },
                }]);
                setOtherTyping(false);
            }
        });

        channel.listen('.UserTyping', (e) => {
            if (selectedUser && e.sender_id === selectedUser.id) {
                setOtherTyping(true);
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 3000);
            }
        });

        return () => {
            try { window.Echo.leave(`chat.${currentUserId}`); } catch {}
            clearTimeout(typingTimeoutRef.current);
        };
    }, [currentUserId, selectedUser, fetchConversations]);

    // Update unread when panel opens
    useEffect(() => {
        if (isOpen) setUnreadCount(0);
    }, [isOpen]);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // Close emoji picker on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
        };
        if (showEmoji) {
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }
    }, [showEmoji]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                if (selectedUser) setSelectedUser(null);
                else if (isOpen) setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, selectedUser]);

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

    const openChat = async (user) => {
        setSelectedUser(user);
        setSearch('');
        setSearchResults([]);
        setMessages([]);
        setLoadingMessages(true);
        try {
            const res = await axios.get(`/messages/fetch/${user.username}`);
            setMessages(res.data.messages || []);
            axios.post(`/messages/mark-read/${user.username}`).catch(() => {});
            fetchConversations();
        } catch {}
        setLoadingMessages(false);
    };

    const goBack = () => {
        setSelectedUser(null);
        setMessages([]);
        fetchConversations();
    };

    const handleSend = async () => {
        if (!newMessage.trim() || sending || !selectedUser) return;
        setSending(true);
        try {
            const res = await axios.post('/messages/send', {
                receiver_id: selectedUser.id,
                message: newMessage.trim(),
            });
            if (res.data.success) {
                setMessages(prev => [...prev, res.data.message]);
                setNewMessage('');
            }
        } catch {}
        setSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Emit typing
    const emitTyping = () => {
        if (!selectedUser) return;
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            axios.post('/messages/typing', { receiver_id: selectedUser.id }).catch(() => {});
        }, 300);
    };

    const insertEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmoji(false);
    };

    const timeAgo = (timestamp) => {
        if (!timestamp) return '';
        const now = new Date();
        const date = new Date(timestamp);
        const diffMinutes = Math.floor((now - date) / 60000);
        if (diffMinutes < 1) return 'Baru saja';
        if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} jam lalu`;
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffDays = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    // Hide on messages page
    if (window.location.pathname.startsWith('/messages')) return null;

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="floating-chat-btn fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                    background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                    boxShadow: isOpen
                        ? '0 0 0 4px rgba(var(--primary-rgb), 0.3)'
                        : '0 8px 25px rgba(var(--primary-rgb), 0.4)',
                }}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
                {!isOpen && unreadCount > 0 && (
                    <>
                        <span className="pulse-ring" />
                        <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold text-white flex items-center justify-center animate-pulse-once"
                              style={{ background: '#ef4444', boxShadow: '0 2px 8px rgba(239,68,68,0.5)' }}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    </>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div
                    ref={panelRef}
                    className="chat-panel fixed bottom-24 right-6 z-50 w-[380px] h-[560px] rounded-2xl shadow-2xl border overflow-hidden flex flex-col"
                    style={{
                        background: 'var(--card-bg)',
                        borderColor: 'var(--border-color)',
                        animation: 'slideUp 0.25s ease-out',
                    }}
                >
                    {/* Header */}
                    <div className="chat-header flex items-center gap-3 px-4 py-3.5 border-b flex-shrink-0"
                         style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}>
                        {selectedUser ? (
                            <>
                                <button onClick={goBack}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                                        style={{ color: 'var(--text-secondary)' }}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="relative flex-shrink-0">
                                    <img src={selectedUser.avatar_url || `/assets/avatars/${selectedUser.avatar || 'default.svg'}`}
                                         alt={selectedUser.fullname} className="w-9 h-9 rounded-full object-cover" />
                                    {selectedUser.is_online && <span className="online-dot w-2.5 h-2.5 border-2" style={{ borderColor: 'var(--card-bg)' }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                        {selectedUser.fullname}
                                    </p>
                                    <p className="text-[11px]" style={{ color: selectedUser.is_online ? '#22c55e' : 'var(--text-secondary)' }}>
                                        {selectedUser.is_online ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <h3 className="font-semibold text-sm flex-1" style={{ color: 'var(--text-primary)' }}>Pesan</h3>
                                <Link href="/messages"
                                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                                      style={{ color: 'var(--text-secondary)' }}
                                      title="Buka halaman pesan">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Chat View */}
                    {selectedUser ? (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                                {loadingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary-light)', animationDelay: '0s' }} />
                                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary-light)', animationDelay: '0.1s' }} />
                                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary-light)', animationDelay: '0.2s' }} />
                                        </div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                                             style={{ background: 'var(--bg-color)' }}>
                                            <svg className="w-7 h-7" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                            {selectedUser.fullname}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            Mulai percakapan dengan {selectedUser.fullname.split(' ')[0]}
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isSent = msg.sender_id !== selectedUser.id;
                                        return (
                                            <div key={msg.id || `msg-${idx}`} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`chat-bubble ${isSent ? 'sent' : 'received'} max-w-[85%]`}>
                                                    {msg.image && (
                                                        <div className="mb-1.5 -mx-3 -mt-3 rounded-t-xl overflow-hidden">
                                                            <img src={msg.image_url || `/${msg.image}`}
                                                                 alt="Gambar" className="w-full max-h-40 object-cover" />
                                                        </div>
                                                    )}
                                                    {msg.message && (
                                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                                    )}
                                                    <div className="flex items-center justify-end gap-1 mt-1">
                                                        <span className={`text-[10px] ${isSent ? 'text-blue-200' : ''}`}
                                                              style={{ color: isSent ? '' : 'var(--text-secondary)' }}>
                                                            {formatTime(msg.created_at)}
                                                        </span>
                                                        {isSent && (
                                                            <svg className="w-3 h-3" viewBox="0 0 16 16" fill={msg.is_read ? '#60a5fa' : '#94a3b8'}>
                                                                <path d="M1 8.5L4.5 12L14 3" stroke={msg.is_read ? '#60a5fa' : '#94a3b8'} strokeWidth="1.5" fill="none" />
                                                                <path d="M6.5 8.5L10 12L15.5 5" stroke={msg.is_read ? '#60a5fa' : 'none'} strokeWidth="1.5" fill="none" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {otherTyping && (
                                    <div className="flex justify-start">
                                        <div className="chat-bubble received">
                                            <div className="typing-indicator">
                                                <span></span><span></span><span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-end gap-2">
                                    <div className="relative" ref={emojiRef}>
                                        <button onClick={() => setShowEmoji(!showEmoji)}
                                                className="p-2 rounded-lg btn-icon flex-shrink-0 self-end mb-0.5">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                        {showEmoji && (
                                            <div className="absolute bottom-full mb-2 left-0 p-2 rounded-xl shadow-lg border grid grid-cols-8 gap-1 z-50"
                                                 style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                                {EMOJIS.map((emoji, i) => (
                                                    <button key={i} onClick={() => insertEmoji(emoji)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg">
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => { setNewMessage(e.target.value); emitTyping(); }}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ketik pesan..."
                                        className="input-modern flex-1 py-2.5 text-sm"
                                    />
                                    <button onClick={handleSend} disabled={!newMessage.trim() || sending}
                                            className="btn-primary px-3 h-[38px] flex-shrink-0 disabled:opacity-50 flex items-center justify-center"
                                            style={{ borderRadius: '10px' }}>
                                        {sending ? (
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Search */}
                            <div className="px-4 py-2.5">
                                <div className="relative">
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Cari pengguna..."
                                        className="input-modern py-2 text-sm"
                                    />
                                    {search && (
                                        <button onClick={() => { setSearch(''); setSearchResults([]); }}
                                                className="absolute right-3 top-2.5" style={{ color: 'var(--text-secondary)' }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="mt-2 rounded-xl border overflow-hidden"
                                         style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                        {searchResults.filter(u => u.id !== currentUserId).map(u => (
                                            <button key={u.id} onClick={() => openChat(u)}
                                                    className="chat-conversation-item w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left"
                                                    style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <div className="relative">
                                                    <img src={u.avatar_url || `/assets/avatars/${u.avatar || 'default.svg'}`}
                                                         alt={u.fullname} className="w-9 h-9 rounded-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{u.fullname}</p>
                                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>@{u.username}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Conversations */}
                            <div className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                                             style={{ background: 'var(--bg-color)' }}>
                                            <svg className="w-7 h-7" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Belum ada pesan</p>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Cari pengguna untuk memulai chat</p>
                                    </div>
                                ) : (
                                    <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                                        {conversations.map(conv => (
                                            <button key={conv.user.id} onClick={() => openChat(conv.user)}
                                                    className="chat-conversation-item w-full flex items-center gap-3 py-3 transition-all duration-200 text-left"
                                                    style={{ borderColor: 'var(--border-color)' }}>
                                                <div className="relative flex-shrink-0">
                                                    <img src={conv.user.avatar_url || `/assets/avatars/${conv.user.avatar || 'default.svg'}`}
                                                         alt={conv.user.fullname} className="w-10 h-10 rounded-full object-cover" />
                                                    {conv.is_online && <span className="online-dot w-3 h-3 border-2" style={{ borderColor: 'var(--card-bg)' }} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                                            {conv.user.fullname}
                                                        </p>
                                                        {conv.last_message && (
                                                            <span className="text-[11px] whitespace-nowrap flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                                                                {timeAgo(conv.last_message.created_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-xs truncate flex-1" style={{
                                                            color: conv.unread_count > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                            fontWeight: conv.unread_count > 0 ? 500 : 400,
                                                        }}>
                                                            {conv.last_message?.message
                                                                ? (conv.last_message.sender_id === currentUserId ? 'Anda: ' : '') + conv.last_message.message
                                                                : 'Mulai percakapan'}
                                                        </p>
                                                        {conv.unread_count > 0 && (
                                                            <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white"
                                                                  style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--primary))' }}>
                                                                {conv.unread_count > 99 ? '99+' : conv.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Slide up animation style */}
                    <style>{`
                        @keyframes slideUp {
                            from { opacity: 0; transform: translateY(20px) scale(0.95); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}
