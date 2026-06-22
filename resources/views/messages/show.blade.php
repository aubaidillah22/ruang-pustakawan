@extends('layouts.app')

@section('content')
<div class="messages-container">
    <div class="messages-grid">
        <!-- Conversations List -->
        <div class="messages-sidebar">
            <div class="messages-header">
                <h5><i class="fas fa-comment-dots"></i> Pesan</h5>
                <a href="{{ route('messages.index') }}" class="btn btn-sm btn-outline-light">
                    <i class="fas fa-sync-alt"></i>
                </a>
            </div>
            <div class="conversations-list">
                @php
                    $currentUser = Auth::user();
                    $allConvs = \App\Models\Message::with('sender:id,fullname,avatar,last_seen_at', 'receiver:id,fullname,avatar,last_seen_at')
                        ->where('sender_id', $currentUser->id)
                        ->orWhere('receiver_id', $currentUser->id)
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->unique(function ($msg) use ($currentUser) {
                            return $msg->sender_id == $currentUser->id ? $msg->receiver_id : $msg->sender_id;
                        });
                @endphp
                @forelse($allConvs as $conv)
                    @php
                        $otherId = $conv->sender_id == $currentUser->id ? $conv->receiver_id : $conv->sender_id;
                        $otherUser = $conv->sender_id == $currentUser->id ? $conv->receiver : $conv->sender;
                        $isOnline = $otherUser && $otherUser->last_seen_at && \Carbon\Carbon::parse($otherUser->last_seen_at)->diffInMinutes(now()) < 5;
                    @endphp
                    <a href="{{ route('messages.show', $otherId) }}" class="conversation-item {{ $otherId == $user->id ? 'active' : '' }}">
                        <div class="conversation-avatar-wrapper">
                            <img src="{{ $otherUser->avatar_url }}" class="conversation-avatar"
                                 onerror="this.src='https://ui-avatars.com/api/?name={{ urlencode($otherUser->fullname) }}&background=075e54&color=fff'">
                            @if($isOnline)
                            <span class="conversation-online-dot"></span>
                            @endif
                        </div>
                        <div class="conversation-info">
                            <div class="conversation-name">{{ $otherUser->fullname }}</div>
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

        <!-- Chat Area -->
        <div class="messages-main">
            <div class="chat-header">
                <a href="{{ route('messages.index') }}" class="chat-back-btn d-md-none"><i class="fas fa-arrow-left"></i></a>
                <img src="{{ $user->avatar_url }}" class="chat-avatar"
                     onerror="this.src='https://ui-avatars.com/api/?name={{ urlencode($user->fullname) }}&background=075e54&color=fff'">
                <div class="chat-user-info">
                    <div class="chat-user-name">{{ $user->fullname }}</div>
                    <div class="chat-user-status" id="userStatus">
                        @php
                            $isOnline = $user->last_seen_at && \Carbon\Carbon::parse($user->last_seen_at)->diffInMinutes(now()) < 5;
                        @endphp
                        @if($isOnline)
                            <span class="status-online"><i class="fas fa-circle"></i> Online</span>
                        @elseif($user->last_seen_at)
                            <span class="status-offline">Terakhir dilihat {{ \Carbon\Carbon::parse($user->last_seen_at)->diffForHumans() }}</span>
                        @else
                            <span class="status-offline">Offline</span>
                        @endif
                    </div>
                    <div class="chat-typing" id="typingIndicator" style="display:none;">
                        <span class="typing-dots"><span></span><span></span><span></span></span>
                        <span class="typing-text">sedang mengetik...</span>
                    </div>
                </div>
            </div>
            <div class="chat-messages" id="chatMessages">
                @if($hasMore)
                <div class="load-more-messages" id="loadMoreContainer">
                    <button class="load-more-btn" id="loadMoreBtn" data-offset="20">Muat Pesan Sebelumnya</button>
                </div>
                @endif
                @forelse($messages as $msg)
                <div class="chat-message {{ $msg->sender_id == Auth::id() ? 'sent' : 'received' }}" data-msg-id="{{ $msg->id }}">
                    @if($msg->image)
                    <div class="message-image">
                        <img src="{{ asset($msg->image) }}" onclick="openImageModal(this.src)">
                    </div>
                    @endif
                    @if($msg->message)
                    <div class="message-text">{{ $msg->message }}</div>
                    @endif
                    <div class="message-time">{{ \Carbon\Carbon::parse($msg->created_at)->format('H:i') }}</div>
                </div>
                @empty
                <div class="chat-empty" id="chatEmpty">
                    <p>Belum ada pesan. Kirim pesan pertama!</p>
                </div>
                @endforelse
            </div>
            <div class="chat-input-area">
                <form id="chatForm" class="chat-form">
                    @csrf
                    <input type="hidden" name="receiver_id" value="{{ $user->id }}">
                    <input type="text" name="message" class="chat-input" id="chatInput" placeholder="Tulis pesan..." autocomplete="off">
                    <label class="chat-photo-btn" id="photoBtn">
                        <i class="fas fa-image"></i>
                        <input type="file" name="image" accept="image/*" style="display:none;">
                    </label>
                    <button type="submit" class="chat-send-btn"><i class="fas fa-paper-plane"></i></button>
                </form>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const receiverId = {{ $user->id }};
const userId = {{ Auth::id() }};
const loadMoreBtn = document.getElementById('loadMoreBtn');

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendMessages(messages, prepend = false) {
    const html = messages.map(m => `
        <div class="chat-message ${m.sender_id == userId ? 'sent' : 'received'}" data-msg-id="${m.id}">
            ${m.image ? `<div class="message-image"><img src="/${m.image}" onclick="openImageModal(this.src)"></div>` : ''}
            ${m.message ? `<div class="message-text">${escapeHtml(m.message)}</div>` : ''}
            <div class="message-time">${m.time_formatted}</div>
        </div>
    `).join('');

    if (prepend) {
        chatMessages.insertAdjacentHTML('afterbegin', html);
    } else {
        const empty = document.getElementById('chatEmpty');
        if (empty) empty.remove();
        chatMessages.insertAdjacentHTML('beforeend', html);
    }
}

let currentOffset = {{ $hasMore ? 20 : 0 }};
let isLoadingMore = false;

// Load more messages
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async function() {
        if (isLoadingMore) return;
        isLoadingMore = true;
        this.disabled = true;
        this.textContent = 'Memuat...';

        try {
            const response = await fetch(`/messages/fetch/${receiverId}?offset=${currentOffset}`);
            const data = await response.json();

            if (data.messages && data.messages.length > 0) {
                const prevHeight = chatMessages.scrollHeight;
                appendMessages(data.messages, true);
                const newHeight = chatMessages.scrollHeight;
                chatMessages.scrollTop = newHeight - prevHeight;
                currentOffset = data.next_offset;
            }

            if (data.has_more) {
                this.disabled = false;
                this.textContent = 'Muat Pesan Sebelumnya';
            } else {
                this.style.display = 'none';
            }
        } catch(e) {
            this.disabled = false;
            this.textContent = 'Coba Lagi';
        }

        isLoadingMore = false;
    });
}

// Fetch new messages only (polling)
async function fetchNewMessages() {
    try {
        const response = await fetch(`/messages/fetch/${receiverId}?offset=0`);
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
            // Only update if we have new messages (compare count)
            const existing = chatMessages.querySelectorAll('.chat-message');
            const existingIds = Array.from(existing).map(el => el.dataset.msgId);
            const newMessages = data.messages.filter(m => !existingIds.includes(String(m.id)));

            if (newMessages.length > 0) {
                appendMessages(newMessages);
                scrollToBottom();
            }
        }
    } catch(e) {}
}

// Image auto-send
document.querySelector('#photoBtn input[type="file"]').addEventListener('change', function() {
    if (this.files.length > 0) {
        chatForm.dispatchEvent(new Event('submit'));
    }
});

// Send message
chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const msg = chatInput.value.trim();
    if (!msg && !formData.get('image').size) return;

    try {
        const response = await fetch('{{ route("messages.store") }}', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': getCsrfToken(), 'Accept': 'application/json' },
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            chatInput.value = '';
            this.querySelector('input[type="file"]').value = '';
            appendMessages([data.message]);
            scrollToBottom();
        }
    } catch(e) {
        console.error('Send message error:', e);
    }
});

// Mark as read
async function markAsRead() {
    try {
        await fetch('{{ route("messages.markRead", $user) }}', {
            method: 'POST',
            headers: ajaxHeaders()
        });
    } catch(e) {}
}

// Poll for new messages every 3 seconds
setInterval(fetchNewMessages, 3000);

// Poll unread count every 30 seconds (cached)
setInterval(async () => {
    try {
        const response = await fetch('{{ route("messages.unread") }}');
        const data = await response.json();
        const badge = document.getElementById('messagesBadge');
        if (data.count > 0) {
            badge.textContent = data.count;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    } catch(e) {}
}, 30000);

// === ONLINE STATUS (realtime via presence channel + polling fallback) ===
function updateStatusUI(online, lastSeen) {
    const el = document.getElementById('userStatus');
    if (!el) return;
    el.classList.add('status-updating');
    requestAnimationFrame(() => {
        if (online) {
            el.innerHTML = '<span class="status-online"><i class="fas fa-circle"></i> Online</span>';
        } else if (lastSeen) {
            el.innerHTML = `<span class="status-offline">Terakhir dilihat ${lastSeen}</span>`;
        } else {
            el.innerHTML = '<span class="status-offline">Offline</span>';
        }
        requestAnimationFrame(() => el.classList.remove('status-updating'));
    });
}

// Presence channel (realtime via Reverb)
try {
    if (window.Echo) {
        const presenceChannel = window.Echo.join('presence-online');
        presenceChannel.here(members => {
            const online = members.some(m => m.id == {{ $user->id }});
            updateStatusUI(online);
        });
        presenceChannel.joining(member => {
            if (member.id == {{ $user->id }}) updateStatusUI(true);
        });
        presenceChannel.leaving(member => {
            if (member.id == {{ $user->id }}) updateStatusUI(false);
        });
    }
} catch(e) {}

// Polling fallback
async function checkOnlineStatus() {
    try {
        const response = await fetch('{{ route("messages.status", $user) }}');
        const data = await response.json();
        updateStatusUI(data.online, data.last_seen);
    } catch(e) {
        console.warn('Status poll error:', e);
    }
}
setInterval(checkOnlineStatus, 3000);
checkOnlineStatus();

// === TYPING INDICATOR ===
let typingTimer;
const typingIndicator = document.getElementById('typingIndicator');

// Signal that I am typing
function sendTypingSignal() {
    navigator.sendBeacon('{{ route("messages.typing", $user) }}');
}

// Check if the other user is typing
async function checkTyping() {
    try {
        const response = await fetch('{{ route("messages.typing.check", $user) }}');
        const data = await response.json();
        typingIndicator.style.display = data.typing ? 'flex' : 'none';
    } catch(e) {}
}
setInterval(checkTyping, 3000);

// Detect typing on input
chatInput.addEventListener('input', function() {
    clearTimeout(typingTimer);
    sendTypingSignal();
    typingTimer = setTimeout(() => {}, 2000);
});

fetchNewMessages();
markAsRead();
scrollToBottom();
</script>
@endpush
@endsection
