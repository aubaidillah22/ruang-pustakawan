import { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function MessagesShow({ conversationUser, messages: initialMessages, isOnline }) {
    const [messages, setMessages] = useState(initialMessages || []);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [typing, setTyping] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mark messages as read
    useEffect(() => {
        axios.post(`/messages/mark-read/${conversationUser.id}`).catch(() => {});
    }, []);

    // Listen for new messages via Echo
    useEffect(() => {
        if (!window.Echo) return;
        const channel = window.Echo.private(`chat.${conversationUser.id}`);
        channel.listen('.NewMessage', (e) => {
            if (e.sender_id === conversationUser.id) {
                setMessages(prev => [...prev, e]);
                axios.post(`/messages/mark-read/${conversationUser.id}`).catch(() => {});
            }
        });
        return () => { try { window.Echo.leave(`chat.${conversationUser.id}`); } catch {} };
    }, [conversationUser.id]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;
        setSending(true);
        try {
            const res = await axios.post('/messages/send', {
                receiver_id: conversationUser.id,
                message: newMessage.trim(),
            });
            if (res.data.success) {
                setMessages(prev => [...prev, res.data.message]);
                setNewMessage('');
            }
        } catch {
            alert('Gagal mengirim pesan');
        }
        setSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTyping = () => {
        // Typing indicator logic can be added here
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return date.toLocaleDateString('id-ID', { weekday: 'long' });
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Chat dengan ${conversationUser.fullname}`} />

            <div className="post-card flex flex-col h-[calc(100vh-8rem)]">
                {/* Chat Header */}
                <div className="flex items-center gap-3 pb-4 mb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <Link href="/messages" className="lg:hidden p-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className="relative">
                        <img src={conversationUser.avatar_url || `/assets/avatars/${conversationUser.avatar || 'default.svg'}`}
                             alt={conversationUser.fullname} className="w-10 h-10 rounded-full object-cover" />
                        {isOnline && <span className="online-dot" />}
                    </div>
                    <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{conversationUser.fullname}</p>
                        <p className="text-xs" style={{ color: isOnline ? '#22c55e' : 'var(--text-secondary)' }}>
                            {isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 px-2">
                    {messages.map((msg, idx) => {
                        const isSent = msg.sender_id === conversationUser.id ? false : true;
                        const showDate = idx === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[idx-1]?.created_at).toDateString();
                        return (
                            <div key={msg.id || idx}>
                                {showDate && (
                                    <p className="text-center text-xs py-2" style={{ color: 'var(--text-secondary)' }}>
                                        {formatDate(msg.created_at)}
                                    </p>
                                )}
                                <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`chat-bubble ${isSent ? 'sent' : 'received'}`}>
                                        <p className="text-sm">{msg.message}</p>
                                        <p className={`text-xs mt-1 ${isSent ? 'text-blue-200' : ''}`} style={{ color: isSent ? '' : 'var(--text-secondary)' }}>
                                            {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {otherTyping && (
                        <div className="flex justify-start">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex gap-2">
                        <textarea
                            value={newMessage}
                            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ketik pesan..."
                            className="input-modern resize-none h-12 max-h-24"
                            rows={1}
                        />
                        <button onClick={handleSend} disabled={!newMessage.trim() || sending}
                                className="btn-primary px-4 disabled:opacity-50">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
