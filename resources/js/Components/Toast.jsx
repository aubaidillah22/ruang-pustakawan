// Simple toast utility

const toast = {
    success: (message) => show(message, 'success'),
    error: (message) => show(message, 'error'),
    info: (message) => show(message, 'info'),
};

function show(message, type = 'info') {
    const colors = {
        success: 'linear-gradient(135deg, #059669, #34d399)',
        error: 'linear-gradient(135deg, #dc2626, #f87171)',
        info: 'linear-gradient(135deg, #2563eb, #60a5fa)',
    };

    const toast = document.createElement('div');
    toast.className = 'toast flex items-center gap-2';
    toast.style.background = colors[type];
    toast.style.color = 'white';
    toast.innerHTML = `<span class="text-sm font-medium">${message}</span>`;

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export default toast;
