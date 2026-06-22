@extends('layouts.app')

@section('content')
@if(session('success'))
<script>document.addEventListener('DOMContentLoaded', function(){ showToast('{{ session('success') }}', 'success', 3000); });</script>
@endif
<div class="profile-container">
    <div class="profile-grid">
        <!-- Profile Header -->
        <div class="profile-header glass-card">
            <div class="profile-cover"></div>
            <div class="profile-avatar-wrapper">
                <div class="profile-avatar">
                    <img src="{{ $profileUser->avatar_url }}" id="profileAvatar"
                         onerror="this.src='https://ui-avatars.com/api/?name={{ urlencode($profileUser->fullname) }}&background=075e54&color=fff&size=150'">
                    @if($isOwnProfile)
                    <button class="edit-avatar-btn" data-bs-toggle="modal" data-bs-target="#editModal">
                        <i class="fas fa-camera"></i>
                    </button>
                    @endif
                </div>
                @if(!$isOwnProfile)
                <div class="profile-actions" id="profileActions">
                    <button class="edit-profile-btn follow-profile-btn" data-user-id="{{ $profileUser->id }}" data-is-following="{{ $isFollowing ? 'true' : 'false' }}">
                        <i class="fas {{ $isFollowing ? 'fa-user-check' : 'fa-user-plus' }}"></i>
                        {{ $isFollowing ? 'Mengikuti' : 'Ikuti' }}
                    </button>
                    <a href="{{ route('messages.show', $profileUser->id) }}" class="edit-profile-btn message-profile-btn" data-is-following="{{ $isFollowing ? 'true' : 'false' }}">
                        <i class="fas fa-comment-dots"></i> Pesan
                    </a>
                </div>
                @endif
                <div class="profile-info">
                    <h2 class="profile-name">{{ $profileUser->fullname }}</h2>
                    <p class="profile-username">{{ '@' . $profileUser->username }}</p>
                    @if(!empty($profileUser->bio))
                        <p class="profile-bio">{!! nl2br(e($profileUser->bio)) !!}</p>
                    @endif
                    <div class="profile-stats">
                        <div class="stat"><span class="stat-number">{{ $totalPosts }}</span><span class="stat-label">Postingan</span></div>
                        <div class="stat"><span class="stat-number">{{ $followersCount }}</span><span class="stat-label">Pengikut</span></div>
                        <div class="stat"><span class="stat-number">{{ $followingCount }}</span><span class="stat-label">Mengikuti</span></div>
                        <div class="stat"><span class="stat-number">{{ $totalLikes }}</span><span class="stat-label">Total Suka</span></div>
                    </div>
                    @if($isOwnProfile)
                        <button class="edit-profile-btn" data-bs-toggle="modal" data-bs-target="#editModal">
                            <i class="fas fa-user-edit"></i> Edit Profil
                        </button>
                    @endif
                </div>
            </div>
        </div>

        <!-- Posts -->
        <div class="profile-posts">
            <div class="posts-header glass-card">
                <div class="posts-tab active">
                    <i class="fas fa-list-ul"></i> {{ $isOwnProfile ? 'POSTINGAN SAYA' : 'POSTINGAN ' . strtoupper($profileUser->fullname) }}
                </div>
            </div>

            @if($myPosts->isEmpty())
                <div class="empty-posts glass-card">
                    <i class="fas fa-camera"></i>
                    <h4>Belum Ada Postingan</h4>
                    <p>{{ $isOwnProfile ? 'Bagikan cerita atau pengalaman Anda sebagai pustakawan.' : 'Pengguna ini belum memposting apa pun.' }}</p>
                    <a href="{{ route('home') }}" class="create-post-btn">Buat Postingan</a>
                </div>
            @else
                <div class="posts-feed">
                    @foreach($myPosts as $post)
                        <div class="glass-post" id="post-{{ $post->id }}">
                            @include('partials.post', ['post' => $post, 'currentUser' => $currentUser])
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</div>

<!-- Image Modal -->
<div class="modal fade" id="imageModal" tabindex="-1" data-bs-backdrop="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content image-viewer" onclick="event.target === this && bootstrap.Modal.getInstance(this.closest('.modal')).hide()">
            <img id="modalImage" src="" alt="Preview gambar" onclick="bootstrap.Modal.getInstance(this.closest('.modal')).hide()">
        </div>
    </div>
</div>

@if($isOwnProfile)
<!-- Edit Profile Modal -->
<div class="modal fade" id="editModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-modal-content">
            <div class="modal-header glass-modal-header">
                <h5 class="modal-title">Edit Profil</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST" action="{{ route('profile.update') }}" enctype="multipart/form-data">
                @csrf
                <div class="modal-body">
                    @if($errors->any())
                        <div class="alert-glass alert-glass-danger mb-3">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            @foreach($errors->all() as $error)
                                {{ $error }}<br>
                            @endforeach
                        </div>
                    @endif
                    <div class="edit-avatar-container">
                        <img src="{{ $currentUser->avatar_url }}" class="edit-avatar-preview" id="avatarPreview"
                             onerror="this.src='https://ui-avatars.com/api/?name={{ urlencode($currentUser->fullname) }}&background=075e54&color=fff&size=128'">
                        <label class="avatar-upload-btn">
                            <i class="fas fa-camera"></i>
                            <span>Ganti Foto</span>
                            <input type="file" name="avatar" accept="image/*" style="display: none;" onchange="previewAvatar(this)">
                        </label>
                        <small class="avatar-hint">Max 2MB &middot; JPG, PNG, GIF, WebP</small>
                    </div>
                    <div class="form-group">
                        <label>Nama Lengkap</label>
                        <input type="text" name="fullname" class="form-control glass-input" value="{{ $currentUser->fullname }}" required>
                    </div>
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" name="username" class="form-control glass-input" value="{{ $currentUser->username }}" placeholder="huruf kecil, tanpa spasi">
                        <small class="bio-hint">Kosongkan jika tidak ingin mengubah</small>
                    </div>
                    <div class="form-group">
                        <label>Bio</label>
                        <textarea name="bio" class="form-control glass-input" rows="3" placeholder="Ceritakan tentang diri Anda..." maxlength="255">{{ $currentUser->bio ?? '' }}</textarea>
                        <small class="bio-hint">Maksimal 255 karakter</small>
                    </div>
                    <hr class="divider-glass">
                    <div class="form-group">
                        <label>Password Saat Ini</label>
                        <input type="password" name="current_password" class="form-control glass-input" placeholder="Diperlukan untuk mengubah password">
                    </div>
                    <div class="form-group">
                        <label>Password Baru</label>
                        <input type="password" name="new_password" class="form-control glass-input" placeholder="Minimal 8 karakter">
                    </div>
                    <div class="form-group">
                        <label>Konfirmasi Password Baru</label>
                        <input type="password" name="new_password_confirmation" class="form-control glass-input" placeholder="Ketik ulang password baru">
                    </div>
                </div>
                <div class="modal-footer glass-modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endif

@push('scripts')
<script>
// Auto-open edit modal if validation errors exist
@if($errors->any())
document.addEventListener('DOMContentLoaded', function() {
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
});
@endif

// Set initial following class on page load
const followBtnInit = document.querySelector('.follow-profile-btn');
if (followBtnInit && followBtnInit.dataset.isFollowing === 'true') followBtnInit.classList.add('following');

// Follow profile button
(function() {
    let followLoading = false;
    const btn = document.querySelector('.follow-profile-btn');
    if (!btn) return;
    btn.addEventListener('click', async function(e) {
        if (followLoading) return;
        followLoading = true;
        this.classList.add('disabled');
        const userId = this.dataset.userId;
        try {
            const response = await fetch('{{ route("follow.toggle") }}', {
                method: 'POST',
                headers: ajaxHeaders(),
                body: `user_id=${userId}`
            });
            const data = await response.json();
            if (data.success) {
                const isNowFollowing = data.following;
                this.dataset.isFollowing = isNowFollowing ? 'true' : 'false';
                this.classList.toggle('following', isNowFollowing);
                this.innerHTML = isNowFollowing
                    ? '<i class="fas fa-user-check"></i> Mengikuti'
                    : '<i class="fas fa-user-plus"></i> Ikuti';
                showToast(isNowFollowing ? 'Berhasil mengikuti' : 'Berhenti mengikuti',
                          isNowFollowing ? 'success' : 'info', 2000);
                const msgBtn = document.querySelector('.message-profile-btn');
                if (msgBtn) msgBtn.dataset.isFollowing = isNowFollowing ? 'true' : 'false';
            }
        } catch (err) {
            showToast('Gagal mengikuti pengguna', 'error');
        } finally {
            followLoading = false;
            this.classList.remove('disabled');
        }
    });
})();

// Message button — require follow first
document.querySelectorAll('.message-profile-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if (this.dataset.isFollowing !== 'true') {
            e.preventDefault();
            showToast('Ikuti dulu agar bisa kirim pesan ke user ini', 'warning', 4000);
        }
    });
});
</script>
@endpush
@endsection
