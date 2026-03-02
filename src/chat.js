/**
 * Beautiful Flowise Chat Widget v1.1.3
 * A modern, customizable alternative to Flowise embed
 */

(function() {
    'use strict';

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
        sendButtonText: '➤',
        showTimestamp: true,
        enableStreaming: true,
        enableMarkdown: true,
        debug: false,
        enableSoundNotification: false,
        avatar: '🤖'
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
            
            this.init();
        }

        init() {
            this.injectStyles();
            this.createWidget();
            this.attachEventListeners();
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
                        <button class="bf-minimize-btn" id="bf-minimize" aria-label="Minimize chat">−</button>
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
                        <a href="https://github.com/unknownfriend00007/beautiful-flowise-chat" target="_blank" class="bf-branding">
                            Powered by Beautiful Flowise Chat
                        </a>
                    </div>
                </div>
            `;

            document.body.appendChild(container);
        }

        attachEventListeners() {
            const toggleBtn = document.getElementById('bf-toggle-button');
            const minimizeBtn = document.getElementById('bf-minimize');
            const sendBtn = document.getElementById('bf-send');
            const input = document.getElementById('bf-input');

            toggleBtn.addEventListener('click', () => this.toggleChat());
            minimizeBtn.addEventListener('click', () => this.toggleChat());
            sendBtn.addEventListener('click', () => this.sendMessage());
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            });
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
            } else {
                chatWindow.style.display = 'none';
                openIcon.style.display = 'block';
                closeIcon.style.display = 'none';
            }
        }

        async sendMessage() {
            const input = document.getElementById('bf-input');
            const message = input.value.trim();
            
            if (!message) return;

            this.addMessage(message, 'user');
            input.value = '';
            input.style.height = 'auto';

            this.showTyping(true);

            try {
                // Try streaming first, then fallback to non-streaming
                await this.sendMessageWithoutStreaming(message);
            } catch (error) {
                console.error('Flowise API Error:', error);
                this.showTyping(false);
                this.addMessage('Sorry, something went wrong. Please try again.', 'bot', true);
            }
        }

        async sendMessageWithoutStreaming(message) {
            this.log('Sending message:', message);
            this.log('API Host:', this.apiHost);
            this.log('Chatflow ID:', this.chatflowid);

            const response = await fetch(`${this.apiHost}/api/v1/prediction/${this.chatflowid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: message,
                    history: this.conversationHistory
                })
            });

            this.log('Response status:', response.status);
            this.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                this.log('Error response:', errorText);
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            this.log('Response data:', data);
            
            this.showTyping(false);
            
            // Try different response fields from Flowise
            const botMessage = data.text || data.answer || data.response || data.output || 
                             (data.data && data.data.text) || 
                             JSON.stringify(data);
            
            this.log('Bot message extracted:', botMessage);
            this.addMessage(botMessage, 'bot');
            this.conversationHistory.push([message, botMessage]);
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

            // Code blocks (```code```)
            html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            
            // Inline code (`code`)
            html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
            
            // Bold (**text** or __text__)
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
            
            // Italic (*text* or _text_)
            html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
            html = html.replace(/_(.+?)_/g, '<em>$1</em>');
            
            // Links [text](url)
            html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
            
            // Numbered lists
            html = html.replace(/^(\d+\. .+)$/gm, '<li>$1</li>');
            html = html.replace(/(<li>\d+\. .+<\/li>\n?)+/g, '<ol>$&</ol>');
            html = html.replace(/<li>(\d+)\. (.+?)<\/li>/g, '<li>$2</li>');
            
            // Bullet lists (- or *)
            html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
            html = html.replace(/(<li>.+<\/li>\n?)+/g, (match) => {
                if (!match.includes('<ol>')) {
                    return '<ul>' + match + '</ul>';
                }
                return match;
            });
            
            // Headers (# text)
            html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
            html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
            html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
            
            // Line breaks
            html = html.replace(/\n\n/g, '</p><p>');
            html = html.replace(/\n/g, '<br>');
            html = '<p>' + html + '</p>';
            
            // Clean up
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

    window.BeautifulFlowiseChat = {
        init: function(config) {
            if (!config.chatflowid || !config.apiHost) {
                console.error('BeautifulFlowiseChat: chatflowid and apiHost are required');
                return;
            }
            return new BeautifulFlowiseChat(config);
        },
        initFull: function(config) {
            config.position = 'fullscreen';
            return this.init(config);
        }
    };

})();