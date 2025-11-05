// ============================================
// ANTI-ADBLOCK DETECTION KILLER V2.0
// Advanced Stealth & Protection System
// ============================================

(function() {
    'use strict';

    // Safe property descriptor getter with fallback
    function getSafeDescriptor(obj, prop) {
        try {
            return Object.getOwnPropertyDescriptor(obj, prop);
        } catch (e) {
            return null;
        }
    }

    // Safe property definition
    function safeDefineProperty(obj, prop, descriptor) {
        try {
            Object.defineProperty(obj, prop, descriptor);
            return true;
        } catch (e) {
            console.warn('Failed to define property:', prop, e);
            return false;
        }
    }

    // ============================================
    // 1. FAKE ADBLOCK DETECTION OBJECTS
    // ============================================
    
    // Fake Google AdSense with full API
    if (!window.adsbygoogle) {
        window.adsbygoogle = [];
        Object.defineProperty(window.adsbygoogle, 'loaded', {
            value: true,
            writable: false,
            configurable: false
        });
        window.adsbygoogle.push = function() { return true; };
        window.adsbygoogle.length = 0;
    }

    // Fake Google Ads objects
    const fakeAdObjects = {
        google_ad_client: "ca-pub-0000000000000000",
        google_ad_slot: "0000000000",
        google_ad_width: 728,
        google_ad_height: 90,
        google_ad_format: "auto",
        canRunAds: true,
        isAdBlockActive: false,
        adBlockEnabled: false,
        ads_blocked: false,
        __ads_loaded: true,
        __ab: false
    };

    Object.keys(fakeAdObjects).forEach(key => {
        if (!(key in window)) {
            window[key] = fakeAdObjects[key];
        }
    });

    // ============================================
    // 2. AGGRESSIVE OVERRIDE DETECTION FUNCTIONS
    // ============================================
    
    const noop = function() { return true; };
    const noopFalse = function() { return false; };
    const noopPromise = function() { return Promise.resolve(true); };
    const noopPromiseFalse = function() { return Promise.resolve(false); };
    
    // Override detection functions
    const detectionFunctions = {
        checkAdBlock: noop,
        adBlockDetected: noop,
        isAdBlockEnabled: noopFalse,
        detectAdBlock: noopPromiseFalse,
        checkAdBlocker: noopFalse,
        detectAnyAdblocker: noopPromiseFalse,
        isBlockingAds: noopFalse,
        AdBlockDetector: undefined,
        adBlocker: false
    };

    Object.keys(detectionFunctions).forEach(func => {
        if (!(func in window)) {
            try {
                window[func] = detectionFunctions[func];
            } catch (e) {}
        }
    });

    // ============================================
    // 3. INTERCEPT FETCH/XHR FOR AD DETECTION
    // ============================================
    
    // Store original functions
    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    // Patterns to detect ad test requests
    const adTestPatterns = [
        '/ads', '/ad.', '/ad/', '/advert', 
        'pagead', 'ad-detect', 'adblock-detect',
        'advertisement', 'doubleclick', 'googlesyndication'
    ];

    function isAdTestRequest(url) {
        if (typeof url !== 'string') return false;
        const lowerUrl = url.toLowerCase();
        return adTestPatterns.some(pattern => lowerUrl.includes(pattern));
    }

    // Override fetch
    if (originalFetch) {
        window.fetch = function(...args) {
            const url = args[0];
            
            if (isAdTestRequest(url)) {
                // Return fake successful response
                return Promise.resolve(new Response('console.log("ad loaded");', {
                    status: 200,
                    statusText: 'OK',
                    headers: {
                        'Content-Type': 'application/javascript',
                        'Content-Length': '100'
                    }
                }));
            }
            
            return originalFetch.apply(this, args);
        };
    }

    // Override XMLHttpRequest with better error handling
    if (originalXHROpen) {
        XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._interceptedUrl = url;
            return originalXHROpen.apply(this, [method, url, ...rest]);
        };
    }

    if (originalXHRSend) {
        XMLHttpRequest.prototype.send = function(...args) {
            if (this._interceptedUrl && isAdTestRequest(this._interceptedUrl)) {
                // Simulate successful ad load
                setTimeout(() => {
                    Object.defineProperty(this, 'status', { 
                        value: 200,
                        writable: false 
                    });
                    Object.defineProperty(this, 'readyState', { 
                        value: 4,
                        writable: false 
                    });
                    Object.defineProperty(this, 'responseText', { 
                        value: 'console.log("ad loaded");',
                        writable: false 
                    });
                    Object.defineProperty(this, 'response', { 
                        value: 'console.log("ad loaded");',
                        writable: false 
                    });
                    
                    if (typeof this.onload === 'function') {
                        this.onload();
                    }
                    if (typeof this.onreadystatechange === 'function') {
                        this.onreadystatechange();
                    }
                }, 10);
                return;
            }
            
            return originalXHRSend.apply(this, args);
        };
    }

    // ============================================
    // 4. ADVANCED FAKE AD ELEMENTS
    // ============================================
    
    function createStealthFakeAd() {
        const fakeAd = document.createElement('div');
        fakeAd.className = 'adsbygoogle';
        fakeAd.id = 'google_ads_iframe_test';
        
        // Make invisible but "present"
        fakeAd.style.cssText = 'position:absolute;width:1px;height:1px;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
        
        // Override size properties
        const sizeProps = {
            offsetHeight: 1,
            offsetWidth: 1,
            clientHeight: 1,
            clientWidth: 1,
            scrollHeight: 1,
            scrollWidth: 1,
            getBoundingClientRect: function() {
                return { width: 1, height: 1, top: 0, left: 0, right: 1, bottom: 1 };
            }
        };

        Object.keys(sizeProps).forEach(prop => {
            try {
                Object.defineProperty(fakeAd, prop, {
                    value: sizeProps[prop],
                    writable: false,
                    configurable: false
                });
            } catch (e) {}
        });
        
        return fakeAd;
    }

    // Inject multiple fake ads
    function injectFakeAds() {
        if (!document.body) return;
        
        // Create multiple fake ad types
        const fakeAdIds = [
            'ad-banner', 'google_ads_iframe', 'adsbygoogle-container',
            'ad-slot', 'advertisement-wrapper'
        ];

        fakeAdIds.forEach(id => {
            const existing = document.getElementById(id);
            if (!existing) {
                const fake = createStealthFakeAd();
                fake.id = id;
                document.body.appendChild(fake);
            }
        });
    }

    // Inject immediately or on DOMContentLoaded
    if (document.body) {
        injectFakeAds();
    } else {
        document.addEventListener('DOMContentLoaded', injectFakeAds);
        // Fallback
        setTimeout(injectFakeAds, 100);
    }

    // ============================================
    // 5. OVERRIDE DOCUMENT QUERY SELECTORS
    // ============================================
    
    const originalQuerySelector = document.querySelector.bind(document);
    const originalQuerySelectorAll = document.querySelectorAll.bind(document);
    const originalGetElementById = document.getElementById.bind(document);
    const originalGetElementsByClassName = document.getElementsByClassName.bind(document);

    // Override querySelector
    document.querySelector = function(selector) {
        if (typeof selector === 'string') {
            const lowerSelector = selector.toLowerCase();
            
            // Return fake ad for ad-related selectors
            if (lowerSelector.includes('adsbygoogle') || 
                lowerSelector.includes('[id*="ad"]') ||
                lowerSelector.includes('.ad-') ||
                lowerSelector.match(/\b(ad|ads|banner|advertisement)\b/)) {
                return createStealthFakeAd();
            }
        }
        
        return originalQuerySelector(selector);
    };

    // Override querySelectorAll
    document.querySelectorAll = function(selector) {
        const results = originalQuerySelectorAll(selector);
        
        if (typeof selector === 'string') {
            const lowerSelector = selector.toLowerCase();
            
            if (lowerSelector.includes('adsbygoogle') || 
                lowerSelector.includes('[id*="ad"]')) {
                // Return NodeList with fake ads
                return [createStealthFakeAd()];
            }
        }
        
        return results;
    };

    // ============================================
    // 6. PREVENT REDIRECT/POPUP ON DETECTION
    // ============================================
    
    // Method 1: Block Location.prototype.href setter (safest)
    const locationDescriptor = getSafeDescriptor(Location.prototype, 'href');
    
    if (locationDescriptor && locationDescriptor.set) {
        const originalLocationSet = locationDescriptor.set;
        
        safeDefineProperty(Location.prototype, 'href', {
            set: function(value) {
                if (typeof value === 'string') {
                    const lowerValue = value.toLowerCase();
                    
                    // Block anti-adblock redirects
                    const blockedPatterns = [
                        'please-disable', 'adblock-detected', 'turn-off-adblocker',
                        'disable-adblock', 'remove-adblock', 'adblocker-warning',
                        'support-us', 'whitelist-us'
                    ];
                    
                    if (blockedPatterns.some(pattern => lowerValue.includes(pattern))) {
                        console.warn('🚫 Blocked anti-adblock redirect:', value);
                        return;
                    }
                }
                
                return originalLocationSet.call(this, value);
            },
            get: locationDescriptor.get,
            configurable: true
        });
    }

    // Method 2: Block location.assign and location.replace
    if (window.location.assign) {
        const originalAssign = window.location.assign.bind(window.location);
        
        window.location.assign = function(url) {
            if (typeof url === 'string') {
                const lowerUrl = url.toLowerCase();
                const blockedPatterns = [
                    'adblock', 'ad-block', 'disable', 
                    'please-disable', 'turn-off'
                ];
                
                if (blockedPatterns.some(pattern => lowerUrl.includes(pattern))) {
                    console.warn('🚫 Blocked location.assign:', url);
                    return;
                }
            }
            return originalAssign(url);
        };
    }
    
    if (window.location.replace) {
        const originalReplace = window.location.replace.bind(window.location);
        
        window.location.replace = function(url) {
            if (typeof url === 'string') {
                const lowerUrl = url.toLowerCase();
                const blockedPatterns = [
                    'adblock', 'ad-block', 'disable',
                    'please-disable', 'turn-off'
                ];
                
                if (blockedPatterns.some(pattern => lowerUrl.includes(pattern))) {
                    console.warn('🚫 Blocked location.replace:', url);
                    return;
                }
            }
            return originalReplace(url);
        };
    }

    // Method 3: Intercept history API
    if (window.history && window.history.pushState) {
        const originalPushState = window.history.pushState.bind(window.history);
        const originalReplaceState = window.history.replaceState.bind(window.history);
        
        window.history.pushState = function(state, title, url) {
            if (url && typeof url === 'string') {
                const lowerUrl = url.toLowerCase();
                if (lowerUrl.includes('adblock') || lowerUrl.includes('disable')) {
                    console.warn('🚫 Blocked history.pushState');
                    return;
                }
            }
            return originalPushState(state, title, url);
        };
        
        window.history.replaceState = function(state, title, url) {
            if (url && typeof url === 'string') {
                const lowerUrl = url.toLowerCase();
                if (lowerUrl.includes('adblock') || lowerUrl.includes('disable')) {
                    console.warn('🚫 Blocked history.replaceState');
                    return;
                }
            }
            return originalReplaceState(state, title, url);
        };
    }

    // ============================================
    // 7. FAKE ANALYTICS/TRACKING
    // ============================================
    
    // Comprehensive fake Google Analytics
    if (!window.ga) {
        window.ga = function() { 
            (window.ga.q = window.ga.q || []).push(arguments); 
        };
        window.ga.q = [];
        window.ga.l = +new Date();
    }

    // Google Tag Manager
    if (!window.dataLayer) {
        window.dataLayer = [];
        window.dataLayer.push = function() { return true; };
    }

    // Fake gtag
    if (!window.gtag) {
        window.gtag = function() { return true; };
    }

    // Fake Facebook Pixel with full API
    if (!window.fbq) {
        window.fbq = function() { return null; };
        window.fbq.push = function() { return null; };
        window.fbq.loaded = true;
        window.fbq.version = '2.0';
        window.fbq.queue = [];
        window._fbq = window.fbq;
    }

    // ============================================
    // 8. AGGRESSIVE ANTI-ADBLOCK LIBRARY DISABLER
    // ============================================
    
    const antiAdblockLibraries = [
        'admiral', 'Admiral',
        'blockadblock', 'BlockAdBlock', 
        'fuckadblock', 'FuckAdBlock',
        'antiAdBlock', 'AntiAdBlock',
        'AdBlockDetector', 'adBlockDetector',
        'detect', 'Detector',
        'adbuddy', 'AdBuddy',
        'addefend', 'AdDefend'
    ];

    antiAdblockLibraries.forEach(lib => {
        // Delete if exists
        try {
            delete window[lib];
        } catch (e) {}
        
        // Redefine as undefined
        safeDefineProperty(window, lib, {
            get: function() { return undefined; },
            set: function() { return true; },
            configurable: false
        });
    });

    // ============================================
    // 9. CONSOLE HIJACKING PREVENTION
    // ============================================
    
    const originalConsoleMethods = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
    };

    // Filter suspicious console messages
    function shouldBlockMessage(msg) {
        const lowerMsg = String(msg).toLowerCase();
        const blockedTerms = [
            'adblock', 'ad-block', 'ad blocker',
            'please disable', 'turn off',
            'detected', 'blocked'
        ];
        
        return blockedTerms.some(term => lowerMsg.includes(term));
    }

    // Override console methods
    ['log', 'warn', 'error', 'info'].forEach(method => {
        console[method] = function(...args) {
            const msg = args.join(' ');
            
            if (shouldBlockMessage(msg)) {
                return; // Silently ignore
            }
            
            return originalConsoleMethods[method].apply(this, args);
        };
    });

    // ============================================
    // 10. DEFENSIVE: OBJECT.FREEZE PROTECTION
    // ============================================
    
    // Protect our modifications from being detected
    const criticalObjects = [
        window.adsbygoogle,
        window.ga,
        window.gtag,
        window.fbq,
        window.dataLayer
    ];

    criticalObjects.forEach(obj => {
        if (obj) {
            try {
                // Make object appear frozen but still modifiable by us
                Object.defineProperty(obj, '__isSealed', { value: true });
                Object.defineProperty(obj, '__isFrozen', { value: true });
            } catch (e) {}
        }
    });

    // ============================================
    // 11. AGGRESSIVE: MUTATION OBSERVER BLOCKER
    // ============================================
    
    // Some sites use MutationObserver to detect our changes
    const OriginalMutationObserver = window.MutationObserver;
    
    window.MutationObserver = function(callback) {
        // Intercept and filter mutations
        const filteredCallback = function(mutations, observer) {
            // Filter out our fake ad injections
            const filteredMutations = mutations.filter(mutation => {
                if (mutation.addedNodes) {
                    for (let node of mutation.addedNodes) {
                        if (node.className && 
                            (node.className.includes('adsbygoogle') || 
                             node.id && node.id.includes('ad'))) {
                            return false; // Hide our fake ads from detection
                        }
                    }
                }
                return true;
            });
            
            if (filteredMutations.length > 0) {
                callback(filteredMutations, observer);
            }
        };
        
        return new OriginalMutationObserver(filteredCallback);
    };

    // ============================================
    // 12. DEFENSIVE: PERFORMANCE TIMING FAKER
    // ============================================
    
    // Some sites measure load times to detect blocking
    if (window.performance && window.performance.getEntriesByType) {
        const originalGetEntriesByType = window.performance.getEntriesByType.bind(window.performance);
        
        window.performance.getEntriesByType = function(type) {
            const entries = originalGetEntriesByType(type);
            
            // Add fake ad resource timings
            if (type === 'resource') {
                entries.push({
                    name: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
                    duration: 150,
                    startTime: 100,
                    responseEnd: 250
                });
            }
            
            return entries;
        };
    }

    // ============================================
    // 13. INITIALIZATION COMPLETE
    // ============================================
    
    // Mark as loaded
    window.__antiAdblockKiller = {
        version: '2.0',
        loaded: true,
        active: true,
        timestamp: Date.now()
    };

    console.log('%c🛡️ DevSage Adblocker V2.0 Active', 
                'color: #4CAF50; font-weight: bold; font-size: 14px;');
    console.log('%c✓ Stealth Mode Enabled', 
                'color: #2196F3; font-size: 12px;');
    console.log('%c✓ Anti-Detection Active', 
                'color: #2196F3; font-size: 12px;');
    console.log('%c✓ Aggressive Protection Loaded', 
                'color: #2196F3; font-size: 12px;');

})();