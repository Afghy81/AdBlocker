// ============================================
// ANTI-ADBLOCK DETECTION KILLER
// Menyamar agar website tidak detect adblocker
// ============================================

(function() {
    'use strict';

    // ============================================
    // 1. FAKE ADBLOCK DETECTION OBJECTS
    // ============================================
    
    // Fake Google AdSense
    if (!window.adsbygoogle) {
        window.adsbygoogle = [];
        window.adsbygoogle.loaded = true;
        window.adsbygoogle.push = function() {
            return true;
        };
    }

    // Fake Google Ads
    window.google_ad_client = "ca-pub-0000000000000000";
    window.google_ad_slot = "0000000000";
    
    // Fake AdBlock detection variables
    window.canRunAds = true;
    window.isAdBlockActive = false;
    window.adBlockEnabled = false;
    window.ads_blocked = false;

    // ============================================
    // 2. OVERRIDE ADBLOCK DETECTION FUNCTIONS
    // ============================================
    
    // Override common detection methods
    const noop = function() { return true; };
    const noopPromise = function() { return Promise.resolve(true); };
    
    window.checkAdBlock = noop;
    window.adBlockDetected = noop;
    window.isAdBlockEnabled = function() { return false; };
    window.detectAdBlock = noopPromise;

    // ============================================
    // 3. INTERCEPT FETCH/XHR FOR AD DETECTION
    // ============================================
    
    // Override fetch to fake ad responses
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        
        // If it's an ad detection test
        if (typeof url === 'string' && 
            (url.includes('/ads') || 
             url.includes('pagead') || 
             url.includes('ad-detect'))) {
            
            // Return fake success response
            return Promise.resolve(new Response('', {
                status: 200,
                statusText: 'OK',
                headers: {'Content-Type': 'text/html'}
            }));
        }
        
        return originalFetch.apply(this, args);
    };

    // Override XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._url = url;
        return originalXHROpen.apply(this, [method, url, ...rest]);
    };

    const originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(...args) {
        if (this._url && 
            (this._url.includes('/ads') || 
             this._url.includes('ad-detect'))) {
            
            // Fake successful response
            Object.defineProperty(this, 'status', { value: 200 });
            Object.defineProperty(this, 'readyState', { value: 4 });
            Object.defineProperty(this, 'responseText', { value: 'OK' });
            
            if (this.onreadystatechange) {
                this.onreadystatechange();
            }
            return;
        }
        
        return originalXHRSend.apply(this, args);
    };

    // ============================================
    // 4. FAKE AD ELEMENTS
    // ============================================
    
    // Create fake ad element for detection
    function createFakeAd() {
        const fakeAd = document.createElement('div');
        fakeAd.className = 'ad-banner';
        fakeAd.style.position = 'absolute';
        fakeAd.style.width = '1px';
        fakeAd.style.height = '1px';
        fakeAd.style.opacity = '0';
        fakeAd.style.pointerEvents = 'none';
        
        // Make it "visible" to detection scripts
        Object.defineProperty(fakeAd, 'offsetHeight', { value: 1 });
        Object.defineProperty(fakeAd, 'offsetWidth', { value: 1 });
        Object.defineProperty(fakeAd, 'clientHeight', { value: 1 });
        Object.defineProperty(fakeAd, 'clientWidth', { value: 1 });
        
        return fakeAd;
    }

    // Inject fake ads early
    if (document.body) {
        document.body.appendChild(createFakeAd());
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(createFakeAd());
        });
    }

    // ============================================
    // 5. OVERRIDE DOCUMENT QUERY SELECTORS
    // ============================================
    
    // Intercept queries for ad elements
    const originalQuerySelector = document.querySelector;
    document.querySelector = function(selector) {
        // If they're checking for ad-related elements
        if (selector && 
            (selector.includes('adsbygoogle') || 
             selector.includes('[id*="ad"]') ||
             selector.includes('[class*="ad"]'))) {
            
            // Return fake element
            return createFakeAd();
        }
        
        return originalQuerySelector.call(this, selector);
    };

    // ============================================
    // 6. PREVENT REDIRECT/POPUP ON DETECTION
    // ============================================
    
    // Block location changes from anti-adblock scripts
    const originalLocationSet = Object.getOwnPropertyDescriptor(Location.prototype, 'href').set;
    Object.defineProperty(Location.prototype, 'href', {
        set: function(value) {
            // Block redirects to anti-adblock pages
            if (typeof value === 'string' && 
                (value.includes('please-disable') || 
                 value.includes('adblock-detected') ||
                 value.includes('turn-off-adblocker'))) {
                console.log('🚫 Blocked anti-adblock redirect');
                return;
            }
            
            return originalLocationSet.call(this, value);
        }
    });

    // ============================================
    // 7. FAKE ANALYTICS/TRACKING
    // ============================================
    
    // Fake Google Analytics
    window.ga = window.ga || function() { 
        (window.ga.q = window.ga.q || []).push(arguments); 
    };
    window.ga.l = +new Date();

    // Fake Facebook Pixel
    window.fbq = function() { return null; };
    window._fbq = window.fbq;

    // ============================================
    // 8. DISABLE ANTI-ADBLOCK LIBRARIES
    // ============================================
    
    // List of known anti-adblock scripts
    const antiAdblockLibraries = [
        'admiral',
        'blockadblock',
        'fuckadblock',
        'antiAdBlock',
        'AdBlockDetector'
    ];

    antiAdblockLibraries.forEach(lib => {
        Object.defineProperty(window, lib, {
            get: function() { return undefined; },
            set: function() { return true; }
        });
    });

    // ============================================
    // 9. CONSOLE HIJACKING PREVENTION
    // ============================================
    
    // Some sites detect adblockers via console
    const originalConsoleLog = console.log;
    console.log = function(...args) {
        const msg = args.join(' ');
        
        // Don't log ad-related messages that might be used for detection
        if (msg.includes('AdBlock') || msg.includes('blocked')) {
            return;
        }
        
        return originalConsoleLog.apply(this, args);
    };

    console.log('🥷 Anti-Adblock Detection Killer Active!');
})();