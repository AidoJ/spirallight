/**
 * UI Utilities
 * Toast notifications, loading states, and other UI helpers
 */

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/**
 * Show loading spinner in an element
 */
function showLoading(element) {
    if (!element) return;
    element.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
}

/**
 * Hide loading spinner
 */
function hideLoading(element) {
    if (!element) return;
    const loading = element.querySelector('.loading');
    if (loading) loading.remove();
}

/**
 * Debounce function for search
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format datetime for display
 */
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get initials from name
 */
function getInitials(name) {
    if (!name) return '??';
    return name.split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
}

/**
 * View Management
 */
function showView(viewName) {
    // SECURITY: Don't allow view changes if we're in intake form mode
    // This prevents clients from accessing the therapist app
    if (window.isIntakeFormMode || window.intakeSubmitted) {
        console.log('View change blocked - intake form mode active');
        return;
    }
    
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    const viewMap = {
        'clients': 'clientsView',
        'newClient': 'newClientView',
        'clientDetail': 'clientDetailView',
        'newSession': 'newSessionView',
        'sessionDetail': 'sessionDetailView'
    };

    const tabMap = {
        'clients': 0,
        'newClient': 'newClientTab',
        'clientDetail': 'clientDetailTab',
        'newSession': 'newSessionTab',
        'sessionDetail': 'sessionDetailTab'
    };

    const viewElement = document.getElementById(viewMap[viewName]);
    if (viewElement) {
        viewElement.classList.add('active');
    }

    if (typeof tabMap[viewName] === 'number') {
        const tabs = document.querySelectorAll('.nav-tab');
        if (tabs[tabMap[viewName]]) {
            tabs[tabMap[viewName]].classList.add('active');
        }
    } else {
        const tab = document.getElementById(tabMap[viewName]);
        if (tab) {
            tab.style.display = 'block';
            tab.classList.add('active');
        }
    }

    if (viewName === 'clients') {
        loadClients();
        const newClientTab = document.getElementById('newClientTab');
        if (newClientTab) newClientTab.style.display = 'block';
        const clientDetailTab = document.getElementById('clientDetailTab');
        if (clientDetailTab) clientDetailTab.style.display = 'none';
        const newSessionTab = document.getElementById('newSessionTab');
        if (newSessionTab) newSessionTab.style.display = 'none';
        const sessionDetailTab = document.getElementById('sessionDetailTab');
        if (sessionDetailTab) sessionDetailTab.style.display = 'none';
    }
}

