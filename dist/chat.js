/**
 * Beautiful Flowise Chat Widget v2.1.0-rc4
 * Font Size Improvements
 * 
 * v2.1.0-rc4:
 * - Increased font sizes to match Perplexity (15px base)
 * - Better readability on desktop and mobile
 * 
 * v2.1.0-rc3:
 * - Fixed send button Unicode rendering issue
 * 
 * v2.1.0-rc2:
 * - Removed excessive paragraph spacing (Primus V2 style)
 * - Format markdown on EVERY render (no aggressive caching)
 * - Compact line-height and spacing
 * 
 * v2.1.0-rc1:
 * - Real-time markdown formatting during streaming
 * - Batched updates every 50ms
 * 
 * v2.1.0-beta:
 * - Integrated marked.js + DOMPurify
 * - Primus V2-style layout (bot: 95%, user: 60% max)
 * - Table support
 * 
 * Created by RPS | Inspired by Primus V2
 */

(function() {
    'use strict';

    // Load marked.js and DOMPurify from CDN
    const loadLibrary = (src, name) => {
        return new Promise((resolve, reject) => {
            if (window[name]) {
                resolve(window[name]);
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(window[name]);
            script.onerror = () => reject(new Error(`Failed to load ${name}`));
            document.head.appendChild(script);
        });
    };

    const MARKED_CDN = 'https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js';
    const DOMPURIFY_CDN = 'https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js';

    const defaults = {
        theme: 'modern',
        primaryColor: '#6366f1',
        primaryDarkColor: null,
        position: 'bottom-right',
        width: '400px',
        height: '600px',
        title: 'AI Assistant',
        subtitle: 'Online',
        welcomeMessage: 'Hi! How can I help you today?',
        placeholder: 'Type your message...',
        sendButtonText: '➤',
        showTimestamp: true,
        enableStreaming: true,
        enableMarkdown: true,
        clearChatOnReload: false,
        confirmOnReset: true,
        maxMessages: 100,
        requestTimeout: 30000,
        debug: false,
        avatar: '🤖',
        mode: 'popup',
        customUserMessageBg: null,
        customUserMessageText: null,
        customChatBg: null
    };

    const CONSTANTS = {
        FOCUS_DELAY: 100,
        SCROLL_THROTTLE: 100,
        STREAM_UPDATE_INTERVAL: 50,
        STREAM_MIN_CHARS: 3,
        MAX_INPUT_HEIGHT: 120,
        MIN_REQUEST_INTERVAL: 500,
        ALLOWED_URL_SCHEMES: ['http:', 'https:', 'mailto:', 'tel:']
    };

    const styles = `
:root {
    --bf-primary-color: #6366f1;
    --bf-primary-dark: #4f46e5;
    --bf-custom-user-msg-bg: rgba(99, 102, 241, 0.15);
    --bf-custom-user-msg-text: #1f2937;
    --bf-custom-chat-bg: #ffffff;
}

.bf-container * {
    box-sizing: border-box;
}

.bf-container {
    position: fixed;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.bf-mode-popup {
    bottom: 20px;
    right: 20px;
}

.bf-mode-popup.bf-bottom-left { 
    bottom: 20px; 
    left: 20px;
    right: auto;
}

.bf-mode-fullscreen {
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    bottom: auto;
    right: auto;
}

.bf-chat-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--bf-primary-color), var(--bf-primary-dark));
    border: none;
    cursor: pointer;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    transition: transform 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bf-mode-fullscreen .bf-chat-button {
    display: none !important;
}

.bf-chat-button:hover { transform: scale(1.1); }
.bf-button-icon { width: 28px; height: 28px; color: white; stroke-width: 2; }

.bf-chat-window {
    position: absolute;
    background: white;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;
}

.bf-mode-popup .bf-chat-window {
    bottom: 80px;
    right: 0;
    width: 400px;
    max-width: calc(100vw - 40px);
    height: 600px;
    max-height: calc(100vh - 120px);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}

.bf-mode-popup.bf-bottom-left .bf-chat-window {
    left: 0;
    right: auto;
}

.bf-mode-fullscreen .bf-chat-window {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    box-shadow: none;
    display: flex !important;
    animation: none;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.bf-header {
    background: linear-gradient(135deg, var(--bf-primary-color), var(--bf-primary-dark));
    color: white;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}

.bf-header-content { display: flex; align-items: center; gap: 12px; flex: 1; }

.bf-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.bf-title { font-size: 16px; font-weight: 600; }
.bf-subtitle { font-size: 12px; opacity: 0.9; }

.bf-header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.bf-reset-btn {
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.bf-reset-btn:hover {
    background: rgba(255,255,255,0.3);
}

.bf-minimize-btn {
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bf-mode-fullscreen .bf-minimize-btn {
    display: none;
}

.bf-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f9fafb;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.bf-messages::-webkit-scrollbar { width: 6px; }
.bf-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

.bf-message {
    display: flex !important;
    animation: fadeIn 0.3s;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.bf-message.bf-bot-message { 
    justify-content: flex-start !important;
}

.bf-message.bf-user-message { 
    justify-content: flex-end !important;
}

.bf-message-content {
    display: flex !important;
    flex-direction: column !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* Primus V2-style layout */
.bf-bot-message .bf-message-content {
    align-items: flex-start !important;
    max-width: 95% !important;
    width: 100% !important;
}

.bf-user-message .bf-message-content {
    align-items: flex-end !important;
    max-width: 60% !important;
    width: fit-content !important;
}

.bf-message-text {
    padding: 12px 16px !important;
    border-radius: 16px;
    font-size: 15px;
    line-height: 1.6;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: keep-all;
    hyphens: none;
    white-space: normal;
    display: inline-block !important;
    width: fit-content !important;
    max-width: 100% !important;
    text-align: left !important;
    margin: 0 !important;
}

.bf-bot-message .bf-message-text {
    background: white;
    color: #1f2937;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    width: 100% !important;
}

.bf-user-message .bf-message-text {
    background: var(--bf-custom-user-msg-bg) !important;
    color: var(--bf-custom-user-msg-text) !important;
    border: none !important;
    box-shadow: none !important;
    width: fit-content !important;
    white-space: pre-wrap;
}

.bf-message-time {
    font-size: 11px;
    color: #6b7280;
    margin-top: 4px;
    padding: 0 4px;
}

/* Perplexity-style COMPACT content styling with better readability */
.bf-message-text p { 
    margin: 0 0 10px 0;
}

.bf-message-text p:last-child { 
    margin-bottom: 0; 
}

.bf-message-text p:only-child {
    margin-bottom: 0;
}

.bf-message-text strong { 
    font-weight: 600; 
    color: #111827; 
}

.bf-message-text em { 
    font-style: italic; 
}

.bf-message-text code {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #be123c;
}

.bf-message-text pre {
    background: #1f2937;
    color: #f9fafb;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 10px 0;
}

.bf-message-text pre code {
    background: transparent;
    color: #f9fafb;
    padding: 0;
    font-size: 14px;
}

.bf-message-text ul,
.bf-message-text ol {
    margin: 10px 0;
    padding-left: 24px;
}

.bf-message-text ul {
    list-style-type: disc;
}

.bf-message-text ol {
    list-style-type: decimal;
}

.bf-message-text li { 
    margin: 5px 0;
    line-height: 1.6;
    display: list-item;
}

.bf-message-text a {
    color: var(--bf-primary-color);
    text-decoration: underline;
}

.bf-message-text h1,
.bf-message-text h2,
.bf-message-text h3 {
    font-weight: 600;
    color: #111827;
    margin: 14px 0 10px 0;
    line-height: 1.4;
}

.bf-message-text h1:first-child,
.bf-message-text h2:first-child,
.bf-message-text h3:first-child {
    margin-top: 0;
}

.bf-message-text h1 { font-size: 20px; }
.bf-message-text h2 { font-size: 18px; }
.bf-message-text h3 { font-size: 16px; }

/* Table styling (Perplexity-sized) */
.bf-message-text table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 14px;
    line-height: 1.5;
    display: block;
    overflow-x: auto;
    border: 1px solid #e5e7eb;
}

.bf-message-text th,
.bf-message-text td {
    border: 1px solid #e5e7eb;
    padding: 10px 12px;
    text-align: left;
}

.bf-message-text thead th {
    background: #f3f4f6;
    font-weight: 600;
    color: #111827;
}

.bf-message-text tbody tr:nth-child(odd) {
    background: white;
}

.bf-message-text tbody tr:nth-child(even) {
    background: #f9fafb;
}

.bf-loading-dots {
    display: flex;
    align-items: center;
    gap: 4px;
}

.bf-loading-dots span {
    width: 8px;
    height: 8px;
    background: var(--bf-primary-color);
    border-radius: 50%;
    animation: pulse-dot 1.4s ease-in-out infinite;
}

.bf-loading-dots span:nth-child(1) { animation-delay: 0s; }
.bf-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.bf-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse-dot {
    0%, 60%, 100% { 
        transform: scale(0.8);
        opacity: 0.5;
    }
    30% { 
        transform: scale(1.2);
        opacity: 1;
    }
}

.bf-streaming .bf-message-text {
    will-change: contents;
}

.bf-streaming .bf-cursor {
    display: inline-block;
    width: 2px;
    height: 1em;
    background: var(--bf-primary-color);
    margin-left: 2px;
    animation: blink-cursor 1s steps(2, start) infinite;
    vertical-align: text-bottom;
}

@keyframes blink-cursor {
    50% { opacity: 0; }
}

.bf-input-container {
    padding: 16px;
    background: white;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 10px;
    align-items: flex-end;
    flex-shrink: 0;
}

.bf-input {
    flex: 1;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 15px;
    font-family: inherit;
    resize: none;
    outline: none;
    transition: border-color 0.2s;
    max-height: 120px;
    min-height: 44px;
    color: #1f2937;
    line-height: 1.5;
}

.bf-input:focus { border-color: var(--bf-primary-color); }
.bf-input:disabled { opacity: 0.6; cursor: not-allowed; background: #f3f4f6; }

.bf-send-btn {
    background: linear-gradient(135deg, var(--bf-primary-color), var(--bf-primary-dark));
    color: white;
    border: none;
    border-radius: 12px;
    width: 44px;
    height: 44px;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
    flex-shrink: 0;
}

.bf-send-btn:hover { transform: scale(1.05); }
.bf-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.bf-footer {
    padding: 8px;
    text-align: center;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
    flex-shrink: 0;
}

.bf-branding {
    font-size: 11px;
    color: #6b7280;
    text-decoration: none;
    transition: color 0.2s;
}

.bf-branding:hover {
    color: var(--bf-primary-color);
}

/* THEMES */
.bf-theme-cloudflare { 
    --bf-primary-color: #f38020; 
    --bf-primary-dark: #d96b0f; 
}

.bf-theme-intercom { 
    --bf-primary-color: #1f8ded; 
    --bf-primary-dark: #1273c5; 
}

.bf-theme-gradient { 
    --bf-primary-color: #667eea; 
    --bf-primary-dark: #764ba2; 
}

.bf-theme-glassmorphism .bf-chat-window {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
}
.bf-theme-glassmorphism .bf-user-message .bf-message-text {
    backdrop-filter: blur(10px);
}

.bf-theme-dark { 
    --bf-primary-color: #6366f1; 
    --bf-primary-dark: #4f46e5;
    --bf-custom-user-msg-text: #e0e7ff;
}
.bf-theme-dark .bf-chat-window { background: #1f2937; }
.bf-theme-dark .bf-messages { background: #111827; }
.bf-theme-dark .bf-bot-message .bf-message-text { 
    background: #374151 !important; 
    color: #f9fafb !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
}
.bf-theme-dark .bf-user-message .bf-message-text {
    background: rgba(99, 102, 241, 0.25) !important;
}
.bf-theme-dark .bf-input { 
    background: #374151; 
    color: #f9fafb; 
    border-color: #4b5563; 
}
.bf-theme-dark .bf-input::placeholder {
    color: #9ca3af;
}
.bf-theme-dark .bf-input-container { 
    background: #1f2937; 
    border-top-color: #374151; 
}
.bf-theme-dark .bf-footer { 
    background: #1f2937; 
    border-top-color: #374151; 
}
.bf-theme-dark .bf-branding { color: #9ca3af; }
.bf-theme-dark .bf-message-time { color: #9ca3af; }
.bf-theme-dark .bf-message-text table thead th {
    background: #4b5563;
    color: #f9fafb;
}
.bf-theme-dark .bf-message-text table tbody tr:nth-child(odd) {
    background: #374151;
}
.bf-theme-dark .bf-message-text table tbody tr:nth-child(even) {
    background: #4b5563;
}
.bf-theme-dark .bf-message-text table th,
.bf-theme-dark .bf-message-text table td {
    border-color: #4b5563;
}

.bf-theme-minimal { 
    --bf-primary-color: #000000; 
    --bf-primary-dark: #1f2937;
    --bf-custom-user-msg-bg: rgba(0, 0, 0, 0.06);
}

/* CUSTOM THEME */
.bf-theme-custom .bf-header {
    background: linear-gradient(135deg, var(--bf-primary-color), var(--bf-primary-dark)) !important;
}

.bf-theme-custom .bf-chat-button {
    background: linear-gradient(135deg, var(--bf-primary-color), var(--bf-primary-dark)) !important;
}

.bf-theme-custom .bf-send-btn {
    background: linear-gradient(135deg, var(--bf-primary-color), var(--bf-primary-dark)) !important;
}

.bf-theme-custom .bf-chat-window {
    background: var(--bf-custom-chat-bg) !important;
}

.bf-theme-custom .bf-messages {
    background: var(--bf-custom-chat-bg) !important;
}

.bf-theme-custom .bf-input-container {
    background: var(--bf-custom-chat-bg) !important;
}

.bf-theme-custom .bf-footer {
    background: var(--bf-custom-chat-bg) !important;
}

.bf-theme-custom .bf-loading-dots span {
    background: var(--bf-primary-color) !important;
}

.bf-theme-custom .bf-streaming .bf-cursor {
    background: var(--bf-primary-color) !important;
}

.bf-theme-custom .bf-input:focus {
    border-color: var(--bf-primary-color) !important;
}

.bf-theme-custom .bf-branding:hover {
    color: var(--bf-primary-color) !important;
}

.bf-theme-custom .bf-message-text a {
    color: var(--bf-primary-color) !important;
}
    `;

    class BeautifulFlowiseChat {
        constructor(config) {
            this.config = { ...defaults, ...config };
            this.chatflowid = config.chatflowid;
            this.apiHost = config.apiHost;
            
            this.storageKey = `${this.chatflowid}_INTERNAL`;
            
            this.isOpen = this.config.mode === 'fullscreen';
            this.currentStreamingMessageId = null;
            this.messages = [];
            this.chatId = null;
            
            this.lastScrollTime = 0;
            this.scrollPending = false;
            this.scrollAnimationFrame = null;
            
            this.streamBuffer = '';
            this.streamLastUpdate = '';
            this.streamUpdateTimer = null;
            this.streamCharCount = 0;
            this.firstTokenReceived = false;
            
            // Simplified: no aggressive caching
            this.lastFormattedLength = 0;
            
            this.abortController = null;
            this.isSending = false;
            this.lastRequestTime = 0;
            
            this.eventListeners = [];
            
            // Will be populated after libraries load
            this.marked = null;
            this.DOMPurify = null;
            
            this.init();
        }

        async init() {
            const existing = document.getElementById('beautiful-flowise-container');
            if (existing) {
                this.log('Removing existing widget instance');
                existing.remove();
            }
            
            // Load markdown libraries
            try {
                await Promise.all([
                    loadLibrary(MARKED_CDN, 'marked'),
                    loadLibrary(DOMPURIFY_CDN, 'DOMPurify')
                ]);
                this.marked = window.marked;
                this.DOMPurify = window.DOMPurify;
                
                // Configure marked for GFM
                if (this.marked && this.marked.setOptions) {
                    this.marked.setOptions({
                        breaks: true,
                        gfm: true,
                        headerIds: false,
                        mangle: false
                    });
                }
                
                this.log('Markdown libraries loaded successfully');
            } catch (error) {
                this.log('Warning: Failed to load markdown libraries, falling back to basic formatting');
            }
            
            this.injectStyles();
            this.createWidget();
            this.applyCustomThemeColors();
            this.attachEventListeners();
            this.loadFromStorage();
            
            this.log('Chat ID:', this.chatId || 'Not yet assigned');
            this.log('Mode:', this.config.mode);
            this.log('Messages loaded:', this.messages.length);
        }

        applyCustomThemeColors() {
            const container = document.getElementById('beautiful-flowise-container');
            if (!container) return;
            
            container.style.setProperty('--bf-primary-color', this.config.primaryColor);
            
            const primaryDark = this.config.primaryDarkColor || this.darkenColor(this.config.primaryColor);
            container.style.setProperty('--bf-primary-dark', primaryDark);
            
            if (this.config.theme === 'custom') {
                if (this.config.customUserMessageBg) {
                    container.style.setProperty('--bf-custom-user-msg-bg', this.config.customUserMessageBg);
                } else {
                    const rgba = this.colorToRgba(this.config.primaryColor, 0.15);
                    container.style.setProperty('--bf-custom-user-msg-bg', rgba);
                }
                
                if (this.config.customUserMessageText) {
                    container.style.setProperty('--bf-custom-user-msg-text', this.config.customUserMessageText);
                }
                
                if (this.config.customChatBg) {
                    container.style.setProperty('--bf-custom-chat-bg', this.config.customChatBg);
                }
            }
        }

        darkenColor(color) {
            if (!color) return '#4f46e5';
            
            if (color.startsWith('#')) {
                return this.darkenHex(color);
            }
            
            const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (rgbMatch) {
                const [, r, g, b, a] = rgbMatch;
                const darkR = Math.max(0, Math.floor(parseInt(r) * 0.8));
                const darkG = Math.max(0, Math.floor(parseInt(g) * 0.8));
                const darkB = Math.max(0, Math.floor(parseInt(b) * 0.8));
                return a !== undefined ? `rgba(${darkR}, ${darkG}, ${darkB}, ${a})` : `rgb(${darkR}, ${darkG}, ${darkB})`;
            }
            
            return '#4f46e5';
        }

        darkenHex(hex) {
            hex = hex.replace('#', '');
            
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            
            if (hex.length !== 6) return '#4f46e5';
            
            const r = Math.max(0, Math.floor(parseInt(hex.substring(0, 2), 16) * 0.8));
            const g = Math.max(0, Math.floor(parseInt(hex.substring(2, 4), 16) * 0.8));
            const b = Math.max(0, Math.floor(parseInt(hex.substring(4, 6), 16) * 0.8));
            
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }

        colorToRgba(color, alpha) {
            if (!color) return `rgba(99, 102, 241, ${alpha})`;
            
            const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (rgbMatch) {
                const [, r, g, b] = rgbMatch;
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
            
            if (color.startsWith('#')) {
                let hex = color.replace('#', '');
                
                if (hex.length === 3) {
                    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                }
                
                if (hex.length === 6) {
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    
                    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    }
                }
            }
            
            return `rgba(99, 102, 241, ${alpha})`;
        }

        log(...args) {
            if (this.config.debug) console.log('[BeautifulFlowise]', ...args);
        }

        loadFromStorage() {
            if (this.config.clearChatOnReload) {
                this.messages = [];
                this.chatId = null;
                this.initializeWithWelcome();
                return;
            }

            try {
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                    const data = JSON.parse(stored);
                    
                    if (typeof data !== 'object' || data === null) {
                        throw new Error('Invalid data structure');
                    }
                    
                    if (data.chatId) {
                        if (/^[a-f0-9-]{36}$/i.test(data.chatId)) {
                            this.chatId = data.chatId;
                            this.log('Loaded chatId from storage:', this.chatId);
                        } else {
                            this.log('Invalid chatId format, clearing');
                            data.chatId = null;
                        }
                    }
                    
                    if (data.messages && Array.isArray(data.messages)) {
                        if (data.messages.length > this.config.maxMessages) {
                            this.log(`Trimming message history from ${data.messages.length} to ${this.config.maxMessages}`);
                            data.messages = data.messages.slice(-this.config.maxMessages);
                        }
                        
                        if (data.messages.length > 0) {
                            this.messages = data.messages;
                            this.restoreMessages();
                        } else {
                            this.initializeWithWelcome();
                        }
                    } else {
                        this.initializeWithWelcome();
                    }
                } else {
                    this.initializeWithWelcome();
                }
            } catch (e) {
                this.log('Error loading from storage:', e);
                localStorage.removeItem(this.storageKey);
                this.initializeWithWelcome();
            }
        }

        initializeWithWelcome() {
            this.messages = [];
            if (this.config.welcomeMessage) {
                this.messages.push({ role: 'bot', content: this.config.welcomeMessage });
                this.addMessageToUI(this.config.welcomeMessage, 'bot');
                this.saveToStorage();
            }
        }

        saveToStorage() {
            if (this.config.clearChatOnReload) return;
            
            try {
                let messagesToSave = this.messages;
                if (messagesToSave.length > this.config.maxMessages) {
                    messagesToSave = messagesToSave.slice(-this.config.maxMessages);
                    this.messages = messagesToSave;
                }
                
                const data = {
                    chatId: this.chatId,
                    messages: messagesToSave
                };
                localStorage.setItem(this.storageKey, JSON.stringify(data));
                this.log('Saved to storage - chatId:', this.chatId, 'messages:', messagesToSave.length);
            } catch (e) {
                this.log('Error saving to storage:', e);
            }
        }

        restoreMessages() {
            const messagesContainer = document.getElementById('bf-messages');
            messagesContainer.innerHTML = '';
            
            this.messages.forEach(msg => {
                this.addMessageToUI(msg.content, msg.role);
            });
            
            this.scrollToBottom();
            this.log('Restored', this.messages.length, 'messages');
        }

        resetConversation() {
            const shouldReset = this.config.confirmOnReset 
                ? confirm('Are you sure you want to clear the chat history?')
                : true;
            
            if (shouldReset) {
                if (this.abortController) {
                    this.abortController.abort();
                    this.abortController = null;
                }
                
                localStorage.removeItem(this.storageKey);
                
                this.chatId = null;
                this.messages = [];
                this.isSending = false;
                this.currentStreamingMessageId = null;
                
                const messagesContainer = document.getElementById('bf-messages');
                messagesContainer.innerHTML = '';
                
                const input = document.getElementById('bf-input');
                const sendBtn = document.getElementById('bf-send');
                if (input) input.disabled = false;
                if (sendBtn) sendBtn.disabled = false;
                
                this.initializeWithWelcome();
                
                this.log('Chat reset');
            }
        }

        injectStyles() {
            if (document.getElementById('beautiful-flowise-styles')) return;
            const styleSheet = document.createElement('style');
            styleSheet.id = 'beautiful-flowise-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        createWidget() {
            const container = document.createElement('div');
            container.id = 'beautiful-flowise-container';
            container.className = `bf-container bf-mode-${this.config.mode} bf-${this.config.position} bf-theme-${this.config.theme}`;
            
            const chatWindowDisplay = this.config.mode === 'fullscreen' ? 'flex' : 'none';
            
            container.innerHTML = `
                <button class="bf-chat-button" id="bf-toggle-button">
                    <svg class="bf-button-icon bf-button-open" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <svg class="bf-button-icon bf-button-close" style="display: none;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="bf-chat-window" id="bf-chat-window" style="display: ${chatWindowDisplay};">
                    <div class="bf-header">
                        <div class="bf-header-content">
                            <div class="bf-avatar">${this.config.avatar}</div>
                            <div class="bf-header-text">
                                <div class="bf-title">${this.config.title}</div>
                                <div class="bf-subtitle">${this.config.subtitle}</div>
                            </div>
                        </div>
                        <div class="bf-header-actions">
                            <button class="bf-reset-btn" id="bf-reset" title="Reset Chat">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="1 4 1 10 7 10"></polyline>
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                                </svg>
                            </button>
                            <button class="bf-minimize-btn" id="bf-minimize">−</button>
                        </div>
                    </div>
                    <div class="bf-messages" id="bf-messages"></div>
                    <div class="bf-input-container">
                        <textarea class="bf-input" id="bf-input" placeholder="${this.config.placeholder}" rows="1"></textarea>
                        <button class="bf-send-btn" id="bf-send">${this.config.sendButtonText}</button>
                    </div>
                    <div class="bf-footer">
                        <a href="mailto:mail.rps.active@proton.me" class="bf-branding">Powered by RPS</a>
                    </div>
                </div>
            `;
            document.body.appendChild(container);
        }

        attachEventListeners() {
            const addListener = (element, event, handler) => {
                if (element) {
                    element.addEventListener(event, handler);
                    this.eventListeners.push({ element, event, handler });
                }
            };
            
            addListener(document.getElementById('bf-toggle-button'), 'click', () => this.toggleChat());
            
            const minimizeBtn = document.getElementById('bf-minimize');
            if (minimizeBtn && this.config.mode === 'popup') {
                addListener(minimizeBtn, 'click', () => this.toggleChat());
            }
            
            addListener(document.getElementById('bf-reset'), 'click', () => this.resetConversation());
            addListener(document.getElementById('bf-send'), 'click', () => this.sendMessage());
            
            const input = document.getElementById('bf-input');
            const inputKeyHandler = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            };
            addListener(input, 'keydown', inputKeyHandler);
            
            const inputResizeHandler = () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, CONSTANTS.MAX_INPUT_HEIGHT) + 'px';
            };
            addListener(input, 'input', inputResizeHandler);
            
            if (this.config.mode === 'fullscreen') {
                setTimeout(() => input.focus(), CONSTANTS.FOCUS_DELAY);
            }
        }

        removeEventListeners() {
            this.eventListeners.forEach(({ element, event, handler }) => {
                if (element) {
                    element.removeEventListener(event, handler);
                }
            });
            this.eventListeners = [];
        }

        toggleChat() {
            if (this.config.mode === 'fullscreen') return;
            
            this.isOpen = !this.isOpen;
            const chatWindow = document.getElementById('bf-chat-window');
            const openIcon = document.querySelector('.bf-button-open');
            const closeIcon = document.querySelector('.bf-button-close');
            if (this.isOpen) {
                chatWindow.style.display = 'flex';
                openIcon.style.display = 'none';
                closeIcon.style.display = 'block';
                document.getElementById('bf-input').focus();
            } else {
                chatWindow.style.display = 'none';
                openIcon.style.display = 'block';
                closeIcon.style.display = 'none';
                
                if (this.abortController) {
                    this.abortController.abort();
                    this.abortController = null;
                }
            }
        }

        async sendMessage() {
            const input = document.getElementById('bf-input');
            const sendBtn = document.getElementById('bf-send');
            const message = input.value.trim();
            
            if (!message) return;
            if (this.isSending) {
                this.log('Already sending a message');
                return;
            }
            
            const now = Date.now();
            if (now - this.lastRequestTime < CONSTANTS.MIN_REQUEST_INTERVAL) {
                this.log('Rate limited');
                return;
            }
            this.lastRequestTime = now;
            
            this.isSending = true;
            input.disabled = true;
            sendBtn.disabled = true;

            this.addMessage(message, 'user');
            
            input.value = '';
            input.style.height = 'auto';

            const botMessageId = this.createPlaceholderMessage();
            this.currentStreamingMessageId = botMessageId;
            this.firstTokenReceived = false;
            
            // Reset tracking
            this.lastFormattedLength = 0;
            
            this.abortController = new AbortController();

            try {
                if (this.config.enableStreaming) {
                    await this.sendWithStreaming(message, botMessageId);
                } else {
                    await this.sendWithoutStreaming(message, botMessageId);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    this.log('Request aborted');
                } else {
                    this.log('Error:', error);
                    const elem = document.getElementById(botMessageId);
                    if (elem) elem.remove();
                    this.addMessage(
                        "I'm having trouble connecting. Please try again. 🔄",
                        'bot'
                    );
                }
            } finally {
                this.currentStreamingMessageId = null;
                this.abortController = null;
                this.isSending = false;
                input.disabled = false;
                sendBtn.disabled = false;
            }
        }

        async fetchWithTimeout(url, options) {
            const controller = this.abortController;
            const timeout = setTimeout(() => {
                if (controller) controller.abort();
            }, this.config.requestTimeout);

            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller ? controller.signal : undefined
                });
                clearTimeout(timeout);
                return response;
            } catch (error) {
                clearTimeout(timeout);
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout or aborted');
                }
                throw error;
            }
        }

        async sendWithStreaming(message, botMessageId) {
            try {
                const body = { 
                    question: message, 
                    streaming: true
                };
                
                if (this.chatId) {
                    body.chatId = this.chatId;
                }
                
                const response = await this.fetchWithTimeout(
                    `${this.apiHost}/api/v1/prediction/${this.chatflowid}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    }
                );

                if (!response.ok) throw new Error('API failed');
                
                const contentType = response.headers.get('content-type');
                if (!contentType?.includes('text/event-stream')) {
                    const data = await response.json();
                    if (data.chatId && data.chatId !== this.chatId) {
                        this.chatId = data.chatId;
                        this.saveToStorage();
                        this.log('ChatId assigned:', this.chatId);
                    }
                    const botMessage = data.text || data.answer || data.response || 'No response';
                    this.updatePlaceholderMessage(botMessageId, botMessage, false);
                    this.addMessageToStorage(botMessage, 'bot');
                    return;
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                
                this.streamBuffer = '';
                this.streamLastUpdate = '';
                this.streamCharCount = 0;
                this.firstTokenReceived = false;
                
                const scheduleUpdate = () => {
                    if (this.streamUpdateTimer) return;
                    
                    this.streamUpdateTimer = setTimeout(() => {
                        const charDiff = this.streamBuffer.length - this.streamLastUpdate.length;
                        
                        // Update DURING streaming - EVERY TIME (no caching)
                        if (charDiff >= CONSTANTS.STREAM_MIN_CHARS || !this.firstTokenReceived) {
                            this.updatePlaceholderMessage(botMessageId, this.streamBuffer, true);
                            this.streamLastUpdate = this.streamBuffer;
                            this.firstTokenReceived = true;
                        }
                        
                        this.streamUpdateTimer = null;
                    }, CONSTANTS.STREAM_UPDATE_INTERVAL);
                };
                
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed.startsWith(':') || !trimmed.startsWith('data:')) continue;

                        const payload = trimmed.slice(5).trim();
                        if (payload === '[DONE]' || payload === '"[DONE]"') continue;

                        let token = '';
                        let metadata = null;
                        
                        try {
                            const obj = JSON.parse(payload);
                            if (obj && typeof obj === 'object') {
                                if (obj.event === 'token' && obj.data) {
                                    token = obj.data;
                                } else if (obj.event === 'metadata' && obj.data) {
                                    metadata = obj.data;
                                } else if (typeof obj === 'string') {
                                    token = obj;
                                }
                            }
                        } catch {
                            if (payload.startsWith('"') && payload.endsWith('"')) {
                                try {
                                    token = JSON.parse(payload);
                                } catch {
                                    token = payload.slice(1, -1);
                                }
                            } else {
                                token = payload;
                            }
                        }

                        if (metadata && metadata.chatId && metadata.chatId !== this.chatId) {
                            this.chatId = metadata.chatId;
                            this.saveToStorage();
                            this.log('ChatId assigned:', this.chatId);
                        }

                        if (token) {
                            this.streamBuffer += token;
                            this.streamCharCount++;
                            scheduleUpdate();
                        }
                    }
                }

                if (this.streamUpdateTimer) {
                    clearTimeout(this.streamUpdateTimer);
                    this.streamUpdateTimer = null;
                }
                
                if (this.streamBuffer) {
                    // Final update
                    this.updatePlaceholderMessage(botMessageId, this.streamBuffer, false);
                    this.addMessageToStorage(this.streamBuffer, 'bot');
                    this.streamBuffer = '';
                } else {
                    throw new Error('No text streamed');
                }

            } catch (error) {
                if (error.name === 'AbortError' || error.message.includes('aborted')) {
                    throw error;
                }
                this.log('Streaming failed:', error);
                await this.sendWithoutStreaming(message, botMessageId);
            }
        }

        async sendWithoutStreaming(message, botMessageId) {
            const body = { question: message };
            
            if (this.chatId) {
                body.chatId = this.chatId;
            }
            
            const response = await this.fetchWithTimeout(
                `${this.apiHost}/api/v1/prediction/${this.chatflowid}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                }
            );

            if (!response.ok) throw new Error('API failed');
            const data = await response.json();
            
            if (data.chatId && data.chatId !== this.chatId) {
                this.chatId = data.chatId;
                this.saveToStorage();
                this.log('ChatId assigned:', this.chatId);
            }
            
            const botMessage = data.text || data.answer || data.response || 'No response';
            this.updatePlaceholderMessage(botMessageId, botMessage, false);
            this.addMessageToStorage(botMessage, 'bot');
        }

        addMessageToStorage(content, role) {
            this.messages.push({ role, content });
            this.saveToStorage();
        }

        addMessage(text, sender) {
            this.addMessageToStorage(text, sender);
            this.addMessageToUI(text, sender);
        }

        addMessageToUI(text, sender) {
            const messagesContainer = document.getElementById('bf-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `bf-message bf-${sender}-message`;
            
            const formattedText = sender === 'bot' ? this.formatMarkdown(text) : this.escapeHtml(text);
            
            messageDiv.innerHTML = `
                <div class="bf-message-content">
                    <div class="bf-message-text">${formattedText}</div>
                    ${this.config.showTimestamp ? `<div class="bf-message-time">${this.getTimeString()}</div>` : ''}
                </div>
            `;
            messagesContainer.appendChild(messageDiv);
            this.scrollToBottom();
        }

        createPlaceholderMessage() {
            const messagesContainer = document.getElementById('bf-messages');
            const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            const messageDiv = document.createElement('div');
            messageDiv.id = messageId;
            messageDiv.className = 'bf-message bf-bot-message';
            
            messageDiv.innerHTML = `
                <div class="bf-message-content">
                    <div class="bf-message-text">
                        <div class="bf-loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    ${this.config.showTimestamp ? `<div class="bf-message-time">${this.getTimeString()}</div>` : ''}
                </div>
            `;

            messagesContainer.appendChild(messageDiv);
            this.scrollToBottom();
            return messageId;
        }

        updatePlaceholderMessage(messageId, text, isStreaming) {
            const messageDiv = document.getElementById(messageId);
            if (!messageDiv) return;

            const textElement = messageDiv.querySelector('.bf-message-text');
            
            // TRUE REAL-TIME: Format markdown on EVERY render (with light threshold)
            if (this.marked && this.DOMPurify && this.config.enableMarkdown) {
                // Only re-parse if 5+ new characters OR final render
                const needsReformat = text.length - this.lastFormattedLength >= 5 || !isStreaming;
                
                let formattedHtml;
                if (needsReformat) {
                    try {
                        const rawHtml = this.marked.parse(text);
                        formattedHtml = this.DOMPurify.sanitize(rawHtml);
                        this.lastFormattedLength = text.length;
                    } catch (e) {
                        this.log('Markdown parse error:', e);
                        formattedHtml = this.escapeHtml(text).replace(/\n/g, '<br>');
                    }
                } else {
                    // Use last formatted version + plain text for new chars
                    const newChars = text.substring(this.lastFormattedLength);
                    formattedHtml = textElement.innerHTML.replace(/<span class="bf-cursor"><\/span>/g, '') + this.escapeHtml(newChars).replace(/\n/g, '<br>');
                }
                
                textElement.innerHTML = formattedHtml;
                
                if (isStreaming) {
                    // Add cursor
                    const cursor = document.createElement('span');
                    cursor.className = 'bf-cursor';
                    textElement.appendChild(cursor);
                    messageDiv.classList.add('bf-streaming');
                    this.smartScroll();
                } else {
                    messageDiv.classList.remove('bf-streaming');
                    this.scrollToBottom();
                }
            } else {
                // Fallback: basic formatting
                if (isStreaming) {
                    textElement.textContent = text;
                    const cursor = document.createElement('span');
                    cursor.className = 'bf-cursor';
                    textElement.appendChild(cursor);
                    messageDiv.classList.add('bf-streaming');
                    this.smartScroll();
                } else {
                    textElement.innerHTML = this.formatMarkdown(text);
                    messageDiv.classList.remove('bf-streaming');
                    this.scrollToBottom();
                }
            }
        }

        smartScroll() {
            const container = document.getElementById('bf-messages');
            if (!container) return;
            
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
            
            if (isNearBottom) {
                if (this.scrollAnimationFrame) {
                    cancelAnimationFrame(this.scrollAnimationFrame);
                }
                
                this.scrollAnimationFrame = requestAnimationFrame(() => {
                    container.scrollTop = container.scrollHeight;
                    this.scrollAnimationFrame = null;
                });
            }
        }

        formatMarkdown(text) {
            if (!this.config.enableMarkdown) return this.escapeHtml(text).replace(/\n/g, '<br>');
            
            // Use marked.js if available
            if (this.marked && this.DOMPurify) {
                try {
                    const rawHtml = this.marked.parse(text);
                    const sanitizedHtml = this.DOMPurify.sanitize(rawHtml);
                    return sanitizedHtml;
                } catch (error) {
                    this.log('Markdown parsing error, falling back:', error);
                    // Fall through to basic formatting
                }
            }
            
            // Fallback: basic formatting
            let html = this.escapeHtml(text);
            
            // Headers
            html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
            html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
            html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
            
            // Bold
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
            
            // Italic
            html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
            html = html.replace(/_(.+?)_/g, '<em>$1</em>');
            
            // Code blocks
            html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            
            // Inline code
            html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
            
            // Links
            html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
                try {
                    const urlObj = new URL(url, window.location.href);
                    if (!CONSTANTS.ALLOWED_URL_SCHEMES.includes(urlObj.protocol)) {
                        return match;
                    }
                    return `<a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
                } catch {
                    return match;
                }
            });
            
            // Lists
            html = html.replace(/^\d+\.\s+(.+)$/gm, '<li data-list="ol">$1</li>');
            html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li data-list="ul">$1</li>');
            html = html.replace(/(<li[^>]*>.+?<\/li>(?:\n<li[^>]*>.+?<\/li>)*)/g, (match) => {
                const listType = match.includes('data-list="ol"') ? 'ol' : 'ul';
                const cleaned = match.replace(/ data-list="[^"]+"/g, '');
                return `<${listType}>${cleaned}</${listType}>`;
            });
            
            // Paragraphs
            html = html.replace(/\n\n/g, '</p><p>');
            html = html.replace(/\n/g, '<br>');
            html = '<p>' + html + '</p>';
            html = html.replace(/<p><\/p>/g, '');
            html = html.replace(/<p>(<[uo]l>)/g, '$1');
            html = html.replace(/(<\/[uo]l>)<\/p>/g, '$1');
            html = html.replace(/<p>(<h[123]>)/g, '$1');
            html = html.replace(/(<\/h[123]>)<\/p>/g, '$1');
            html = html.replace(/<p>(<pre>)/g, '$1');
            html = html.replace(/(<\/pre>)<\/p>/g, '$1');
            
            return html;
        }

        scrollToBottom() {
            const container = document.getElementById('bf-messages');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }

        getTimeString() {
            return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        destroy() {
            if (this.abortController) {
                this.abortController.abort();
            }
            
            if (this.streamUpdateTimer) {
                clearTimeout(this.streamUpdateTimer);
            }
            
            if (this.scrollAnimationFrame) {
                cancelAnimationFrame(this.scrollAnimationFrame);
            }
            
            this.removeEventListeners();
            
            const container = document.getElementById('beautiful-flowise-container');
            if (container) {
                container.remove();
            }
            
            this.log('Widget destroyed');
        }
    }

    function validateConfig(config) {
        if (!config || typeof config !== 'object') {
            console.error('BeautifulFlowiseChat: config must be an object');
            return false;
        }
        if (!config.chatflowid || typeof config.chatflowid !== 'string') {
            console.error('BeautifulFlowiseChat: chatflowid is required');
            return false;
        }
        if (!config.apiHost || typeof config.apiHost !== 'string') {
            console.error('BeautifulFlowiseChat: apiHost is required');
            return false;
        }
        return true;
    }

    window.BeautifulFlowiseChat = {
        init: function(config) {
            if (!validateConfig(config)) return null;
            return new BeautifulFlowiseChat({ ...config, mode: 'popup' });
        },
        
        initFull: function(config) {
            if (!validateConfig(config)) return null;
            return new BeautifulFlowiseChat({ ...config, mode: 'fullscreen' });
        }
    };
})();