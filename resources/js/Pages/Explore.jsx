import { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PostCard from '@/Components/PostCard';
import toast from '@/Components/Toast';

export default function Explore({ trendingPosts: initialPosts, hasMore: initialHasMore, suggestedUsers }) {
    const [posts, setPosts] = useState(initialPosts || []);
    const [hasMore, setHasMore] = useState(initialHasMore || false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [users, setUsers] = useState(suggestedUsers || []);
    const loadMoreRef = useRef(null);

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
            const res = await axios.get('/explore?page=' + (page + 1), {
                headers: { Accept: 'application/json' }
            });
            setPosts(prev => [...prev, ...res.data.posts]);
            setHasMore(res.data.has_more);
            setPage(prev => prev + 1);
        } catch (e) {
            console.error('Failed to load more posts', e);
        }
        setLoading(false);
    };

    const handleFollow = async (userId) => {
        try {
            const res = await axios.post('/follow', { user_id: userId });
            if (res.data.success && res.data.following) {
                setUsers(prev => prev.filter(u => u.id !== userId));
                toast.success('Mengikuti user');
            }
        } catch {
            toast.error('Gagal mengikuti');
        }
    };

    const handleDelete = async (postId) => {
        try {
            await axios.post('/posts/delete', { post_id: postId });
            setPosts(prev => prev.filter(p => p.id !== postId));
            toast.success('Postingan dihapus');
        } catch {
            toast.error('Gagal menghapus');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Explore" />

            {/* Suggested Users */}
            {users.length > 0 && (
                <div className="post-card mb-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Pustakawan untuk diikuti
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {users.map((u) => (
                            <div key={u.id}
                                 className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                 style={{ border: '1px solid var(--border-color)' }}>
                                <Link href={`/profile/${u.username}`}>
                                    <img src={u.avatar_url || `/assets/avatars/${u.avatar || 'default.svg'}`}
                                         alt={u.fullname} className="w-12 h-12 rounded-full object-cover" />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/profile/${u.username}`}>
                                        <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{u.fullname}</p>
                                    </Link>
                                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>@{u.username}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{u.posts_count} postingan</p>
                                </div>
                                <button onClick={() => handleFollow(u.id)}
                                        className="btn-primary text-xs px-4 py-1.5 whitespace-nowrap">
                                    Ikuti
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Trending Posts */}
            <div className="mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Trending
                </h2>
            </div>

            <div className="space-y-4">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} onDelete={handleDelete} />
                ))}
            </div>

            {/* Load More / Infinite Scroll Sentinel */}
            {hasMore && (
                <div ref={loadMoreRef} className="text-center py-8">
                    {loading ? (
                        <div className="space-y-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="post-card">
                                    <div className="flex items-center gap-3">
                                        <div className="skeleton w-10 h-10 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <div className="skeleton h-4 w-32" />
                                            <div className="skeleton h-3 w-24" />
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="skeleton h-4 w-full" />
                                        <div className="skeleton h-4 w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>Muat lebih banyak...</p>
                    )}
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    — Tidak ada postingan lagi —
                </p>
            )}

            {posts.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">🔍</div>
                    <p style={{ color: 'var(--text-secondary)' }}>Belum ada postingan trending</p>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
