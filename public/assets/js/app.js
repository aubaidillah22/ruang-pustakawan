/* ========================================
   RUANGPUSTAKAWAN — LARAVEL ADAPTED JS
   ======================================== */

// ============================================
// Toast Notification System
// ============================================
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span><button class="toast-close" onclick="this.parentElement.remove()">&times;</button>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    const hideTimeout = setTimeout(() => {
        toast.classList.add('toast-hiding');
        setTimeout(() => toast.remove(), 400);
    }, duration);

    toast.addEventListener('click', () => {
        clearTimeout(hideTimeout);
        toast.classList.add('toast-hiding');
        setTimeout(() => toast.remove(), 400);
    });
}

// ============================================
// Image Compression (client-side)
// ============================================
function compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const indicator = document.getElementById('compressionIndicator');
        if (indicator) indicator.classList.add('active');

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round(height * maxWidth / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(function(blob) {
                    if (indicator) indicator.classList.remove('active');
                    if (blob.size < file.size) {
                        const compressedFile = new File([blob], file.name, { type: file.type, lastModified: Date.now() });
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                }, file.type, quality);
            };
            img.onerror = function() {
                if (indicator) indicator.classList.remove('active');
                resolve(file);
            };
            img.src = e.target.result;
        };
        reader.onerror = function() {
            if (indicator) indicator.classList.remove('active');
            resolve(file);
        };
        reader.readAsDataURL(file);
    });
}

// ============================================
// CSRF Token helper for AJAX requests
// ============================================
function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

function ajaxHeaders() {
    return {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRF-TOKEN': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest'
    };
}

// ============================================
// Q6: escapeHtml — escapes all dangerous chars
// ============================================
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================
// Stories Horizontal Scroll
// ============================================
function scrollStories(direction) {
    const container = document.getElementById('storiesScroll');
    if (!container) return;
    const item = container.querySelector('.story-item');
    const scrollAmount = item ? item.offsetWidth + 14 : container.clientWidth * 0.6;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// ============================================
// Image Preview (create post form) w/ Compression
// ============================================
async function previewImage(input) {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImg = document.getElementById('imagePreview');

    if (input.files && input.files[0]) {
        const compressed = await compressImage(input.files[0]);
        // Replace file input with compressed version
        const dt = new DataTransfer();
        dt.items.add(compressed);
        input.files = dt.files;

        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(compressed);
    }
}

// ============================================
// Image Modal Viewer
// ============================================
function openImageModal(src) {
    const el = document.getElementById('imageModal');
    document.getElementById('modalImage').src = src;
    el.addEventListener('shown.bs.modal', function onShown() {
        el.removeEventListener('shown.bs.modal', onShown);
        document.body.style.overflow = 'hidden';
    });
    el.addEventListener('hidden.bs.modal', function onHidden() {
        el.removeEventListener('hidden.bs.modal', onHidden);
        document.body.style.overflow = '';
    });
    const modal = bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
    modal.show();
}

// ============================================
// Avatar Preview (profile edit)
// ============================================
function previewAvatar(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        compressImage(file, 400, 0.7).then(compressed => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('avatarPreview');
                if (preview) preview.src = e.target.result;
            };
            reader.readAsDataURL(compressed);
            // Replace input file with compressed version
            const dt = new DataTransfer();
            dt.items.add(compressed);
            input.files = dt.files;
        });
    }
}

// ============================================
// Like Handler
// ============================================
function initLikeHandler() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const postId = this.dataset.postId;
            try {
                const response = await fetch('/like', {
                    method: 'POST',
                    headers: ajaxHeaders(),
                    body: 'post_id=' + postId
                });
                const data = await response.json();
                if (data.success) {
                    const icon = this.querySelector('i');
                    const countSpan = this.querySelector('.like-count');
                    icon.className = data.liked ? 'fas fa-heart' : 'far fa-heart';
                    if (data.liked) this.classList.add('liked');
                    else this.classList.remove('liked');
                    countSpan.textContent = data.like_count.toLocaleString();

                    if (data.liked) {
                        icon.style.animation = 'heartbeat 0.3s ease';
                        setTimeout(() => { icon.style.animation = ''; }, 300);
                    }
                }
            } catch (err) {
                showToast('Gagal menyukai postingan', 'error');
                console.error('Like error:', err);
            }
        });
    });
}

// ============================================
// Comment Toggle & Load
// ============================================
async function loadComments(postId) {
    const response = await fetch(`/comment?post_id=${postId}`);
    const comments = await response.json();
    const commentsList = document.getElementById(`comments-list-${postId}`);
    if (!commentsList) return;

    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="text-muted text-center py-3">Belum ada komentar</div>';
    } else {
        commentsList.innerHTML = comments.map(c => `
            <div class="comment-item">
                <img src="/assets/avatars/${escapeHtml(c.avatar || 'default.svg')}" class="comment-avatar-sm"
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullname)}&background=075e54&color=fff'">
                <div class="comment-content">
                    <span class="comment-author">${escapeHtml(c.fullname)}</span>
                    <div class="comment-text">${escapeHtml(c.comment)}</div>
                    <small class="text-muted">${escapeHtml(c.time_ago)}</small>
                </div>
            </div>
        `).join('');
    }
}

function initCommentToggle() {
    document.querySelectorAll('.comment-toggle').forEach(btn => {
        btn.addEventListener('click', async function() {
            const postId = this.dataset.postId;
            const commentsDiv = document.getElementById(`comments-${postId}`);
            if (!commentsDiv) return;

            if (commentsDiv.style.display === 'none') {
                commentsDiv.style.display = 'block';
                await loadComments(postId);
            } else {
                commentsDiv.style.display = 'none';
            }
        });
    });
}

// ============================================
// Comment Submit
// ============================================
function initCommentSubmit() {
    document.querySelectorAll('.comment-submit').forEach(btn => {
        btn.addEventListener('click', async function() {
            const postId = this.dataset.postId;
            const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
            const comment = input ? input.value.trim() : '';
            if (!comment) return;

            try {
                const response = await fetch('/comment', {
                    method: 'POST',
                    headers: ajaxHeaders(),
                    body: `post_id=${postId}&comment=${encodeURIComponent(comment)}`
                });
                const data = await response.json();
                if (data.success) {
                    input.value = '';
                    await loadComments(postId);
                    showToast('Komentar berhasil ditambahkan', 'success');
                } else {
                    showToast('Gagal menambahkan komentar', 'error');
                }
            } catch (err) {
                showToast('Gagal menambahkan komentar', 'error');
                console.error('Comment error:', err);
            }
        });
    });
}

// ============================================
// Enter key to submit comment
// ============================================
function initCommentEnterKey() {
    document.querySelectorAll('.comment-input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const postId = this.dataset.postId;
                const submitBtn = document.querySelector(`.comment-submit[data-post-id="${postId}"]`);
                if (submitBtn) submitBtn.click();
            }
        });
    });
}

// ============================================
// Post Menu Dropdown
// ============================================
function initPostMenu() {
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.post-menu-container')) {
            document.querySelectorAll('.post-menu-dropdown').forEach(d => d.classList.remove('show'));
        }
    });

    document.querySelectorAll('.post-menu-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const postId = this.dataset.postId;
            const dropdown = document.getElementById(`post-menu-${postId}`);
            document.querySelectorAll('.post-menu-dropdown').forEach(d => {
                if (d.id !== `post-menu-${postId}`) d.classList.remove('show');
            });
            dropdown.classList.toggle('show');
        });
    });
}

// ============================================
// Delete Post
// ============================================
function initDeletePost() {
    document.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();
            const postId = this.dataset.postId;

            const result = await Swal.fire({
                title: 'Hapus Postingan?',
                text: 'Postingan yang dihapus tidak dapat dikembalikan!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: '<i class="fas fa-trash-alt"></i> Ya, Hapus!',
                cancelButtonText: '<i class="fas fa-times"></i> Batal',
                background: 'var(--glass-bg)',
                backdrop: 'rgba(0,0,0,0.4)'
            });

            if (result.isConfirmed) {
                try {
                    const response = await fetch('/delete_post', {
                        method: 'POST',
                        headers: ajaxHeaders(),
                        body: `post_id=${postId}`
                    });
                    const data = await response.json();
                    if (data.success) {
                        const postEl = document.getElementById(`post-${postId}`);
                        if (postEl) {
                            postEl.style.transition = 'all 0.3s ease';
                            postEl.style.opacity = '0';
                            postEl.style.transform = 'scale(0.9)';
                            setTimeout(() => postEl.remove(), 300);
                        }
                        showToast('Postingan berhasil dihapus', 'success');
                    } else {
                        showToast(data.message || 'Terjadi kesalahan', 'error');
                    }
                } catch (err) {
                    showToast('Gagal menghapus postingan', 'error');
                }
            }

            const dropdown = document.getElementById(`post-menu-${postId}`);
            if (dropdown) dropdown.classList.remove('show');
        });
    });
}

// ============================================
// Edit Post (via SweetAlert modal)
// ============================================
function initEditPost() {
    document.querySelectorAll('.edit-post-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const postId = this.dataset.postId;
            const currentContent = this.dataset.postContent;

            Swal.fire({
                title: '<i class="fas fa-pen"></i> Edit Postingan',
                html: `<textarea id="editContent" class="edit-post-textarea" rows="5" placeholder="Tulis postingan Anda...">${escapeHtml(currentContent)}</textarea>`,
                showCancelButton: true,
                confirmButtonColor: 'var(--primary-color)',
                cancelButtonColor: '#6c757d',
                confirmButtonText: '<i class="fas fa-save"></i> Simpan',
                cancelButtonText: '<i class="fas fa-times"></i> Batal',
                background: 'var(--glass-bg)',
                backdrop: 'rgba(0,0,0,0.4)',
                customClass: { popup: 'edit-post-modal', confirmButton: 'btn-primary' },
                preConfirm: () => {
                    const newContent = document.getElementById('editContent').value;
                    if (!newContent.trim()) {
                        Swal.showValidationMessage('Postingan tidak boleh kosong!');
                    }
                    return newContent;
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await fetch('/edt_post', {
                            method: 'POST',
                            headers: ajaxHeaders(),
                            body: `post_id=${postId}&content=${encodeURIComponent(result.value)}`
                        });
                        const data = await response.json();
                        if (data.success) {
                            showToast('Postingan berhasil diperbarui', 'success');
                            setTimeout(() => location.reload(), 800);
                        } else {
                            showToast(data.message || 'Terjadi kesalahan', 'error');
                        }
                    } catch (err) {
                        showToast('Gagal memperbarui postingan', 'error');
                    }
                }
            });

            const dropdown = document.getElementById(`post-menu-${postId}`);
            if (dropdown) dropdown.classList.remove('show');
        });
    });
}

// ============================================
// Search Handler
// ============================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput || !searchResults) return;

    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (data.users && data.users.length > 0) {
                    searchResults.innerHTML = data.users.map(u => `
                        <a href="/profile?id=${u.id}" class="search-result-item">
                            <img src="/assets/avatars/${escapeHtml(u.avatar || 'default.svg')}"
                                 onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullname)}&background=075e54&color=fff'">
                            <span class="notif-text">${escapeHtml(u.fullname)}</span>
                            <span class="notif-time">@${escapeHtml(u.username)}</span>
                        </a>
                    `).join('');
                    searchResults.style.display = 'block';
                } else {
                    searchResults.innerHTML = '<div class="notification-empty">Tidak ditemukan</div>';
                    searchResults.style.display = 'block';
                }
            } catch (err) {
                console.error('Search error:', err);
            }
        }, 300);
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-search') && !e.target.closest('#searchResults')) {
            searchResults.style.display = 'none';
        }
    });
}

// ============================================
// Notification Handler
// ============================================
function initNotifications() {
    const bellBtn = document.getElementById('notificationBell');
    const dropdown = document.getElementById('notificationDropdown');
    if (!bellBtn || !dropdown) return;

    bellBtn.addEventListener('click', async function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');

        if (dropdown.classList.contains('show')) {
            try {
                const response = await fetch('/notifications?action=get');
                const data = await response.json();
                const list = document.getElementById('notificationList');
                if (data.notifications && data.notifications.length > 0) {
                    list.innerHTML = data.notifications.map(n => {
                        let link = n.type === 'message' ? `/messages/${n.from_user_id}` : '#';
                        return `
                        <a href="${link}" class="notification-item ${n.is_read == 0 ? 'unread' : ''}">
                            <img src="/assets/avatars/${escapeHtml(n.avatar || 'default.svg')}"
                                 onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(n.fullname)}&background=075e54&color=fff'">
                            <div class="notif-text">
                                <strong>${escapeHtml(n.fullname)}</strong> ${escapeHtml(n.message)}
                                <div class="notif-time">${escapeHtml(n.time_ago)}</div>
                            </div>
                        </a>`;
                    }).join('');
                } else {
                    list.innerHTML = '<div class="notification-empty">Tidak ada notifikasi baru</div>';
                }

                // Mark as read
                await fetch('/notifications?action=mark_read', { method: 'POST', headers: ajaxHeaders() });
                const badge = document.querySelector('.notification-badge');
                if (badge) badge.style.display = 'none';
            } catch (err) {
                console.error('Notification error:', err);
            }
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.notification-bell')) {
            dropdown.classList.remove('show');
        }
    });

    // Poll unread notification count every 15 seconds
    setInterval(async () => {
        try {
            const res = await fetch('/notifications?action=count');
            const data = await res.json();
            const badge = document.querySelector('.notification-badge');
            if (data.count > 0) {
                if (badge) {
                    badge.textContent = data.count;
                    badge.style.display = 'flex';
                } else {
                    const bell = document.getElementById('notificationBell');
                    if (bell) {
                        const newBadge = document.createElement('span');
                        newBadge.className = 'notification-badge';
                        newBadge.textContent = data.count;
                        bell.appendChild(newBadge);
                    }
                }
            } else if (badge) {
                badge.style.display = 'none';
            }
        } catch (err) {}
    }, 15000);
}

// ============================================
// Skeleton Loading
// ============================================
function showSkeleton(count = 3) {
    const container = document.getElementById('skeletonContainer');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'glass-post-skeleton skeleton-pulse';
        skeleton.innerHTML = `
            <div class="skeleton-header">
                <div class="skeleton-avatar skeleton-shimmer"></div>
                <div>
                    <div class="skeleton-line skeleton-line-sm skeleton-shimmer"></div>
                    <div class="skeleton-line skeleton-line-xs skeleton-shimmer"></div>
                </div>
            </div>
            <div class="skeleton-body">
                <div class="skeleton-text skeleton-shimmer"></div>
                <div class="skeleton-text skeleton-shimmer"></div>
                <div class="skeleton-text skeleton-shimmer"></div>
            </div>
            <div class="skeleton-image skeleton-shimmer"></div>
            <div class="skeleton-actions">
                <div class="skeleton-action skeleton-shimmer"></div>
                <div class="skeleton-action skeleton-shimmer"></div>
            </div>
        `;
        container.appendChild(skeleton);
    }
    container.classList.add('active');
}

function hideSkeleton() {
    const container = document.getElementById('skeletonContainer');
    if (!container) return;
    container.classList.remove('active');
    container.innerHTML = '';
}

// ============================================
// Load & Append Posts (shared by load more + infinite scroll)
// ============================================
async function loadAndAppendPosts(page, feed, loadMoreBtn) {
    try {
        const response = await fetch(`/?page=${page}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const data = await response.json();

        if (data.posts && data.posts.length > 0) {
            data.posts.forEach(post => {
                const div = document.createElement('div');
                div.className = 'glass-post';
                div.id = `post-${post.id}`;
                div.innerHTML = post.html;
                feed.appendChild(div);
            });

            initLikeHandler();
            initCommentToggle();
            initCommentSubmit();
            initCommentEnterKey();
            initPostMenu();
            initDeletePost();
            initEditPost();

            if (loadMoreBtn) {
                loadMoreBtn.dataset.page = page;
                loadMoreBtn.disabled = false;
                loadMoreBtn.textContent = 'Muat Lebih Banyak';
                if (!data.has_more) {
                    loadMoreBtn.style.display = 'none';
                }
            }
            hideSkeleton();
            return data.has_more;
        } else {
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            hideSkeleton();
            return false;
        }
    } catch (err) {
        if (loadMoreBtn) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Coba Lagi';
        }
        hideSkeleton();
        console.error('Load more error:', err);
        return false;
    }
}

// ============================================
// Load More Button & Infinite Scroll
// ============================================
function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const feed = document.getElementById('postsFeed');
    if (!feed) return;

    // Load More button handler
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async function() {
            const page = parseInt(this.dataset.page) || 1;
            const nextPage = page + 1;
            this.disabled = true;
            this.textContent = 'Memuat...';
            showSkeleton();

            await loadAndAppendPosts(nextPage, feed, this);
        });
    }

    // Infinite scroll via Intersection Observer
    const sentinel = document.getElementById('infiniteScrollSentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(async (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (loadMoreBtn && loadMoreBtn.style.display === 'none') return;
        if (loadMoreBtn && loadMoreBtn.disabled) return;

        const page = loadMoreBtn ? parseInt(loadMoreBtn.dataset.page) || 1 : 1;
        const nextPage = page + 1;

        if (loadMoreBtn) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Memuat...';
        }

        await loadAndAppendPosts(nextPage, feed, loadMoreBtn);
    }, { rootMargin: '200px' });

    observer.observe(sentinel);
}

// ============================================
// Dark Mode Toggle (Alpine-compatible)
// ============================================
function initDarkMode() {
    // Also support non-Alpine pages (login, register)
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;

    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');

    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            if (icon) icon.className = 'fas fa-sun';
            if (text) text.textContent = 'Mode Terang';
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            if (icon) icon.className = 'fas fa-moon';
            if (text) text.textContent = 'Mode Gelap';
        }
    }

    // Initialize from localStorage
    const stored = localStorage.getItem('darkMode');
    applyTheme(stored === 'enabled');

    toggle.addEventListener('click', function() {
        const isDark = document.body.classList.contains('dark-mode');
        applyTheme(!isDark);
        localStorage.setItem('darkMode', !isDark ? 'enabled' : 'disabled');
    });
}

// ============================================
// Video Preview (create post form)
// ============================================
async function previewVideo(input) {
    const previewContainer = document.getElementById('videoPreviewContainer');
    const previewVideo = document.getElementById('videoPreview');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewVideo.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function clearVideo() {
    const fileInput = document.getElementById('postVideo');
    if (fileInput) fileInput.value = '';
    document.getElementById('videoPreviewContainer').style.display = 'none';
    document.getElementById('videoPreview').src = '';
}

function clearImage() {
    const fileInput = document.getElementById('postImage');
    if (fileInput) fileInput.value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imagePreview').src = '';
}

// ============================================
// Echo / Real-time Notifications
// ============================================
function initEcho() {
    if (!window.Echo || typeof window.Echo !== 'object') return;
    const userId = document.body.dataset.userId;
    if (!userId) return;

    // Real-time notifications
    window.Echo.private(`notifications.${userId}`)
        .listen('NewNotification', (e) => {
            // Update badge
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                const count = parseInt(badge.textContent) || 0;
                badge.textContent = count + 1;
                badge.style.display = 'flex';
            } else {
                const bell = document.getElementById('notificationBell');
                if (bell) {
                    const newBadge = document.createElement('span');
                    newBadge.className = 'notification-badge';
                    newBadge.textContent = '1';
                    bell.appendChild(newBadge);
                }
            }

            // Show toast
            showToast(`${e.fullname} ${e.message}`, 'info', 3000);
        });

    // Real-time messages
    window.Echo.private(`messages.${userId}`)
        .listen('NewMessage', (e) => {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                // Already on chat page - append message
                const isSent = e.sender_id == userId;
                const msgHtml = `
                    <div class="chat-message ${isSent ? 'sent' : 'received'}">
                        ${e.image ? `<div class="message-image"><img src="/${e.image}" onclick="openImageModal(this.src)"></div>` : ''}
                        ${e.message ? `<div class="message-text">${escapeHtml(e.message)}</div>` : ''}
                        <div class="message-time">${e.time_formatted}</div>
                    </div>
                `;
                chatMessages.insertAdjacentHTML('beforeend', msgHtml);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } else {
                // Not on chat page - show toast
                showToast(`Pesan baru dari ${e.sender_name}`, 'info', 4000);
            }
        });
}

// ============================================
// Initialize everything on DOMContentLoaded
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    initLikeHandler();
    initCommentToggle();
    initCommentSubmit();
    initCommentEnterKey();
    initPostMenu();
    initDeletePost();
    initEditPost();
    initSearch();
    initNotifications();
    initLoadMore();
    initEcho();
});
