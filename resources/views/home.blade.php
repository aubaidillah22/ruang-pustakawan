@extends('layouts.app')

@section('content')
<div class="home-container">
    <div class="home-feed">
        <!-- Stories -->
        <div class="stories-wrapper">
            <div class="glass-stories" id="storiesScroll">
                <div class="stories-arrow stories-arrow-left" onclick="scrollStories(-1)">
                    <i class="fas fa-chevron-left"></i>
                </div>
                <div class="story-item">
                    <div class="story-ring">
                        <img src="{{ $currentUser->avatar_url }}" onerror="this.src='https://ui-avatars.com/api/?name={{ urlencode($currentUser->fullname) }}&background=075e54&color=fff'">
                    </div>
                    <span>Anda</span>
                </div>
                @foreach($members->take(8) as $member)
                <a href="{{ route('profile', ['id' => $member->id]) }}" class="story-item" style="text-decoration:none;">
                    <div class="story-ring">
                        <img src="{{ $member->avatar_url }}" onerror="this.src='https://ui-avatars.com/api/?name={{ urlencode($member->fullname) }}&background=075e54&color=fff'">
                    </div>
                    <span>{{ Str::limit($member->fullname, 10, '') }}</span>
                </a>
                @endforeach
                <div class="stories-arrow stories-arrow-right" onclick="scrollStories(1)">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        </div>

        <!-- Create Post -->
        <div class="glass-create-post">
            <div class="create-post-avatar">
                <img src="{{ $currentUser->avatar_url }}" onerror="this.src='https://ui-avatars.com/api/?name={{ urlencode($currentUser->fullname) }}&background=075e54&color=fff'">
            </div>
            <form method="POST" enctype="multipart/form-data" class="create-post-form" id="postForm">
                @csrf
                <input type="text" name="post_content" class="create-post-input" placeholder="Apa yang sedang Anda pikirkan?">
                <div class="create-post-actions">
                    <label class="photo-btn" title="Upload Gambar">
                        <i class="fas fa-image"></i>
                        <input type="file" name="post_image" id="postImage" accept="image/*" style="display: none;" onchange="previewImage(this)">
                    </label>
                    <label class="photo-btn" title="Upload Video">
                        <i class="fas fa-video"></i>
                        <input type="file" name="post_video" id="postVideo" accept="video/*" style="display: none;" onchange="previewVideo(this)">
                    </label>
                    <button type="submit" class="post-submit-btn">Posting</button>
                </div>
                <div id="imagePreviewContainer" class="image-preview-container" style="display: none;">
                    <img id="imagePreview" class="image-preview">
                    <button type="button" class="remove-image-btn" onclick="clearImage()">&times;</button>
                </div>
                <div id="videoPreviewContainer" class="image-preview-container" style="display: none;">
                    <video id="videoPreview" class="image-preview" controls preload="metadata"></video>
                    <button type="button" class="remove-image-btn" onclick="clearVideo()">&times;</button>
                </div>
            </form>
        </div>

        <!-- Skeleton Loading -->
        <div id="skeletonContainer"></div>

        <!-- Feed Posts -->
        @if($posts->isEmpty())
            <div class="glass-empty" id="emptyState">
                <i class="fas fa-comments"></i>
                <h4>Belum ada postingan</h4>
                <p>Jadilah yang pertama untuk berbagi cerita!</p>
            </div>
            <div id="postsFeed" style="display:none;"></div>
        @else
            <div id="postsFeed">
            @foreach($posts as $post)
                <div class="glass-post" id="post-{{ $post->id }}">
                    @include('partials.post', ['post' => $post, 'currentUser' => $currentUser])
                </div>
            @endforeach
            </div>

            @if($hasMore)
            <div class="load-more-container">
                <button class="load-more-btn" id="loadMoreBtn" data-page="1">Muat Lebih Banyak</button>
            </div>
            @endif
        @endif

        <!-- Infinite Scroll Sentinel -->
        <div id="infiniteScrollSentinel" style="height:1px;"></div>
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

@if(session('login_success'))
@push('scripts')
<script>
showToast('Selamat Datang! Login berhasil.', 'success', 4000);
</script>
@endpush
@endif
@endsection
