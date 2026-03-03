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
            this.storageKey = `bfc_session_${this.chatflowid}`;
            this.chatId = null;
            this.sessionId = null;
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
            this.loadSessionFromStorage();
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
                            Powered by RPS
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

        generateId() {
            if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                return crypto.randomUUID();
            }
            return `sid-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
        }

        loadSessionFromStorage() {
            try {
                const stored = localStorage.getItem(this.storageKey);
                if (!stored) {
                    this.sessionId = this.generateId();
                    return;
                }

                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === 'object') {
                    if (typeof parsed.chatId === 'string' && parsed.chatId.trim()) {
                        this.chatId = parsed.chatId.trim();
                    }
                    if (typeof parsed.sessionId === 'string' && parsed.sessionId.trim()) {
                        this.sessionId = parsed.sessionId.trim();
                    }
                }
            } catch {
                this.chatId = null;
            }

            if (!this.sessionId) {
                this.sessionId = this.generateId();
            }
            this.saveSessionToStorage();
        }

        saveSessionToStorage() {
            try {
                const payload = {
                    chatId: this.chatId,
                    sessionId: this.sessionId
                };
                localStorage.setItem(this.storageKey, JSON.stringify(payload));
            } catch {
                // Ignore storage errors (private mode or blocked storage).
            }
        }

        clearSessionStorage() {
            try {
                localStorage.removeItem(this.storageKey);
            } catch {
                // Ignore storage errors.
            }
        }

        getWelcomeMarkup() {
            if (!this.config.welcomeMessage) return '';
            return `
                <div class="bf-message bf-bot-message">
                    <div class="bf-message-content">
                        <div class="bf-message-text">${this.formatMessage(this.config.welcomeMessage)}</div>
                        ${this.config.showTimestamp ? `<div class="bf-message-time">${this.getTimeString()}</div>` : ''}
                    </div>
                </div>`;
        }

        startNewConversation() {
            this.conversationHistory = [];
            this.chatId = null;
            this.sessionId = this.generateId();
            this.clearSessionStorage();
            this.saveSessionToStorage();
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
            this.log('Session ID:', this.sessionId);
            this.log('Chat ID:', this.chatId || 'none');

            const requestBody = {
                question: message,
                history: this.conversationHistory
            };

            if (this.chatId) {
                requestBody.chatId = this.chatId;
            }

            const baseOverride = (this.config.overrideConfig && typeof this.config.overrideConfig === 'object')
                ? { ...this.config.overrideConfig }
                : {};
            requestBody.overrideConfig = {
                ...baseOverride,
                sessionId: this.sessionId
            };

            const response = await this.fetchWithTimeout(`${this.apiHost}/api/v1/prediction/${this.chatflowid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getProxyAuthHeaders()
                },
                body: JSON.stringify(requestBody)
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

            if (data && typeof data.chatId === 'string' && data.chatId.trim()) {
                if (data.chatId !== this.chatId) {
                    this.chatId = data.chatId.trim();
                    this.saveSessionToStorage();
                    this.log('Chat ID assigned:', this.chatId);
                }
            }

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

            const contentDiv = document.createElement('div');
            contentDiv.className = 'bf-message-content';

            const textDiv = document.createElement('div');
            textDiv.className = 'bf-message-text';

            if (sender === 'bot') {
                // Bot responses can include markdown. Render with a strict allowlist sanitizer to avoid DOM XSS.
                textDiv.innerHTML = this.formatMessage(text);
            } else {
                // User messages must be treated as plain text.
                textDiv.textContent = text;
            }

            contentDiv.appendChild(textDiv);

            if (this.config.showTimestamp) {
                const timeDiv = document.createElement('div');
                timeDiv.className = 'bf-message-time';
                timeDiv.textContent = this.getTimeString();
                contentDiv.appendChild(timeDiv);
            }

            messageDiv.appendChild(contentDiv);

            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        decodeHtmlEntities(text) {
            const value = typeof text === 'string' ? text : '';
            const textarea = document.createElement('textarea');
            textarea.innerHTML = value;
            return textarea.value;
        }

        escapeHtmlAttribute(text) {
            return String(text || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        sanitizeUrl(rawUrl) {
            if (typeof rawUrl !== 'string') return null;
            const trimmed = rawUrl.trim();
            if (!trimmed) return null;

            // Normalize away control chars + whitespace to prevent scheme smuggling (e.g. "java\tscript:").
            const normalized = trimmed.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase();

            // Allow safe same-page / relative links.
            if (normalized.startsWith('#') || normalized.startsWith('?') || normalized.startsWith('/')) {
                // Block protocol-relative and backslash variants.
                if (normalized.startsWith('//') || normalized.startsWith('/\\') || normalized.startsWith('\\')) return null;
                return trimmed;
            }

            try {
                const parsed = new URL(trimmed, window.location.origin);
                const protocol = String(parsed.protocol || '').toLowerCase();
                if (protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:' || protocol === 'tel:') {
                    return parsed.href;
                }
            } catch {
                // ignore
            }

            return null;
        }

        unwrapElement(element) {
            const parent = element && element.parentNode;
            if (!parent) return;
            while (element.firstChild) {
                parent.insertBefore(element.firstChild, element);
            }
            parent.removeChild(element);
        }

        sanitizeFormattedHtml(html) {
            const template = document.createElement('template');
            template.innerHTML = String(html || '');

            const allowedTags = new Set([
                'A',
                'BR',
                'CODE',
                'EM',
                'H1',
                'H2',
                'H3',
                'LI',
                'OL',
                'P',
                'PRE',
                'STRONG',
                'UL'
            ]);

            const elements = [];
            const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT, null);
            while (walker.nextNode()) {
                elements.push(walker.currentNode);
            }

            // Process deep-to-shallow to make unwrap operations predictable.
            for (let i = elements.length - 1; i >= 0; i -= 1) {
                const el = elements[i];
                const tag = el.tagName;

                if (!allowedTags.has(tag)) {
                    this.unwrapElement(el);
                    continue;
                }

                const rawHref = tag === 'A' ? el.getAttribute('href') : null;

                // Strip all attributes first (including event handlers, styles, etc).
                for (const attr of Array.from(el.attributes)) {
                    el.removeAttribute(attr.name);
                }

                if (tag === 'A') {
                    const safeHref = this.sanitizeUrl(rawHref || '');
                    if (!safeHref) {
                        this.unwrapElement(el);
                        continue;
                    }
                    el.setAttribute('href', safeHref);
                    el.setAttribute('target', '_blank');
                    el.setAttribute('rel', 'noopener noreferrer nofollow');
                }
            }

            return template.innerHTML;
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
            html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, rawUrl) => {
                const decodedUrl = this.decodeHtmlEntities(rawUrl);
                const safeHref = this.sanitizeUrl(decodedUrl);
                if (!safeHref) return String(linkText || '');
                return `<a href="${this.escapeHtmlAttribute(safeHref)}" target="_blank" rel="noopener noreferrer nofollow">${linkText}</a>`;
            });
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

            return this.sanitizeFormattedHtml(html);
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
