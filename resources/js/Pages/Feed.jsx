import { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PostCard from '@/Components/PostCard';
import toast from '@/Components/Toast';

export default function Feed({ posts: initialPosts, hasMore: initialHasMore }) {
    const [posts, setPosts] = useState(initialPosts || []);
    const [hasMore, setHasMore] = useState(initialHasMore || false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [posting, setPosting] = useState(false);
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);
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
            const res = await axios.get(`/feed?page=${page + 1}`);
            setPosts(prev => [...prev, ...res.data.posts]);
            setHasMore(res.data.has_more);
            setPage(prev => prev + 1);
        } catch (e) {
            console.error('Failed to load posts', e);
        }
        setLoading(false);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Hapus video jika memilih gambar
            if (videoPreview) {
                URL.revokeObjectURL(videoPreview);
                setVideo(null);
                setVideoPreview(null);
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleVideoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Hapus gambar jika memilih video
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
                setImage(null);
                setImagePreview(null);
            }
            setVideo(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const clearMedia = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        if (videoPreview) URL.revokeObjectURL(videoPreview);
        setImage(null);
        setImagePreview(null);
        setVideo(null);
        setVideoPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !image && !video) return;

        setPosting(true);
        const formData = new FormData();
        formData.append('content', content);
        if (image) formData.append('image', image);
        if (video) formData.append('video', video);

        try {
            await axios.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Refresh page to see new post
            window.location.reload();
        } catch (e) {
            toast.error('Gagal membuat postingan');
        }
        setPosting(false);
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
            <Head title="Beranda" />

            {/* Create Post */}
            <div className="post-card mb-6">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-3">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Apa yang Anda pikirkan?"
                            className="input-modern resize-none h-24"
                            maxLength={10000}
                        />
                    </div>
                    {/* Media Preview */}
                    {imagePreview && (
                        <div className="mt-3 relative inline-block">
                            <img src={imagePreview} alt="Preview" className="max-h-48 rounded-xl" />
                            <button type="button" onClick={clearMedia}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                    {videoPreview && (
                        <div className="mt-3 relative video-preview-container">
                            <video src={videoPreview} className="w-full max-h-72 rounded-xl" controls />
                            <button type="button" onClick={clearMedia}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all z-10">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                    className="btn-ghost flex items-center gap-2 text-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Foto
                            </button>
                            <button type="button" onClick={() => videoInputRef.current?.click()}
                                    className="btn-ghost flex items-center gap-2 text-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Video
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                            <input type="file" ref={videoInputRef} onChange={handleVideoSelect} accept=".mp4,.webm,.ogg,.mov,.avi" className="hidden" />
                        </div>
                        <button type="submit" disabled={posting || (!content.trim() && !image && !video)}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                            {posting ? 'Memposting...' : 'Kirim'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} onDelete={handleDelete} />
                ))}
            </div>

            {/* Load More */}
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
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Belum ada postingan</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Mulai dengan membuat postingan pertama Anda!</p>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
