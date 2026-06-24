import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'password', label: 'Kata Sandi', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { id: 'danger', label: 'Hapus Akun', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan Profil" />

            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={`/profile/${user.username}`}
                          className="btn-icon">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Pengaturan</h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kelola informasi profil dan akun Anda</p>
                    </div>
                </div>

                {/* Profile Preview Card */}
                <div className="post-card">
                    <div className="flex items-center gap-4">
                        <img
                            src={user.avatar_url || `/assets/avatars/${user.avatar || 'default.svg'}`}
                            alt={user.fullname}
                            className="w-16 h-16 rounded-full object-cover ring-4"
                            style={{ ringColor: 'var(--primary-light)' }}
                        />
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{user.fullname}</h2>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>@{user.username}</p>
                            {user.bio && (
                                <p className="text-sm mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>{user.bio}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'text-white'
                                : ''
                        }`}
                        style={{
                            background: activeTab === tab.id
                                ? 'linear-gradient(135deg, var(--primary), var(--primary-light))'
                                : 'var(--card-bg)',
                            border: activeTab === tab.id
                                ? 'none'
                                : '1px solid var(--border-color)',
                            color: activeTab === tab.id
                                ? 'white'
                                : 'var(--text-secondary)',
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                        </svg>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6">
                {activeTab === 'profile' && (
                    <div className="post-card">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-2xl"
                        />
                    </div>
                )}

                {activeTab === 'password' && (
                    <div className="post-card">
                        <UpdatePasswordForm className="max-w-2xl" />
                    </div>
                )}

                {activeTab === 'danger' && (
                    <div className="post-card" style={{ borderColor: 'rgba(220, 38, 38, 0.3)' }}>
                        <DeleteUserForm className="max-w-2xl" />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
