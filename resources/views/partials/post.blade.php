@php
    $avatarSrc = $post->user->avatar_url;
    $fallbackUrl = 'https://ui-avatars.com/api/?name=' . urlencode($post->user->fullname) . '&background=075e54&color=fff';
    $isOwner = ($post->user_id == $currentUser->id);
    $isAdmin = $currentUser->isAdmin();
    $liked = $currentUser->hasLiked($post->id);
@endphp

<div class="post-header">
    <div class="post-user">
        <a href="{{ route('profile', ['id' => $post->user_id]) }}">
            <img src="{{ $avatarSrc }}" class="post-avatar" onerror="this.src='{{ $fallbackUrl }}'">
        </a>
        <div class="post-user-info">
            <a href="{{ route('profile', ['id' => $post->user_id]) }}" class="post-username">{{ $post->user->fullname }}</a>
            <span class="post-time">{{ \Carbon\Carbon::parse($post->created_at)->diffForHumans() }}</span>
        </div>
    </div>
    @if($isOwner || $isAdmin)
    <div class="post-menu-container">
        <button class="post-menu-btn" data-post-id="{{ $post->id }}"><i class="fas fa-ellipsis-h"></i></button>
        <div class="post-menu-dropdown" id="post-menu-{{ $post->id }}">
            <div class="menu-arrow"></div>
            <button class="menu-item edit-post-btn" data-post-id="{{ $post->id }}" data-post-content="{{ htmlspecialchars($post->content) }}"><i class="fas fa-pen"></i> Edit</button>
            <button class="menu-item delete-post-btn" data-post-id="{{ $post->id }}"><i class="fas fa-trash-alt"></i> Hapus</button>
        </div>
    </div>
    @endif
</div>
<div class="post-content">{!! nl2br(e($post->content)) !!}</div>
@if(!empty($post->image))
<div class="post-image"><img src="{{ asset($post->image) }}" onclick="openImageModal(this.src)"></div>
@endif
@if(!empty($post->video))
<div class="post-video">
    <video controls preload="metadata" width="100%">
        <source src="{{ asset($post->video) }}" type="video/{{ pathinfo($post->video, PATHINFO_EXTENSION) === 'webm' ? 'webm' : 'mp4' }}">
        Browser tidak mendukung video.
    </video>
</div>
@endif
<div class="post-actions">
    <button class="action-like like-btn {{ $liked ? 'liked' : '' }}" data-post-id="{{ $post->id }}">
        <i class="{{ $liked ? 'fas' : 'far' }} fa-heart"></i>
        <span class="like-count">{{ number_format($post->likes_count) }}</span>
    </button>
    <button class="action-comment comment-toggle" data-post-id="{{ $post->id }}">
        <i class="far fa-comment"></i>
        <span>{{ number_format($post->comments_count) }}</span>
    </button>
</div>
<div class="comments-section" id="comments-{{ $post->id }}" style="display: none;">
    <div class="comments-list" id="comments-list-{{ $post->id }}"></div>
    <div class="comment-form">
        <img src="{{ $currentUser->avatar_url }}" class="comment-avatar" onerror="this.src='https://ui-avatars.com/api/?name={{ urlencode($currentUser->fullname) }}&background=075e54&color=fff'">
        <input type="text" class="comment-input" placeholder="Tulis komentar..." data-post-id="{{ $post->id }}">
        <button class="comment-submit" data-post-id="{{ $post->id }}">Kirim</button>
    </div>
</div>
