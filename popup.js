// Load stats on popup open
document.addEventListener('DOMContentLoaded', async () => {
    await loadStats();
    setupEventListeners();
});

async function loadStats() {
    const data = await chrome.storage.local.get([
        'enabled',
        'totalBlocked',
        'todayBlocked',
        'popupsBlocked',
        'blockedDomains'
    ]);

    // Update toggle
    const toggle = document.getElementById('toggleSwitch');
    toggle.checked = data.enabled !== false;
    updateStatus(data.enabled !== false);

    // Update counters
    document.getElementById('todayBlocked').textContent = 
        formatNumber(data.todayBlocked || 0);
    document.getElementById('totalBlocked').textContent = 
        formatNumber(data.totalBlocked || 0);
    
    // Update popup counter if element exists
    const popupElement = document.getElementById('popupsBlocked');
    if (popupElement) {
        popupElement.textContent = formatNumber(data.popupsBlocked || 0);
    }

    // Update domains list
    const domains = data.blockedDomains || {};
    const domainsCount = Object.keys(domains).length;
    document.getElementById('domainsCount').textContent = domainsCount;

    updateDomainsList(domains);
}

function updateStatus(enabled) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const statusDesc = document.getElementById('statusDesc');

    if (enabled) {
        statusDot.classList.remove('off');
        statusText.textContent = 'Protection Active';
        statusDesc.textContent = 'Blocking ads across the web';
    } else {
        statusDot.classList.add('off');
        statusText.textContent = 'Protection Disabled';
        statusDesc.textContent = 'Ads are not being blocked';
    }
}

function updateDomainsList(domains) {
    const domainsList = document.getElementById('domainsList');
    
    if (Object.keys(domains).length === 0) {
        domainsList.innerHTML = '<div class="no-data">No domains blocked yet</div>';
        return;
    }

    // Sort domains by count
    const sortedDomains = Object.entries(domains)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Top 5

    domainsList.innerHTML = sortedDomains.map(([domain, count]) => `
        <div class="domain-item">
            <span class="domain-name" title="${domain}">${domain}</span>
            <span class="domain-count">${formatNumber(count)}</span>
        </div>
    `).join('');
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function setupEventListeners() {
    // Toggle switch
    document.getElementById('toggleSwitch').addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        
        await chrome.runtime.sendMessage({
            action: 'toggle',
            enabled: enabled
        });

        updateStatus(enabled);
        
        // Show feedback
        showNotification(enabled ? 'Protection enabled' : 'Protection disabled');
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset all statistics?')) {
            await chrome.runtime.sendMessage({ action: 'reset' });
            await loadStats();
            showNotification('Statistics reset successfully');
        }
    });

    // Whitelist button (placeholder)
    document.getElementById('whitelistBtn').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentUrl = new URL(tabs[0].url);
            const domain = currentUrl.hostname;
            
            const add = confirm(`Add ${domain} to whitelist?\n\n(Feature coming soon)`);
            if (add) {
                showNotification('Whitelist feature coming soon!');
            }
        });
    });
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 13px;
        z-index: 1000;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 2 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Auto-refresh stats every 2 seconds
setInterval(loadStats, 2000);