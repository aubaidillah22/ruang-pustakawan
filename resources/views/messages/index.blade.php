@extends('layouts.app')

@section('content')
<div class="messages-container">
    <div class="messages-grid">
        <!-- Conversations List -->
        <div class="messages-sidebar">
            <div class="messages-header">
                <h5><i class="fas fa-comment-dots"></i> Pesan</h5>
                <button class="new-chat-btn" id="newChatBtn" title="Percakapan Baru"><i class="fas fa-plus"></i></button>
            </div>
            <!-- New Chat Search Modal -->
            <div class="new-chat-overlay" id="newChatOverlay" style="display:none;">
                <div class="new-chat-modal">
                    <div class="new-chat-modal-header">
                        <h6>Percakapan Baru</h6>
                        <button class="new-chat-close" id="newChatClose">&times;</button>
                    </div>
                    <div class="new-chat-search">
                        <input type="text" id="newChatSearch" placeholder="Cari anggota..." autocomplete="off">
                    </div>
                    <div class="new-chat-results" id="newChatResults">
                        <div class="new-chat-hint">Ketik minimal 2 karakter untuk mencari</div>
                    </div>
                </div>
            </div>
            <div class="conversations-list" id="conversationsList">
                @forelse($conversations as $conv)
                <a href="{{ route('messages.show', $conv->other_user->id) }}" class="conversation-item {{ request()->route('user') && request()->route('user')->id == $conv->other_user->id ? 'active' : '' }}">
                    <div class="conversation-avatar-wrapper">
                        <img src="{{ $conv->other_user->avatar_url }}" class="conversation-avatar"
                             onerror="this.src='https://ui-avatars.com/api/?name={{ urlencode($conv->other_user->fullname) }}&background=075e54&color=fff'">
                        @if($conv->is_online ?? false)
                        <span class="conversation-online-dot"></span>
                        @endif
                    </div>
                    <div class="conversation-info">
                        <div class="conversation-name">{{ $conv->other_user->fullname }}</div>
                        <div class="conversation-preview">{{ Str::limit($conv->message ?? '[Gambar]', 40) }}</div>
                    </div>
                    <div class="conversation-time">{{ \Carbon\Carbon::parse($conv->created_at)->diffForHumans() }}</div>
                </a>
                @empty
                <div class="conversation-empty">
                    <i class="fas fa-inbox"></i>
                    <p>Belum ada percakapan</p>
                </div>
                @endforelse
            </div>
        </div>

        <!-- Messages Area -->
        <div class="messages-main">
            <div class="messages-welcome">
                <div class="welcome-icon"><i class="fas fa-comment-dots"></i></div>
                <h4>Pesan Pribadi</h4>
                <p>Pilih percakapan untuk mulai mengirim pesan</p>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
// New Chat Modal
const newChatBtn = document.getElementById('newChatBtn');
const newChatOverlay = document.getElementById('newChatOverlay');
const newChatClose = document.getElementById('newChatClose');
const newChatSearch = document.getElementById('newChatSearch');
const newChatResults = document.getElementById('newChatResults');

newChatBtn.addEventListener('click', () => {
    newChatOverlay.style.display = 'flex';
    newChatSearch.focus();
});

function closeNewChat() {
    newChatOverlay.style.display = 'none';
    newChatSearch.value = '';
    newChatResults.innerHTML = '<div class="new-chat-hint">Ketik minimal 2 karakter untuk mencari</div>';
}

newChatClose.addEventListener('click', closeNewChat);
newChatOverlay.addEventListener('click', (e) => {
    if (e.target === newChatOverlay) closeNewChat();
});

let searchTimer;
newChatSearch.addEventListener('input', function() {
    clearTimeout(searchTimer);
    const q = this.value.trim();
    if (q.length < 2) {
        newChatResults.innerHTML = '<div class="new-chat-hint">Ketik minimal 2 karakter untuk mencari</div>';
        return;
    }
    searchTimer = setTimeout(async () => {
        newChatResults.innerHTML = '<div class="new-chat-hint">Mencari...</div>';
        try {
            const response = await fetch(`/search?q=${encodeURIComponent(q)}`);
            const data = await response.json();
            const users = data.users || [];
            if (users.length === 0) {
                newChatResults.innerHTML = '<div class="new-chat-hint">Tidak ditemukan</div>';
            } else {
                newChatResults.innerHTML = users.map(u => `
                    <a href="/messages/${u.id}" class="new-chat-user">
                        <img src="/assets/avatars/${u.avatar}" class="new-chat-user-avatar"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullname)}&background=075e54&color=fff'">
                        <div class="new-chat-user-info">
                            <div class="new-chat-user-name">${escapeHtml(u.fullname)}</div>
                            <div class="new-chat-user-username">@${escapeHtml(u.username)}</div>
                        </div>
                    </a>
                `).join('');
            }
        } catch(e) {
            newChatResults.innerHTML = '<div class="new-chat-hint">Gagal mencari</div>';
        }
    }, 300);
});

// Poll for new conversations periodically
setInterval(async () => {
    try {
        const response = await fetch('{{ route("messages.conversations") }}');
        const data = await response.json();
        if (data && data.length > 0) {
            const list = document.getElementById('conversationsList');
            // Clear existing and rebuild
            list.innerHTML = data.map(c => `
                <a href="/messages/${c.user_id}" class="conversation-item">
                    <div class="conversation-avatar-wrapper">
                        <img src="${c.avatar_url}" class="conversation-avatar"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullname)}&background=075e54&color=fff'">
                        ${c.is_online ? '<span class="conversation-online-dot"></span>' : ''}
                    </div>
                    <div class="conversation-info">
                        <div class="conversation-name">${escapeHtml(c.fullname)}</div>
                        <div class="conversation-preview">${escapeHtml(c.last_message)}</div>
                    </div>
                    <div class="conversation-time">${c.last_time}</div>
                    ${c.unread_count > 0 ? `<span class="conversation-unread">${c.unread_count}</span>` : ''}
                </a>
            `).join('');
        }
    } catch(e) {}
}, 10000);
</script>
@endpush
@endsection
