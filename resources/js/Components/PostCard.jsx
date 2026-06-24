import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import toast from '@/Components/Toast';

export default function PostCard({ post, onDelete }) {
    const [liked, setLiked] = useState(post.is_liked || false);
    const [likeCount, setLikeCount] = useState(post.likes_count || 0);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Edit state
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content || '');
    const [saving, setSaving] = useState(false);

    // Lightbox state
    const [lightbox, setLightbox] = useState(null);

    const editRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        if (!showMenu) return;
        const handler = (e) => {
            if (!e.target.closest('.post-menu')) setShowMenu(false);
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [showMenu]);

    // Focus edit textarea when editing starts
    useEffect(() => {
        if (editing) editRef.current?.focus();
    }, [editing]);

    const handleLike = async () => {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
        try {
            const res = await axios.post('/like', { post_id: post.id });
            if (res.data.success) {
                setLiked(res.data.liked);
                setLikeCount(res.data.like_count);
            }
        } catch {
            setLiked(liked);
            setLikeCount(likeCount);
        }
    };

    const loadComments = async () => {
        if (comments.length > 0) { setShowComments(!showComments); return; }
        setLoadingComments(true);
        try {
            const res = await axios.get(`/comments?post_id=${post.id}`);
            setComments(res.data);
            setShowComments(true);
        } catch {}
        setLoadingComments(false);
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        try {
            const res = await axios.post('/comments', {
                post_id: post.id,
                comment: commentText.trim(),
            });
            if (res.data.success) {
                setComments(prev => [...prev, res.data.comment]);
                setCommentText('');
            }
        } catch {}
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/feed?post=${post.id}`;
        if (navigator.share) {
            try { await navigator.share({ title: 'RuangPustakawan', text: post.content || '', url }); } catch {}
        } else {
            await navigator.clipboard.writeText(url);
            toast.success('Link disalin ke clipboard!');
        }
    };

    // Edit post
    const handleEdit = () => {
        setEditContent(post.content || '');
        setEditing(true);
        setShowMenu(false);

    };

    const handleSaveEdit = async () => {
        if (!editContent.trim()) return;
        setSaving(true);
        try {
            await axios.post('/posts/update', {
                post_id: post.id,
                content: editContent.trim(),
            });
            post.content = editContent.trim();
            post.is_edited = true;
            setEditing(false);
            toast.success('Postingan diperbarui');
        } catch {
            toast.error('Gagal memperbarui postingan');
        }
        setSaving(false);
    };

    const handleCancelEdit = () => {
        setEditContent(post.content || '');
        setEditing(false);
    };

    // Lightbox
    const openLightbox = (type, src) => {
        setLightbox({ type, src });
    };
    const closeLightbox = () => setLightbox(null);

    const timeAgo = (timestamp) => {
        if (!timestamp) return '';
        const now = new Date();
        const date = new Date(timestamp);
        const diffMinutes = Math.floor((now - date) / 60000);
        if (diffMinutes < 1) return 'Baru saja';
        if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} jam lalu`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <>
            <div className="post-card">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <Link href={`/profile/${post.user?.username || post.user_id}`} className="flex items-center gap-3 group">
                        <img
                            src={post.user?.avatar_url || `/assets/avatars/${post.user?.avatar || 'default.svg'}`}
                            alt={post.user?.fullname || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-medium text-sm group-hover:text-blue-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                {post.user?.fullname || 'Unknown'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                @{post.user?.username || 'unknown'} · {timeAgo(post.created_at)}
                                {post.is_edited && (
                                    <span className="inline-flex items-center gap-0.5 ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded"
                                          style={{ background: 'rgba(251,191,36,0.15)', color: '#b8860b' }}>
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        diedit
                                    </span>
                                )}
                            </p>
                        </div>
                    </Link>
                    {(post.can_delete || post.can_edit) && (
                        <div className="relative post-menu">
                            <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                                </svg>
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-40 rounded-xl shadow-lg z-10 py-1 overflow-hidden"
                                     style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                                    {post.can_edit && (
                                        <button onClick={handleEdit}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                                                style={{ color: 'var(--text-primary)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </button>
                                    )}
                                    {post.can_delete && (
                                        <button onClick={() => { onDelete(post.id); setShowMenu(false); }}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 transition-colors"
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content - Edit Mode */}
                {editing ? (
                    <div className="mb-4">
                        <textarea
                            ref={editRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="input-modern resize-none w-full text-sm leading-relaxed"
                            rows={4}
                            maxLength={10000}
                        />
                        <div className="flex items-center justify-end gap-2 mt-2">
                            <button onClick={handleCancelEdit}
                                    className="btn-ghost text-sm px-4 py-1.5">
                                Batal
                            </button>
                            <button onClick={handleSaveEdit} disabled={saving || !editContent.trim()}
                                    className="btn-primary text-sm px-4 py-1.5 disabled:opacity-50">
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Content - View Mode */
                    post.content && (
                        <p className="mb-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                            {post.content}
                        </p>
                    )
                )}

                {/* Image - clickable */}
                {post.image && !editing && (
                    <div className="mb-4 rounded-2xl overflow-hidden cursor-pointer group relative"
                         onClick={() => openLightbox('image', post.image_url || `/${post.image}`)}>
                        <img src={post.image_url || `/${post.image}`} alt="Post image"
                             className="w-full h-auto object-cover max-h-[500px] transition-transform duration-300 group-hover:scale-[1.02]"
                             loading="lazy" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                            <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100"
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Video - clickable */}
                {post.video && !editing && (
                    <div className="mb-4 rounded-2xl overflow-hidden cursor-pointer relative group"
                         onClick={() => openLightbox('video', post.video_url || `/${post.video}`)}>
                        <video className="w-full max-h-[500px]" preload="metadata"
                               style={{ pointerEvents: 'none' }}>
                            <source src={post.video_url || `/${post.video}`} />
                        </video>
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-all duration-300 group-hover:bg-black/30">
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
                                <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                {!editing && (
                    <div className="flex items-center gap-6 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <button onClick={handleLike} className={`flex items-center gap-2 text-sm transition-all duration-200 ${
                            liked ? 'text-red-500' : ''
                        }`} style={{ color: liked ? '' : 'var(--text-secondary)' }}>
                            <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{likeCount}</span>
                        </button>

                        <button onClick={loadComments} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{post.comments_count || 0}</span>
                        </button>

                        <button onClick={handleShare} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        {loadingComments ? (
                            <div className="space-y-3">
                                {[1,2].map(i => (
                                    <div key={i} className="flex gap-2">
                                        <div className="skeleton w-8 h-8 rounded-full" />
                                        <div className="flex-1 space-y-1">
                                            <div className="skeleton h-3 w-24" />
                                            <div className="skeleton h-3 w-48" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {comments.map((comment, idx) => (
                                        <div key={comment.id || idx}>
                                            <div className="flex gap-2">
                                                <img src={comment.user?.avatar_url || `/assets/avatars/${comment.user?.avatar || 'default.svg'}`}
                                                     alt={comment.user?.fullname} className="w-8 h-8 rounded-full object-cover" />
                                                <div>
                                                    <div className="inline-block rounded-xl px-3 py-2"
                                                         style={{ background: 'var(--bg-color)' }}>
                                                        <p className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>
                                                            {comment.user?.fullname || 'Unknown'}
                                                        </p>
                                                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{comment.comment}</p>
                                                    </div>
                                                    <p className="text-xs mt-1 ml-2" style={{ color: 'var(--text-secondary)' }}>
                                                        {comment.time_ago || ''}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Replies */}
                                            {comment.replies?.map(reply => (
                                                <div key={reply.id} className="flex gap-2 ml-10 mt-2">
                                                    <img src={reply.user?.avatar_url || `/assets/avatars/${reply.user?.avatar || 'default.svg'}`}
                                                         alt={reply.user?.fullname} className="w-7 h-7 rounded-full object-cover" />
                                                    <div>
                                                        <div className="inline-block rounded-xl px-3 py-2"
                                                             style={{ background: 'var(--bg-color)' }}>
                                                            <p className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>
                                                                {reply.user?.fullname || 'Unknown'}
                                                            </p>
                                                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{reply.comment}</p>
                                                        </div>
                                                        <p className="text-xs mt-1 ml-2" style={{ color: 'var(--text-secondary)' }}>
                                                            {reply.time_ago || ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {/* Add Comment */}
                                <div className="flex gap-2 mt-3">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleComment(); } }}
                                        placeholder="Tulis komentar..."
                                        className="input-modern flex-1 text-sm"
                                    />
                                    <button onClick={handleComment} disabled={!commentText.trim()}
                                            className="btn-primary text-sm px-4 disabled:opacity-50">
                                        Kirim
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Lightbox Overlay */}
            {lightbox && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                     style={{ background: 'rgba(0,0,0,0.92)' }}
                     onClick={closeLightbox}>
                    {/* Close button */}
                    <button onClick={closeLightbox}
                            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Counter/Info */}
                    <div className="absolute top-4 left-4 text-white/60 text-sm">
                        {lightbox.type === 'image' ? 'Foto' : 'Video'}
                    </div>

                    {/* Media */}
                    <div className="max-w-full max-h-full flex items-center justify-center"
                         onClick={(e) => e.stopPropagation()}>
                        {lightbox.type === 'image' ? (
                            <img src={lightbox.src} alt="Full size"
                                 className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                                 style={{ animation: 'fadeIn 0.3s ease-out' }} />
                        ) : (
                            <video controls autoPlay className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
                                   style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                <source src={lightbox.src} />
                            </video>
                        )}
                    </div>

                    {/* Download button */}
                    <a href={lightbox.src} download
                       onClick={(e) => e.stopPropagation()}
                       className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </a>
                </div>
            )}

            {/* Lightbox Animation */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
}
