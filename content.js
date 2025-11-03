// ============================================
// ANTI-ADBLOCK DETECTION KILLER
// ============================================

(function() {
    'use strict';

    // Inject anti-adblock killer script before page loads
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('anti-adblock-killer.js');
    script.onload = function() { this.remove(); };
    (document.head || document.documentElement).appendChild(script);

    // ============================================
    // POPUP BLOCKER
    // ============================================
    
    let popupCount = 0;
    
    // Block window.open popups
    const originalOpen = window.open;
    window.open = function(...args) {
        popupCount++;
        console.log('🚫 Blocked popup:', args[0]);
        
        // Notify background script
        chrome.runtime.sendMessage({
            action: 'popupBlocked',
            url: args[0]
        });
        
        return null;
    };

    // Block onclick popups
    document.addEventListener('click', function(e) {
        let element = e.target;
        
        // Check if element or parent has suspicious attributes
        for (let i = 0; i < 5; i++) {
            if (!element) break;
            
            const onclick = element.getAttribute('onclick');
            const href = element.getAttribute('href');
            
            // Detect suspicious patterns
            if (onclick && (onclick.includes('window.open') || onclick.includes('popup'))) {
                e.preventDefault();
                e.stopPropagation();
                popupCount++;
                console.log('🚫 Blocked onclick popup');
                return false;
            }
            
            if (href && (href.includes('javascript:') || href === '#')) {
                // Check if it's an ad link
                const computedStyle = window.getComputedStyle(element);
                if (computedStyle.position === 'absolute' || computedStyle.zIndex > 1000) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🚫 Blocked suspicious link');
                    return false;
                }
            }
            
            element = element.parentElement;
        }
    }, true);

    // ============================================
    // REMOVE AD ELEMENTS
    // ============================================
    
    function removeAdElements() {
        const adSelectors = [
            // Generic ad containers
            '[id*="ad-"]',
            '[id*="ads-"]',
            '[class*="ad-"]',
            '[class*="ads-"]',
            '[id*="banner"]',
            '[class*="banner"]',
            '[id*="sponsor"]',
            '[class*="sponsor"]',
            '[id*="popup"]',
            '[class*="popup"]',
            
            // Common ad networks
            'iframe[src*="doubleclick"]',
            'iframe[src*="googlesyndication"]',
            'iframe[src*="googleadservices"]',
            'iframe[src*="google_ads"]',
            'ins.adsbygoogle',
            
            // Anti-adblock overlays
            '[id*="adblock"]',
            '[class*="adblock"]',
            '[id*="ad-blocker"]',
            '[class*="ad-blocker"]',
            
            // Overlay/Modal popups
            'div[style*="z-index: 99"]',
            'div[style*="z-index: 999"]',
            'div[style*="z-index: 9999"]'
        ];

        adSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                // Check if it's really an ad
                const text = el.textContent.toLowerCase();
                const isAd = text.includes('advertisement') || 
                            text.includes('sponsored') || 
                            el.offsetHeight > 100 && el.offsetWidth > 100;
                
                if (isAd || selector.includes('iframe')) {
                    el.remove();
                    console.log('🗑️ Removed ad element:', selector);
                }
            });
        });
    }

    // ============================================
    // REMOVE ANTI-ADBLOCK OVERLAYS
    // ============================================
    
    function removeOverlays() {
        // Remove fixed/sticky overlays
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            
            if ((style.position === 'fixed' || style.position === 'sticky') && 
                parseInt(style.zIndex) > 1000) {
                
                const text = el.textContent.toLowerCase();
                
                if (text.includes('adblock') || 
                    text.includes('disable') || 
                    text.includes('turn off') ||
                    text.includes('please support')) {
                    
                    el.remove();
                    console.log('🗑️ Removed anti-adblock overlay');
                }
            }
        });

        // Re-enable scrolling
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    }

    // ============================================
    // HIDDEN LINK DETECTOR
    // ============================================
    
    function detectHiddenLinks() {
        document.querySelectorAll('a').forEach(link => {
            const style = window.getComputedStyle(link);
            const rect = link.getBoundingClientRect();
            
            // Detect invisible overlays
            if (style.position === 'absolute' && 
                (parseInt(style.zIndex) > 100 || 
                 style.opacity === '0' ||
                 rect.width > window.innerWidth * 0.8)) {
                
                link.style.pointerEvents = 'none';
                console.log('🚫 Disabled hidden ad link');
            }
        });
    }

    // ============================================
    // RUN CLEANERS
    // ============================================
    
    // Initial cleanup
    setTimeout(removeAdElements, 100);
    setTimeout(removeOverlays, 500);
    setTimeout(detectHiddenLinks, 1000);

    // Continuous monitoring
    const observer = new MutationObserver(() => {
        removeAdElements();
        removeOverlays();
        detectHiddenLinks();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Periodic cleanup
    setInterval(() => {
        removeAdElements();
        removeOverlays();
        detectHiddenLinks();
    }, 2000);

    console.log('✅ DevSage Adblocker content script loaded!');
})();