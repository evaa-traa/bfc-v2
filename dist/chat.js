/* Beautiful Flowise Chat Widget Styles v1.1.2 */

window.BEAUTIFUL_FLOWISE_STYLES = `
:root {
    --bf-primary-color: #6366f1;
    --bf-primary-dark: #4f46e5;
    --bf-bg-color: #ffffff;
    --bf-text-color: #1f2937;
    --bf-text-secondary: #6b7280;
    --bf-border-color: #e5e7eb;
    --bf-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    --bf-radius: 16px;
}

.bf-container * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.bf-container {
    position: fixed;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.bf-bottom-right {
    bottom: 20px;
    right: 20px;
}

.bf-bottom-left {
    bottom: 20px;
    left: 20px;
}

.bf-chat-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--bf-primary-color), var(--bf-primary-dark));
    border: none;
    cursor: pointer;
    box-shadow: var(--bf-shadow);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.bf-chat-button:hover {
    transform: scale(1.1);
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
}

.bf-chat-button:active {
    transform: scale(0.95);
}

.bf-button-icon {
    width: 28px;
    height: 28px;
    color: white;
    stroke-width: 2;
    transition: transform 0.3s ease;
}

.bf-chat-window {
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 400px;
    max-width: calc(100vw - 40px);
    height: 600px;
    max-height: calc(100vh - 120px);
    background: var(--bf-bg-color);
    border-radius: var(--bf-radius);
    box-shadow: var(--bf-shadow);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.bf-header {
    background: linear-gradient(135deg, var(--bf-primary-color), var(--bf-primary-dark));
    color: white;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
}

.bf-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1;
}

.bf-header-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, transform 0.2s;
}

.bf-header-btn svg {
    width: 18px;
    height: 18px;
    stroke-width: 2;
}

.bf-header-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
}

.bf-header-btn:active {
    transform: translateY(0);
}

.bf-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
}

.bf-header-content {
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 1;
}

.bf-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    backdrop-filter: blur(10px);
}

.bf-header-text {
    flex: 1;
}

.bf-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 2px;
}

.bf-subtitle {
    font-size: 12px;
    opacity: 0.9;
    display: flex;
    align-items: center;
    gap: 6px;
}

.bf-subtitle::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #4ade80;
    border-radius: 50%;
    display: inline-block;
    animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

.bf-minimize-btn {
    background: rgba(255, 255, 255, 0.2);
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
    transition: background 0.2s;
    z-index: 1;
}

.bf-minimize-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

.bf-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.bf-messages::-webkit-scrollbar {
    width: 6px;
}

.bf-messages::-webkit-scrollbar-track {
    background: transparent;
}

.bf-messages::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.bf-messages::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.bf-message {
    display: flex;
    gap: 10px;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.bf-bot-message {
    align-self: flex-start;
}

.bf-user-message {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.bf-message-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--bf-primary-color), var(--bf-primary-dark));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
}

.bf-message-content {
    max-width: 75%;
    min-width: 60px;
}

.bf-message-text {
    background: white;
    padding: 12px 16px;
    border-radius: 16px;
    color: var(--bf-text-color);
    font-size: 14px;
    line-height: 1.6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    word-wrap: break-word;
    word-break: break-word;
}

/* Markdown formatting in bot messages */
.bf-container .bf-message-text p,
.bf-container .bf-message-text li {
    color: var(--bf-text-color);
    opacity: 1;
}

.bf-container .bf-message-text blockquote {
    margin: 8px 0;
    padding: 10px 12px;
    border-left: 3px solid var(--bf-border-color);
    background: #f9fafb;
    color: var(--bf-text-color);
}

.bf-bot-message .bf-message-text p {
    margin: 0 0 8px 0;
}

.bf-bot-message .bf-message-text p:last-child {
    margin-bottom: 0;
}

.bf-bot-message .bf-message-text strong {
    font-weight: 600;
    color: var(--bf-text-color);
}

.bf-bot-message .bf-message-text em {
    font-style: italic;
}

.bf-bot-message .bf-message-text code {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #be123c;
}

.bf-bot-message .bf-message-text pre {
    background: #1f2937;
    color: #f9fafb;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 8px 0;
}

.bf-bot-message .bf-message-text pre code {
    background: transparent;
    padding: 0;
    color: #f9fafb;
    font-size: 13px;
}

.bf-bot-message .bf-message-text ul,
.bf-bot-message .bf-message-text ol {
    margin: 8px 0;
    padding-left: 20px;
}

.bf-bot-message .bf-message-text li {
    margin: 4px 0;
}

.bf-bot-message .bf-message-text a {
    color: var(--bf-primary-color);
    text-decoration: none;
    border-bottom: 1px solid var(--bf-primary-color);
}

.bf-bot-message .bf-message-text a:hover {
    opacity: 0.8;
}

.bf-bot-message .bf-message-text h1,
.bf-bot-message .bf-message-text h2,
.bf-bot-message .bf-message-text h3 {
    margin: 12px 0 8px 0;
    font-weight: 600;
}

.bf-bot-message .bf-message-text h1 {
    font-size: 18px;
}

.bf-bot-message .bf-message-text h2 {
    font-size: 16px;
}

.bf-bot-message .bf-message-text h3 {
    font-size: 14px;
}

.bf-user-message .bf-message-text {
    background: linear-gradient(135deg, var(--bf-primary-color), var(--bf-primary-dark));
    color: #ffffff !important;
    box-shadow: 0 2px 12px rgba(99, 102, 241, 0.3);
}

.bf-message-time {
    font-size: 11px;
    color: var(--bf-text-secondary);
    margin-top: 4px;
    padding: 0 4px;
}

.bf-error .bf-message-text {
    background: #fee2e2;
    color: #991b1b;
}

.bf-streaming .bf-cursor {
    display: inline-block;
    animation: blink-cursor 1s step-end infinite;
    margin-left: 2px;
    color: var(--bf-primary-color);
    font-weight: bold;
}

@keyframes blink-cursor {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

.bf-typing {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 20px 10px;
}

.bf-typing-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--bf-primary-color), var(--bf-primary-dark));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.bf-typing-dots {
    background: white;
    padding: 12px 16px;
    border-radius: 16px;
    display: flex;
    gap: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.bf-typing-dots span {
    width: 8px;
    height: 8px;
    background: #cbd5e1;
    border-radius: 50%;
    animation: typing 1.4s ease-in-out infinite;
}

.bf-typing-dots span:nth-child(1) { animation-delay: 0s; }
.bf-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.bf-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-10px); opacity: 1; }
}

.bf-input-container {
    padding: 16px;
    background: white;
    border-top: 1px solid var(--bf-border-color);
    display: flex;
    gap: 10px;
    align-items: flex-end;
}

.bf-input {
    flex: 1;
    border: 2px solid var(--bf-border-color);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 14px;
    font-family: inherit;
    resize: none;
    outline: none;
    transition: border-color 0.2s;
    max-height: 120px;
    min-height: 44px;
    color: var(--bf-text-color);
}

.bf-input:focus {
    border-color: var(--bf-primary-color);
}

.bf-input:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    background: #f3f4f6;
}

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
    transition: transform 0.2s, box-shadow 0.2s;
    flex-shrink: 0;
}

.bf-send-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.bf-send-btn:active {
    transform: scale(0.95);
}

.bf-send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.bf-footer {
    padding: 8px;
    text-align: center;
    background: #f9fafb;
    border-top: 1px solid var(--bf-border-color);
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

.bf-human-check {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
    z-index: 20;
}

.bf-human-check-card {
    width: 100%;
    max-width: 360px;
    border-radius: 14px;
    border: 1px solid var(--bf-border-color);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
    padding: 18px;
}

.bf-human-check-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--bf-text-color);
}

.bf-human-check-subtitle {
    margin-top: 6px;
    font-size: 12px;
    color: var(--bf-text-secondary);
    line-height: 1.4;
}

.bf-human-check-widget {
    margin-top: 14px;
    display: flex;
    justify-content: center;
}

.bf-human-check-status {
    margin-top: 10px;
    font-size: 12px;
    color: var(--bf-text-secondary);
}

.bf-human-check-error {
    margin-top: 10px;
    font-size: 12px;
    color: #b91c1c;
}

@media (max-width: 480px) {
    .bf-chat-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 120px);
    }
}

/* PROFESSIONAL THEMES */

.bf-theme-cloudflare {
    --bf-primary-color: #f38020;
    --bf-primary-dark: #d96b0f;
}

.bf-theme-cloudflare .bf-header {
    background: linear-gradient(135deg, #f38020 0%, #f6821f 100%);
}

.bf-theme-intercom {
    --bf-primary-color: #1f8ded;
    --bf-primary-dark: #1273c5;
    --bf-radius: 12px;
}

.bf-theme-intercom .bf-header {
    background: #1f8ded;
}

.bf-theme-intercom .bf-header::before {
    display: none;
}

.bf-theme-gradient {
    --bf-primary-color: #667eea;
    --bf-primary-dark: #764ba2;
}

.bf-theme-gradient .bf-chat-window {
    background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
}

.bf-theme-glassmorphism .bf-chat-window {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.bf-theme-dark {
    --bf-bg-color: #1f2937;
    --bf-text-color: #f9fafb;
    --bf-text-secondary: #9ca3af;
    --bf-border-color: #374151;
}

.bf-theme-dark .bf-messages {
    background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
}

.bf-theme-dark .bf-message-text {
    background: #374151;
    color: #f9fafb;
}

.bf-theme-dark .bf-user-message .bf-message-text {
    background: linear-gradient(135deg, var(--bf-primary-color), var(--bf-primary-dark));
    color: white !important;
}

.bf-theme-dark .bf-input {
    background: #374151;
    color: #f9fafb;
    border-color: #4b5563;
}

.bf-theme-dark .bf-input:disabled {
    background: #374151;
}

.bf-theme-dark .bf-bot-message .bf-message-text code {
    background: #4b5563;
    color: #fbbf24;
}

.bf-theme-dark .bf-human-check {
    background: rgba(17, 24, 39, 0.9);
}

.bf-theme-dark .bf-human-check-card {
    background: rgba(31, 41, 55, 0.95);
    border-color: #374151;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.bf-theme-minimal {
    --bf-primary-color: #000000;
    --bf-primary-dark: #1f2937;
    --bf-radius: 8px;
}

.bf-theme-minimal .bf-header {
    background: #000000;
}

.bf-theme-minimal .bf-header::before {
    display: none;
}
`;


/**
 * Beautiful Flowise Chat Widget
 * Source version with captcha + short-lived token support
 */

(function() {
    'use strict';

    const TURNSTILE_CDN = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

    const defaults = {
        theme: 'modern',
        primaryColor: '#6366f1',
        position: 'bottom-right',
        width: '400px',
        height: '600px',
        title: 'AI Assistant',
        subtitle: 'Online',
        welcomeMessage: 'Hi! How can I help you today?',
        placeholder: 'Type your message...',
        sendButtonText: '>',
        showTimestamp: true,
        enableStreaming: true,
        enableMarkdown: true,
        debug: false,
        enableSoundNotification: false,
        avatar: 'AI',
        requestTimeout: 30000,
        captcha: null
    };

    class BeautifulFlowiseChat {
        constructor(config) {
            this.config = { ...defaults, ...config };
            this.chatflowid = config.chatflowid;
            this.apiHost = config.apiHost;
            this.conversationHistory = [];
            this.isOpen = false;
            this.isTyping = false;
            this.currentStreamingMessage = null;
            this.proxyAuthToken = null;
            this.proxyAuthInFlight = null;
            this.turnstileWidgetId = null;
            this.turnstileTokenPromise = null;
            this.turnstileTokenResolve = null;
            this.turnstileTokenReject = null;

            this.init();
        }

        init() {
            this.injectStyles();
            this.createWidget();
            this.attachEventListeners();
            this.initializeHumanCheck();
        }

        log(...args) {
            if (this.config.debug) {
                console.log('[BeautifulFlowise]', ...args);
            }
        }

        injectStyles() {
            if (document.getElementById('beautiful-flowise-styles')) return;

            const styleSheet = document.createElement('style');
            styleSheet.id = 'beautiful-flowise-styles';
            styleSheet.textContent = window.BEAUTIFUL_FLOWISE_STYLES || '';
            document.head.appendChild(styleSheet);
        }

        createWidget() {
            const container = document.createElement('div');
            container.id = 'beautiful-flowise-container';
            container.className = `bf-container bf-${this.config.position} bf-theme-${this.config.theme}`;
            container.style.setProperty('--bf-primary-color', this.config.primaryColor);

            container.innerHTML = `
                <button class="bf-chat-button" id="bf-toggle-button" aria-label="Open chat">
                    <svg class="bf-button-icon bf-button-open" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <svg class="bf-button-icon bf-button-close" style="display: none;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div class="bf-chat-window" id="bf-chat-window" style="display: none;">
                    <div class="bf-header">
                        <div class="bf-header-content">
                            <div class="bf-avatar">${this.config.avatar}</div>
                            <div class="bf-header-text">
                                <div class="bf-title">${this.config.title}</div>
                                <div class="bf-subtitle">${this.config.subtitle}</div>
                            </div>
                        </div>
                        <div class="bf-header-actions">
                            <button class="bf-header-btn" id="bf-new-chat" aria-label="New conversation" title="New conversation">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M3 6h18"></path>
                                    <path d="M8 6V4h8v2"></path>
                                    <path d="M6 6l1 16h10l1-16"></path>
                                </svg>
                            </button>
                            <button class="bf-minimize-btn" id="bf-minimize" aria-label="Minimize chat">-</button>
                        </div>
                    </div>

                    <div class="bf-messages" id="bf-messages">
                        ${this.config.welcomeMessage ? `
                        <div class="bf-message bf-bot-message">
                            <div class="bf-message-avatar">${this.config.avatar}</div>
                            <div class="bf-message-content">
                                <div class="bf-message-text">${this.formatMessage(this.config.welcomeMessage)}</div>
                                ${this.config.showTimestamp ? `<div class="bf-message-time">${this.getTimeString()}</div>` : ''}
                            </div>
                        </div>` : ''}
                    </div>

                    <div class="bf-human-check" id="bf-human-check">
                        <div class="bf-human-check-card">
                            <div class="bf-human-check-title">Verify you are human</div>
                            <div class="bf-human-check-subtitle">Complete the challenge to start chatting.</div>
                            <div class="bf-human-check-widget" id="bf-human-check-widget"></div>
                            <div class="bf-human-check-status" id="bf-human-check-status" style="display:none;"></div>
                            <div class="bf-human-check-error" id="bf-human-check-error" style="display:none;"></div>
                        </div>
                    </div>

                    <div class="bf-typing" id="bf-typing" style="display: none;">
                        <div class="bf-typing-avatar">${this.config.avatar}</div>
                        <div class="bf-typing-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>

                    <div class="bf-input-container">
                        <textarea
                            class="bf-input"
                            id="bf-input"
                            placeholder="${this.config.placeholder}"
                            rows="1"
                        ></textarea>
                        <button class="bf-send-btn" id="bf-send" aria-label="Send message">
                            ${this.config.sendButtonText}
                        </button>
                    </div>

                    <div class="bf-footer">
                        <a href="mailto:mail.rps.active@proton.me" class="bf-branding">
                            mail.rps.active@proton.me
                        </a>
                    </div>
                </div>
            `;

            document.body.appendChild(container);
        }

        attachEventListeners() {
            const toggleBtn = document.getElementById('bf-toggle-button');
            const minimizeBtn = document.getElementById('bf-minimize');
            const newChatBtn = document.getElementById('bf-new-chat');
            const sendBtn = document.getElementById('bf-send');
            const input = document.getElementById('bf-input');

            toggleBtn.addEventListener('click', () => this.toggleChat());
            minimizeBtn.addEventListener('click', () => this.toggleChat());
            if (newChatBtn) {
                newChatBtn.addEventListener('click', () => this.startNewConversation());
            }
            sendBtn.addEventListener('click', () => this.sendMessage());

            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    this.sendMessage();
                }
            });

            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            });
        }

        getWelcomeMarkup() {
            if (!this.config.welcomeMessage) return '';
            return `
                <div class="bf-message bf-bot-message">
                    <div class="bf-message-avatar">${this.config.avatar}</div>
                    <div class="bf-message-content">
                        <div class="bf-message-text">${this.formatMessage(this.config.welcomeMessage)}</div>
                        ${this.config.showTimestamp ? `<div class="bf-message-time">${this.getTimeString()}</div>` : ''}
                    </div>
                </div>`;
        }

        startNewConversation() {
            this.conversationHistory = [];
            this.currentStreamingMessage = null;
            this.showTyping(false);

            const messagesContainer = document.getElementById('bf-messages');
            if (messagesContainer) {
                messagesContainer.innerHTML = this.getWelcomeMarkup();
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            const overlay = document.getElementById('bf-human-check');
            const isOverlayVisible = overlay && overlay.style.display !== 'none';
            if (!isOverlayVisible) {
                const input = document.getElementById('bf-input');
                const sendBtn = document.getElementById('bf-send');
                if (input) input.disabled = false;
                if (sendBtn) sendBtn.disabled = false;
            }
        }

        toggleChat() {
            this.isOpen = !this.isOpen;
            const chatWindow = document.getElementById('bf-chat-window');
            const openIcon = document.querySelector('.bf-button-open');
            const closeIcon = document.querySelector('.bf-button-close');

            if (this.isOpen) {
                chatWindow.style.display = 'flex';
                openIcon.style.display = 'none';
                closeIcon.style.display = 'block';
                document.getElementById('bf-input').focus();
                this.maybeShowHumanCheck();
            } else {
                chatWindow.style.display = 'none';
                openIcon.style.display = 'block';
                closeIcon.style.display = 'none';
            }
        }

        async sendMessage() {
            const input = document.getElementById('bf-input');
            const sendBtn = document.getElementById('bf-send');
            const message = input.value.trim();

            if (!message) return;

            input.disabled = true;
            sendBtn.disabled = true;

            try {
                await this.ensureProxyAuth({ restoreUi: false });

                this.addMessage(message, 'user');
                input.value = '';
                input.style.height = 'auto';
                this.showTyping(true);

                await this.sendMessageWithoutStreaming(message, false);
            } catch (error) {
                console.error('Flowise API Error:', error);
                this.showTyping(false);
                this.addMessage('Sorry, something went wrong. Please try again.', 'bot', true);
            } finally {
                const overlay = document.getElementById('bf-human-check');
                const isOverlayVisible = overlay && overlay.style.display !== 'none';
                if (!isOverlayVisible) {
                    input.disabled = false;
                    sendBtn.disabled = false;
                }
            }
        }

        async sendMessageWithoutStreaming(message, retriedAfter401) {
            this.log('Sending message:', message);
            this.log('API Host:', this.apiHost);
            this.log('Chatflow ID:', this.chatflowid);

            const response = await this.fetchWithTimeout(`${this.apiHost}/api/v1/prediction/${this.chatflowid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getProxyAuthHeaders()
                },
                body: JSON.stringify({
                    question: message,
                    history: this.conversationHistory
                })
            }, this.config.requestTimeout);

            this.log('Response status:', response.status);

            if (response.status === 401 && this.isCaptchaEnabled() && this.proxyAuthToken && !retriedAfter401) {
                this.proxyAuthToken = null;
                this.resetTurnstile();
                await this.ensureProxyAuth({ restoreUi: false });
                return this.sendMessageWithoutStreaming(message, true);
            }

            if (!response.ok) {
                const errorText = await response.text();
                this.log('Error response:', errorText);
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            this.log('Response data:', data);

            this.showTyping(false);

            const botMessage = data.text || data.answer || data.response || data.output ||
                             (data.data && data.data.text) ||
                             JSON.stringify(data);

            this.log('Bot message extracted:', botMessage);
            this.addMessage(botMessage, 'bot');
            this.conversationHistory.push([message, botMessage]);
        }

        async fetchWithTimeout(url, options, timeoutMs) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs || 30000);

            try {
                return await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
            } finally {
                clearTimeout(timeout);
            }
        }

        getHumanCheckErrorMessage(error) {
            if (error && typeof error.message === 'string' && error.message.trim()) {
                return error.message.trim();
            }
            return 'Verification failed. Please try again.';
        }

        shouldAutoResetTurnstile(error) {
            const reason = error && typeof error.reason === 'string'
                ? error.reason.trim().toLowerCase()
                : '';

            // Configuration errors will not be fixed by retrying the captcha challenge.
            if (reason === 'invalid-hostname') {
                return false;
            }
            return true;
        }

        async createTokenEndpointError(response) {
            let message = '';
            let reason = '';

            try {
                const bodyText = await response.text();
                if (bodyText) {
                    try {
                        const payload = JSON.parse(bodyText);
                        if (payload && typeof payload === 'object') {
                            if (typeof payload.message === 'string') {
                                message = payload.message.trim();
                            } else if (typeof payload.error === 'string') {
                                message = payload.error.trim();
                            }
                            if (typeof payload.reason === 'string') {
                                reason = payload.reason.trim().toLowerCase();
                            }
                        }
                    } catch {
                        message = bodyText.trim();
                    }
                }
            } catch {
                // ignore read/parsing failures
            }

            const error = new Error(message || `Token endpoint failed: ${response.status}`);
            error.status = response.status;
            if (reason) {
                error.reason = reason;
            }
            return error;
        }

        isCaptchaEnabled() {
            return !!(
                this.config.captcha &&
                typeof this.config.captcha === 'object' &&
                (this.config.captcha.provider || 'turnstile').toLowerCase() === 'turnstile' &&
                typeof this.config.captcha.siteKey === 'string' &&
                this.config.captcha.siteKey.trim().length > 0
            );
        }

        getTokenEndpointUrl() {
            const endpoint = (this.config.captcha && this.config.captcha.tokenEndpoint) ? String(this.config.captcha.tokenEndpoint) : '/auth/chat-token';
            if (/^https?:\/\//i.test(endpoint)) return endpoint;
            const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            return `${this.apiHost}${normalized}`;
        }

        getProxyAuthHeaders() {
            if (!this.proxyAuthToken) return {};
            const headerName = (this.config.captcha && this.config.captcha.authHeaderName)
                ? String(this.config.captcha.authHeaderName)
                : 'Authorization';
            return { [headerName]: `Bearer ${this.proxyAuthToken}` };
        }

        setHumanCheckVisible(visible) {
            const overlay = document.getElementById('bf-human-check');
            if (!overlay) return;
            overlay.style.display = visible ? 'flex' : 'none';
        }

        setHumanCheckStatus(message) {
            const element = document.getElementById('bf-human-check-status');
            if (!element) return;
            const text = typeof message === 'string' ? message.trim() : '';
            if (!text) {
                element.style.display = 'none';
                element.textContent = '';
                return;
            }
            element.style.display = 'block';
            element.textContent = text;
        }

        setHumanCheckError(message) {
            const element = document.getElementById('bf-human-check-error');
            if (!element) return;
            const text = typeof message === 'string' ? message.trim() : '';
            if (!text) {
                element.style.display = 'none';
                element.textContent = '';
                return;
            }
            element.style.display = 'block';
            element.textContent = text;
        }

        initializeHumanCheck() {
            if (!this.isCaptchaEnabled()) {
                this.setHumanCheckVisible(false);
                return;
            }
            this.setHumanCheckVisible(false);
            this.setHumanCheckStatus('');
            this.setHumanCheckError('');
        }

        maybeShowHumanCheck() {
            if (!this.isCaptchaEnabled()) return;
            if (this.proxyAuthToken) return;

            this.setHumanCheckVisible(true);
            this.setHumanCheckStatus('');
            this.setHumanCheckError('');

            const autoStart = !(this.config.captcha && this.config.captcha.autoStart === false);
            if (autoStart) {
                this.ensureProxyAuth({ restoreUi: true }).catch((error) => {
                    this.log('Captcha flow failed:', error);
                    this.setHumanCheckError(this.getHumanCheckErrorMessage(error));
                });
            }
        }

        async loadTurnstile() {
            if (window.turnstile && typeof window.turnstile.render === 'function') {
                return;
            }

            const existingScript = document.getElementById('bf-turnstile-script');
            if (existingScript) {
                await new Promise((resolve, reject) => {
                    existingScript.addEventListener('load', resolve, { once: true });
                    existingScript.addEventListener('error', reject, { once: true });
                });
                return;
            }

            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.id = 'bf-turnstile-script';
                script.src = TURNSTILE_CDN;
                script.async = true;
                script.defer = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        resetTurnstile() {
            if (!window.turnstile || this.turnstileWidgetId === null) return;
            try {
                window.turnstile.reset(this.turnstileWidgetId);
            } catch {
                // ignore reset failures
            }
        }

        async renderTurnstileWidget() {
            if (!this.isCaptchaEnabled()) return;

            const widgetContainer = document.getElementById('bf-human-check-widget');
            if (!widgetContainer) throw new Error('Captcha container not found');

            await this.loadTurnstile();

            if (!window.turnstile || typeof window.turnstile.render !== 'function') {
                throw new Error('Turnstile failed to load');
            }

            if (this.turnstileWidgetId !== null) {
                this.resetTurnstile();
                return;
            }

            widgetContainer.innerHTML = '';
            this.turnstileWidgetId = window.turnstile.render(widgetContainer, {
                sitekey: this.config.captcha.siteKey.trim(),
                theme: this.config.captcha.theme || 'auto',
                size: this.config.captcha.size || 'normal',
                callback: (token) => {
                    if (this.turnstileTokenResolve) {
                        this.turnstileTokenResolve(token);
                        this.turnstileTokenResolve = null;
                        this.turnstileTokenReject = null;
                        this.turnstileTokenPromise = null;
                    }
                },
                'expired-callback': () => {
                    this.setHumanCheckError('Captcha expired. Please try again.');
                    this.resetTurnstile();
                },
                'error-callback': () => {
                    this.setHumanCheckError('Captcha error. Please try again.');
                    if (this.turnstileTokenReject) {
                        this.turnstileTokenReject(new Error('Captcha error'));
                        this.turnstileTokenResolve = null;
                        this.turnstileTokenReject = null;
                        this.turnstileTokenPromise = null;
                    }
                    this.resetTurnstile();
                }
            });
        }

        async waitForTurnstileToken() {
            if (this.turnstileTokenPromise) return this.turnstileTokenPromise;

            this.turnstileTokenPromise = new Promise((resolve, reject) => {
                this.turnstileTokenResolve = resolve;
                this.turnstileTokenReject = reject;
            });

            await this.renderTurnstileWidget();
            return this.turnstileTokenPromise;
        }

        async ensureProxyAuth(options) {
            if (!this.isCaptchaEnabled()) return;
            if (this.proxyAuthToken) return;

            const restoreUi = !(options && options.restoreUi === false);

            if (this.proxyAuthInFlight) {
                await this.proxyAuthInFlight;
                return;
            }

            this.proxyAuthInFlight = (async () => {
                this.setHumanCheckVisible(true);
                this.setHumanCheckStatus('');
                this.setHumanCheckError('');

                const captchaToken = await this.waitForTurnstileToken();
                this.setHumanCheckStatus('Verifying...');

                const payload = {
                    provider: 'turnstile',
                    captchaToken,
                    chatflowid: this.chatflowid
                };

                if (this.config.captcha && typeof this.config.captcha.siteId === 'string' && this.config.captcha.siteId.trim()) {
                    payload.siteId = this.config.captcha.siteId.trim();
                }

                const response = await this.fetchWithTimeout(this.getTokenEndpointUrl(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }, this.config.requestTimeout);

                if (!response.ok) {
                    throw await this.createTokenEndpointError(response);
                }

                const data = await response.json();
                const token = data && (data.token || data.accessToken || data.jwt || data.sessionToken);
                if (!token || typeof token !== 'string') {
                    throw new Error('Token endpoint returned invalid token');
                }

                this.proxyAuthToken = token;
                this.setHumanCheckVisible(false);
                this.setHumanCheckStatus('');
                this.setHumanCheckError('');

                if (restoreUi) {
                    const input = document.getElementById('bf-input');
                    const sendBtn = document.getElementById('bf-send');
                    if (input) input.disabled = false;
                    if (sendBtn) sendBtn.disabled = false;
                }
            })();

            try {
                await this.proxyAuthInFlight;
            } catch (error) {
                this.setHumanCheckStatus('');
                this.setHumanCheckError(this.getHumanCheckErrorMessage(error));
                if (this.shouldAutoResetTurnstile(error)) {
                    this.resetTurnstile();
                }
                throw error;
            } finally {
                this.proxyAuthInFlight = null;
            }
        }

        addMessage(text, sender, isError = false) {
            const messagesContainer = document.getElementById('bf-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `bf-message bf-${sender}-message ${isError ? 'bf-error' : ''}`;

            const formattedText = sender === 'bot' ? this.formatMessage(text) : this.escapeHtml(text);

            messageDiv.innerHTML = `
                ${sender === 'bot' ? `<div class="bf-message-avatar">${this.config.avatar}</div>` : ''}
                <div class="bf-message-content">
                    <div class="bf-message-text">${formattedText}</div>
                    ${this.config.showTimestamp ? `<div class="bf-message-time">${this.getTimeString()}</div>` : ''}
                </div>
            `;

            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        formatMessage(text) {
            if (!this.config.enableMarkdown) {
                return this.escapeHtml(text).replace(/\n/g, '<br>');
            }

            let html = this.escapeHtml(text);

            html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
            html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
            html = html.replace(/_(.+?)_/g, '<em>$1</em>');
            html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
            html = html.replace(/^(\d+\. .+)$/gm, '<li>$1</li>');
            html = html.replace(/(<li>\d+\. .+<\/li>\n?)+/g, '<ol>$&</ol>');
            html = html.replace(/<li>(\d+)\. (.+?)<\/li>/g, '<li>$2</li>');
            html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
            html = html.replace(/(<li>.+<\/li>\n?)+/g, (match) => {
                if (!match.includes('<ol>')) {
                    return '<ul>' + match + '</ul>';
                }
                return match;
            });
            html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
            html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
            html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
            html = html.replace(/\n\n/g, '</p><p>');
            html = html.replace(/\n/g, '<br>');
            html = '<p>' + html + '</p>';
            html = html.replace(/<p><\/p>/g, '');
            html = html.replace(/<p>(<[uo]l>)/g, '$1');
            html = html.replace(/(<\/[uo]l>)<\/p>/g, '$1');
            html = html.replace(/<p>(<pre>)/g, '$1');
            html = html.replace(/(<\/pre>)<\/p>/g, '$1');

            return html;
        }

        showTyping(show) {
            const typingIndicator = document.getElementById('bf-typing');
            typingIndicator.style.display = show ? 'flex' : 'none';

            if (show) {
                const messagesContainer = document.getElementById('bf-messages');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }

        getTimeString() {
            const now = new Date();
            return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
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
        if (config.captcha !== undefined && config.captcha !== null) {
            if (typeof config.captcha !== 'object') {
                console.error('BeautifulFlowiseChat: captcha must be an object');
                return false;
            }
            const provider = String(config.captcha.provider || 'turnstile').toLowerCase();
            if (provider !== 'turnstile') {
                console.error('BeautifulFlowiseChat: captcha.provider must be "turnstile"');
                return false;
            }
            if (!config.captcha.siteKey || typeof config.captcha.siteKey !== 'string') {
                console.error('BeautifulFlowiseChat: captcha.siteKey is required');
                return false;
            }
        }
        return true;
    }

    window.BeautifulFlowiseChat = {
        init: function(config) {
            if (!validateConfig(config)) {
                return null;
            }
            return new BeautifulFlowiseChat(config);
        },
        initFull: function(config) {
            config.position = 'fullscreen';
            return this.init(config);
        }
    };

})();
