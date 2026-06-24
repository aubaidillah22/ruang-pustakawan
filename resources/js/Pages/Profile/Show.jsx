import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PostCard from '@/Components/PostCard';
import toast from '@/Components/Toast';

export default function ProfileShow({ profileUser, isOwnProfile, isFollowing, posts, hasMorePosts }) {
    const [following, setFollowing] = useState(isFollowing);
    const [followersCount, setFollowersCount] = useState(profileUser.followers_count || 0);
    const [postsList, setPostsList] = useState(posts || []);

    const handleFollow = async () => {
        try {
            const res = await axios.post('/follow', { user_id: profileUser.id });
            if (res.data.success) {
                setFollowing(res.data.following);
                setFollowersCount(prev => res.data.following ? prev + 1 : prev - 1);
            }
        } catch {
            toast.error('Gagal mengikuti user');
        }
    };

    const handleDelete = async (postId) => {
        if (!confirm('Hapus postingan ini?')) return;
        try {
            await axios.post('/posts/delete', { post_id: postId });
            setPostsList(prev => prev.filter(p => p.id !== postId));
            toast.success('Postingan dihapus');
        } catch {
            toast.error('Gagal menghapus');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={profileUser.fullname} />

            {/* Profile Header */}
            <div className="post-card mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={profileUser.avatar_url || `/assets/avatars/${profileUser.avatar || 'default.svg'}`}
                            alt={profileUser.fullname}
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover ring-4"
                            style={{ ringColor: 'var(--primary-light)' }}
                        />
                        {profileUser.is_online && (
                            <span className="online-dot w-4 h-4" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{profileUser.fullname}</h1>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>@{profileUser.username}</p>
                            </div>
                            {!isOwnProfile && (
                                <button onClick={handleFollow}
                                        className={`px-6 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                                            following
                                                ? 'btn-ghost border' 
                                                : 'btn-primary'
                                        }`}>
                                    {following ? 'Mengikuti' : 'Ikuti'}
                                </button>
                            )}
                            {isOwnProfile && (
                                <Link href={route('profile.edit')}
                                      className="btn-ghost text-sm border" style={{ borderColor: 'var(--border-color)' }}>
                                    Edit Profil
                                </Link>
                            )}
                        </div>

                        {profileUser.bio && (
                            <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {profileUser.bio}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex justify-center sm:justify-start gap-6 mt-4">
                            <div className="text-center">
                                <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{profileUser.posts_count || 0}</span>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Postingan</p>
                            </div>
                            <div className="text-center">
                                <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{followersCount}</span>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pengikut</p>
                            </div>
                            <div className="text-center">
                                <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{profileUser.following_count || 0}</span>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Mengikuti</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
                {postsList.map(post => (
                    <PostCard key={post.id} post={post} onDelete={handleDelete} />
                ))}
            </div>

            {postsList.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">📝</div>
                    <p style={{ color: 'var(--text-secondary)' }}>Belum ada postingan</p>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
