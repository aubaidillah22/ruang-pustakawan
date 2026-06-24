import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import toast from '@/Components/Toast';

const EMOJIS = ['😊','😂','❤️','🔥','👍','🥰','😍','🤣','😁','💪','😎','✨','🎉','💯','🙏','😭','🥺','😤','🤔','🤗','😴','🥳','😅','😉','💕','👏','🙌','✅','⭐','🎯'];

export default function MessagesShow({ conversationUser, messages: initialMessages, isOnline }) {
    const { auth } = usePage().props;
    const currentUserId = auth.user.id;

    const [messages, setMessages] = useState(initialMessages || []);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(initialMessages?.length || 0);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [lightboxImg, setLightboxImg] = useState(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const typingIntervalRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const emojiRef = useRef(null);

    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    };

    useEffect(() => {
        scrollToBottom(false);
    }, [messages.length]);

    // Mark messages as read
    useEffect(() => {
        axios.post(`/messages/mark-read/${conversationUser.username}`).catch(() => {});
    }, [conversationUser.id]);

    // Close emoji picker on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target)) {
                setShowEmoji(false);
            }
        };
        if (showEmoji) {
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }
    }, [showEmoji]);

    const lastSeenText = () => {
        if (isOnline) return 'Online';
        if (!conversationUser.last_seen_at) return 'Offline';
        const diff = Math.floor((new Date() - new Date(conversationUser.last_seen_at)) / 60000);
        if (diff < 1) return 'Online';
        if (diff < 60) return `Terakhir dilihat ${diff} menit lalu`;
        const hours = Math.floor(diff / 60);
        if (hours < 24) return `Terakhir dilihat ${hours} jam lalu`;
        const days = Math.floor(hours / 24);
        return `Terakhir dilihat ${days} hari lalu`;
    };

    const formatReadAt = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    // Listen for new messages & typing via Echo
    useEffect(() => {
        if (!window.Echo) return;

        const myChannel = window.Echo.private(`chat.${currentUserId}`);

        myChannel.listen('.NewMessage', (e) => {
            if (e.sender_id === conversationUser.id && e.sender_id !== currentUserId) {
                setMessages(prev => [...prev, {
                    id: e.id,
                    sender_id: e.sender_id,
                    receiver_id: e.receiver_id,
                    message: e.message,
                    image: e.image,
                    image_url: e.image ? (e.image.startsWith('http') ? e.image : `/${e.image}`) : null,
                    created_at: new Date().toISOString(),
                    time_ago: 'Baru saja',
                    is_read: false,
                    sender: { fullname: e.sender_name, avatar: e.sender_avatar },
                }]);
                axios.post(`/messages/mark-read/${conversationUser.username}`).catch(() => {});
                setOtherTyping(false);
            }
        });

        myChannel.listen('.UserTyping', (e) => {
            if (e.sender_id === conversationUser.id) {
                setOtherTyping(true);
                clearTimeout(typingIntervalRef.current);
                typingIntervalRef.current = setTimeout(() => setOtherTyping(false), 3000);
            }
        });

        return () => {
            try { window.Echo.leave(`chat.${currentUserId}`); } catch {}
            clearTimeout(typingIntervalRef.current);
        };
    }, [conversationUser.id, currentUserId]);

    // Emit typing event
    const emitTyping = useCallback(() => {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            axios.post('/messages/typing', { receiver_id: conversationUser.id }).catch(() => {});
        }, 300);
    }, [conversationUser.id]);

    // Load older messages (infinite scroll up)
    const loadOlder = async () => {
        if (loadingOlder || !hasMore) return;
        setLoadingOlder(true);
        try {
            const res = await axios.get(`/messages/fetch/${conversationUser.username}?offset=${offset}`);
            if (res.data.messages?.length > 0) {
                setMessages(prev => [...res.data.messages, ...prev]);
                setOffset(prev => prev + res.data.messages.length);
                setHasMore(res.data.has_more);
            } else {
                setHasMore(false);
            }
        } catch {}
        setLoadingOlder(false);
    };

    // Infinite scroll handler
    const handleScroll = () => {
        const el = chatContainerRef.current;
        if (!el || loadingOlder || !hasMore) return;
        if (el.scrollTop < 50) {
            const prevScrollHeight = el.scrollHeight;
            loadOlder().then(() => {
                requestAnimationFrame(() => {
                    if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight - prevScrollHeight;
                    }
                });
            });
        }
    };

    const handleSend = async () => {
        if ((!newMessage.trim() && !imageFile) || sending) return;
        setSending(true);

        const formData = new FormData();
        formData.append('receiver_id', conversationUser.id);
        if (newMessage.trim()) formData.append('message', newMessage.trim());
        if (imageFile) formData.append('image', imageFile);

        try {
            const res = await axios.post('/messages/send', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setMessages(prev => [...prev, res.data.message]);
                setNewMessage('');
                clearImage();
                scrollToBottom();
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                }
            }
        } catch {
            toast.error('Gagal mengirim pesan');
        }
        setSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        if (e.key === 'Escape') {
            setShowEmoji(false);
            setLightboxImg(null);
        }
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        emitTyping();
        // Auto-resize textarea
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 128) + 'px';
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleDeleteMessage = async (msgId) => {
        if (!confirm('Hapus pesan ini?')) return;
        setDeletingId(msgId);
        try {
            await axios.post('/messages/delete', { message_id: msgId });
            setMessages(prev => prev.filter(m => m.id !== msgId));
            toast.success('Pesan dihapus');
        } catch {
            toast.error('Gagal menghapus pesan');
        }
        setDeletingId(null);
    };

    const insertEmoji = (emoji) => {
        const el = textareaRef.current;
        if (el) {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const newVal = newMessage.substring(0, start) + emoji + newMessage.substring(end);
            setNewMessage(newVal);
            requestAnimationFrame(() => {
                el.focus();
                el.selectionStart = el.selectionEnd = start + emoji.length;
            });
        } else {
            setNewMessage(prev => prev + emoji);
        }
        setShowEmoji(false);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hari ini';
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return date.toLocaleDateString('id-ID', { weekday: 'long' });
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const shouldShowDate = (msg, idx) => {
        if (idx === 0) return true;
        const prev = messages[idx - 1];
        if (!prev) return true;
        return new Date(msg.created_at).toDateString() !== new Date(prev.created_at).toDateString();
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Chat dengan ${conversationUser.fullname}`} />

            <div className="post-card flex flex-col h-[calc(100vh-8rem)] p-0 overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}>
                    <Link href="/messages" className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <Link href={`/profile/${conversationUser.username}`} className="relative flex-shrink-0">
                        <img src={conversationUser.avatar_url || `/assets/avatars/${conversationUser.avatar || 'default.svg'}`}
                             alt={conversationUser.fullname} className="w-10 h-10 rounded-full object-cover hover:ring-2 ring-blue-400 transition-all" />
                        {isOnline && <span className="online-dot w-3 h-3 border-2" style={{ borderColor: 'var(--card-bg)' }} />}
                    </Link>
                    <Link href={`/profile/${conversationUser.username}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                        <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{conversationUser.fullname}</p>
                        <p className="text-xs" style={{ color: isOnline ? '#22c55e' : 'var(--text-secondary)' }}>
                            {isOnline ? 'Online' : lastSeenText()}
                        </p>
                    </Link>
                    <Link href={`/profile/${conversationUser.username}`}
                          className="p-2 rounded-lg btn-icon flex-shrink-0" title="Lihat profil">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>
                </div>

                {/* Messages */}
                <div ref={chatContainerRef} onScroll={handleScroll}
                     className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                    {loadingOlder && (
                        <div className="flex justify-center py-3">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary-light)', animationDelay: '0s' }} />
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary-light)', animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary-light)', animationDelay: '0.2s' }} />
                            </div>
                        </div>
                    )}
                    {!hasMore && messages.length > 0 && (
                        <p className="text-center text-xs py-2" style={{ color: 'var(--text-secondary)' }}>
                            — Awal percakapan —
                        </p>
                    )}

                    {messages.map((msg, idx) => {
                        const isSent = msg.sender_id !== conversationUser.id;
                        const showDate = shouldShowDate(msg, idx);
                        const isRead = msg.is_read || !!msg.read_at;
                        const readAtTime = msg.read_at ? formatReadAt(msg.read_at) : null;
                        return (
                            <div key={msg.id || `msg-${idx}`} className="group/message">
                                {showDate && (
                                    <p className="text-center text-xs py-3" style={{ color: 'var(--text-secondary)' }}>
                                        <span className="px-3 py-1 rounded-full" style={{ background: 'var(--bg-color)' }}>
                                            {formatDate(msg.created_at)}
                                        </span>
                                    </p>
                                )}
                                <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-1 relative`}>
                                    {isSent && (
                                        <button
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            disabled={deletingId === msg.id}
                                            className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover/message:opacity-100 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            style={{ color: 'var(--text-secondary)' }}
                                            title="Hapus pesan">
                                            {deletingId === msg.id ? (
                                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            )}
                                        </button>
                                    )}
                                    <div className={`chat-bubble ${isSent ? 'sent' : 'received'} max-w-[80%]`}>
                                        {/* Image message */}
                                        {msg.image && (
                                            <div className="mb-2 -mx-3 -mt-3 rounded-t-xl overflow-hidden cursor-pointer"
                                                 onClick={() => setLightboxImg(msg.image_url || `/${msg.image}`)}>
                                                <img src={msg.image_url || `/${msg.image}`}
                                                     alt="Gambar" className="w-full max-h-64 object-cover hover:scale-105 transition-transform duration-200" />
                                            </div>
                                        )}
                                        {msg.message && (
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                        )}
                                        <div className={`flex items-center justify-end gap-1 mt-1 ${isSent ? '' : ''}`}>
                                            <span className={`text-[10px] ${isSent ? 'text-blue-200' : ''}`}
                                                  style={{ color: isSent ? '' : 'var(--text-secondary)' }}>
                                                {formatTime(msg.created_at)}
                                            </span>
                                            {isSent && (
                                                <span className="flex items-center gap-0.5" title={isRead && readAtTime ? `Dilihat ${readAtTime}` : 'Terkirim'}>
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill={isRead ? '#60a5fa' : '#94a3b8'}>
                                                        <path d="M1 8.5L4.5 12L14 3" stroke={isRead ? '#60a5fa' : '#94a3b8'} strokeWidth="1.5" fill="none" />
                                                        <path d="M6.5 8.5L10 12L15.5 5" stroke={isRead ? '#60a5fa' : 'none'} strokeWidth="1.5" fill="none" />
                                                    </svg>
                                                    {isRead && readAtTime && (
                                                        <span className="text-[9px] text-blue-400 hidden group-hover/message:inline">{readAtTime}</span>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {otherTyping && (
                        <div className="flex justify-start mb-1">
                            <div className="chat-bubble received">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium mr-1" style={{ color: 'var(--text-secondary)' }}>{conversationUser.fullname.split(' ')[0]}</span>
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                    <div className="px-5 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="relative inline-block">
                            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg object-cover" />
                            <button onClick={clearImage}
                                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all text-xs">
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="px-5 py-4 border-t flex-shrink-0 relative" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-end gap-2">
                        {/* Image upload button */}
                        <button onClick={() => fileInputRef.current?.click()}
                                className="p-2 rounded-lg btn-icon flex-shrink-0 self-end mb-0.5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageSelect}
                               accept="image/*" className="hidden" />

                        {/* Emoji button */}
                        <div className="relative self-end mb-0.5" ref={emojiRef}>
                            <button onClick={() => setShowEmoji(!showEmoji)}
                                    className="p-2 rounded-lg btn-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            {showEmoji && (
                                <div className="absolute bottom-full mb-2 left-0 p-2 rounded-xl shadow-xl border grid grid-cols-10 gap-1 z-50"
                                     style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', minWidth: '280px' }}>
                                    {EMOJIS.map((emoji, i) => (
                                        <button key={i} onClick={() => insertEmoji(emoji)}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg">
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={newMessage}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Ketik pesan..."
                            className="input-modern resize-none min-h-[44px] max-h-32 flex-1 py-3"
                            rows={1}
                        />
                        <button onClick={handleSend} disabled={(!newMessage.trim() && !imageFile) || sending}
                                className="btn-primary px-4 h-[44px] flex-shrink-0 disabled:opacity-50 flex items-center justify-center"
                                style={{ borderRadius: '12px' }}>
                            {sending ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Lightbox */}
            {lightboxImg && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                     onClick={() => setLightboxImg(null)}>
                    <button onClick={() => setLightboxImg(null)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all text-xl z-10">
                        ✕
                    </button>
                    <img src={lightboxImg} alt="Gambar"
                         className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                         onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </AuthenticatedLayout>
    );
}
