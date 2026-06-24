import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.fullname || user.name,
            username: user.username || '',
            email: user.email,
            bio: user.bio || '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Informasi Profil
                </h2>

                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Perbarui informasi profil dan alamat email akun Anda.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Nama Lengkap */}
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                    <InputError className="mt-2" message={errors.fullname} />
                </div>

                {/* Username */}
                <div>
                    <InputLabel htmlFor="username" value="Username" />
                    <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm pointer-events-none"
                              style={{ color: 'var(--text-secondary)' }}>@</span>
                        <TextInput
                            id="username"
                            className="block w-full pl-7"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            autoComplete="username"
                            placeholder="username"
                        />
                    </div>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Hanya huruf kecil, angka, dan underscore. Contoh: john_doe
                    </p>
                    <InputError className="mt-2" message={errors.username} />
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Bio */}
                <div>
                    <InputLabel htmlFor="bio" value="Bio" />
                    <textarea
                        id="bio"
                        className="input-modern mt-1 block w-full resize-none"
                        rows={4}
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        placeholder="Ceritakan tentang dirimu..."
                        maxLength={500}
                    />
                    <div className="mt-1 flex justify-between">
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Cerita singkat tentang diri Anda.
                        </p>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {data.bio.length}/500
                        </span>
                    </div>
                    <InputError className="mt-2" message={errors.bio} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-xl p-4" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            Email Anda belum diverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 text-blue-500 underline hover:text-blue-600"
                            >
                                Klik di sini untuk kirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                Tautan verifikasi baru telah dikirim ke email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-medium" style={{ color: '#059669' }}>
                            ✓ Tersimpan
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
