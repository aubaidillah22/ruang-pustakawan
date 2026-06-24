import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';

export default function PostCard({ post, onDelete }) {
    const [liked, setLiked] = useState(post.is_liked || false);
    const [likeCount, setLikeCount] = useState(post.likes_count || 0);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleLike = async () => {
        // Optimistic update
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
        try {
            const res = await axios.post('/like', { post_id: post.id });
            if (res.data.success) {
                setLiked(res.data.liked);
                setLikeCount(res.data.like_count);
            }
        } catch {
            // Revert on error
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
            alert('Link disalin ke clipboard!');
        }
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
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
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
                        </p>
                    </div>
                </Link>
                {post.can_delete && (
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                            </svg>
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-1 w-36 rounded-xl shadow-lg z-10 py-1"
                                 style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                                <button onClick={() => { onDelete(post.id); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                    Hapus
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            {post.content && (
                <p className="mb-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                    {post.content}
                </p>
            )}

            {/* Image */}
            {post.image && (
                <div className="mb-4 rounded-2xl overflow-hidden">
                    <img src={post.image_url || `/${post.image}`} alt="Post image" className="w-full h-auto object-cover max-h-[500px]" loading="lazy" />
                </div>
            )}

            {/* Video */}
            {post.video && (
                <div className="mb-4 rounded-2xl overflow-hidden">
                    <video controls className="w-full max-h-[500px]" preload="metadata">
                        <source src={post.video_url || `/${post.video}`} />
                    </video>
                </div>
            )}

            {/* Actions */}
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
    );
}
