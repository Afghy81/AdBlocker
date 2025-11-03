// Combined background.js

// Initialize storage
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        enabled: true,
        totalBlocked: 0,
        todayBlocked: 0,
        popupsBlocked: 0,
        lastResetDate: new Date().toDateString(),
        blockedDomains: {}
    });
    // Set initial badge
    chrome.action.setBadgeText({ text: '0' });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    console.log("DevSage Adblocker initialized!");
});

// Monitor blocked requests
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(async (details) => {
    const data = await chrome.storage.local.get(['enabled', 'totalBlocked', 'todayBlocked', 'lastResetDate', 'blockedDomains']);

    if (!data.enabled) return;

    const today = new Date().toDateString();
    let todayCount = data.todayBlocked || 0;

    if (data.lastResetDate !== today) {
        todayCount = 0;
        await chrome.storage.local.set({ lastResetDate: today, todayBlocked: 0 });
    }

    const totalBlocked = (data.totalBlocked || 0) + 1;
    todayCount += 1;

    const url = new URL(details.request.url);
    const domain = url.hostname;
    const blockedDomains = data.blockedDomains || {};
    blockedDomains[domain] = (blockedDomains[domain] || 0) + 1;

    await chrome.storage.local.set({
        totalBlocked,
        todayBlocked: todayCount,
        blockedDomains
    });

    chrome.action.setBadgeText({ text: todayCount.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });

    console.log(`Blocked: ${details.request.url}`);
});

// Handle toggle, reset, and popup block messages
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'toggle') {
        const enabled = message.enabled;
        await chrome.storage.local.set({ enabled });

        if (enabled) {
            await chrome.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ['ruleset_1', 'aggressive_rules']
            });
            const data = await chrome.storage.local.get(['todayBlocked']);
            const count = data.todayBlocked || 0;
            chrome.action.setBadgeText({ text: count.toString() });
            chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
        } else {
            await chrome.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ['ruleset_1', 'aggressive_rules']
            });
            chrome.action.setBadgeText({ text: 'OFF' });
            chrome.action.setBadgeBackgroundColor({ color: '#f44336' });
        }
    } else if (message.action === 'reset') {
        await chrome.storage.local.set({
            totalBlocked: 0,
            todayBlocked: 0,
            popupsBlocked: 0,
            blockedDomains: {}
        });
        const data = await chrome.storage.local.get(['enabled']);
        if (data.enabled !== false) {
            chrome.action.setBadgeText({ text: '0' });
            chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
        }
    } else if (message.action === 'popupBlocked') {
        const data = await chrome.storage.local.get(['popupsBlocked']);
        const popupsBlocked = (data.popupsBlocked || 0) + 1;
        await chrome.storage.local.set({ popupsBlocked });
        console.log('Popup blocked:', message.url);
    }

    sendResponse({ success: true });
    return true;
});

// enhanced background.js
// Adds more aggressive detection for popup ads and hidden redirects (like those on lk21)

const blockedPatterns = [
  '*://*judi*/*', '*://*slot*/*', '*://*casino*/*', '*://*bet*/*',
  '*://*porn*/*', '*://*ads*/*', '*://*advert*/*', '*://*banner*/*', '*://*pop*/*',
  '*://*attirecideryeah.com*', '*://*usheebainaut.com*', '*://*alibaba.com*', '*://*dewazeus33*'
];

chrome.tabs.onCreated.addListener((tab) => {
  if (!tab.pendingUrl && !tab.url) return;
  const url = tab.pendingUrl || tab.url;

  for (const pattern of blockedPatterns) {
    const regex = new RegExp(
      pattern
        .replace('*://*', 'https?://(?:[^/]+\.)?')
        .replace('*', '.*'),
      'i'
    );
    if (regex.test(url)) {
      console.log('🚫 Closing popup tab:', url);
      chrome.tabs.remove(tab.id);
      chrome.runtime.sendMessage({ action: 'popupBlocked', url });
      return;
    }
  }
});

// Listen for suspicious redirects after tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const url = changeInfo.url;
    for (const pattern of blockedPatterns) {
      const regex = new RegExp(
        pattern
          .replace('*://*', 'https?://(?:[^/]+\.)?')
          .replace('*', '.*'),
        'i'
      );
      if (regex.test(url)) {
        console.log('🚫 Detected redirect to blocked domain:', url);
        chrome.tabs.remove(tabId);
        chrome.runtime.sendMessage({ action: 'popupBlocked', url });
        return;
      }
    }
  }
});

// Also block popups spawned via window.open
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'close-tab' && sender.tab?.id) {
    chrome.tabs.remove(sender.tab.id);
  }
});