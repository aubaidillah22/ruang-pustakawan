import { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PostCard from '@/Components/PostCard';
import toast from '@/Components/Toast';

export default function ProfileShow({ profileUser, isOwnProfile, isFollowing, posts, hasMorePosts }) {
    const [following, setFollowing] = useState(isFollowing);
    const [followersCount, setFollowersCount] = useState(profileUser.followers_count || 0);
    const [postsList, setPostsList] = useState(posts || []);
    const [avatarUrl, setAvatarUrl] = useState(
        profileUser.avatar_url || `/assets/avatars/${profileUser.avatar || 'default.svg'}`
    );
    const [uploading, setUploading] = useState(false);
    const [hoverAvatar, setHoverAvatar] = useState(false);
    const fileInputRef = useRef(null);

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
        try {
            await axios.post('/posts/delete', { post_id: postId });
            setPostsList(prev => prev.filter(p => p.id !== postId));
            toast.success('Postingan dihapus');
        } catch {
            toast.error('Gagal menghapus');
        }
    };

    const handleAvatarClick = () => {
        if (isOwnProfile && !uploading) fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Revoke previous blob URL to avoid memory leak
        if (avatarUrl.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);

        // Show local preview immediately
        const previewUrl = URL.createObjectURL(file);
        setAvatarUrl(previewUrl);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            await axios.post('/profile/update-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Foto profil berhasil diubah!');

            // Refresh halaman untuk update semua komponen
            router.reload({ only: ['profileUser'] });
        } catch (e) {
            toast.error('Gagal mengubah foto profil');
            // Kembalikan ke URL asli
            setAvatarUrl(
                profileUser.avatar_url || `/assets/avatars/${profileUser.avatar || 'default.svg'}`
            );
        }
        setUploading(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title={profileUser.fullname} />

            {/* Profile Header */}
            <div className="post-card mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative"
                         onMouseEnter={() => setHoverAvatar(true)}
                         onMouseLeave={() => setHoverAvatar(false)}>
                        <div className="relative">
                            <img
                                src={avatarUrl}
                                alt={profileUser.fullname}
                                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover ring-4 transition-all duration-200 ${
                                    isOwnProfile ? 'cursor-pointer hover:opacity-80' : ''
                                } ${uploading ? 'opacity-60' : ''}`}
                                style={{ ringColor: 'var(--primary-light)' }}
                                onClick={handleAvatarClick}
                            />

                            {/* Upload overlay (hanya untuk profil sendiri) */}
                            {isOwnProfile && hoverAvatar && !uploading && (
                                <div onClick={handleAvatarClick}
                                     className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 cursor-pointer transition-all duration-200">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            )}

                            {/* Loading spinner */}
                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
                                    <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {profileUser.is_online && (
                            <span className="online-dot w-4 h-4" />
                        )}

                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="hidden"
                        />
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
