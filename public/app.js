// app.js - Integration with existing TypeScript API

// API endpoints to connect to the TypeScript backend
const API = {
    // User information
    USER: {
        GET_INFO: '/api/user',
    },
    // Token-related endpoints
    TOKENS: {
        GET_BALANCE: '/api/tokens/balance',
        GET_ALL: '/api/tokens/all',
        SEND: '/api/tokens/send',
        RECEIVE_CODE: '/api/tokens/receive-code',
    },
    // Advertisement-related endpoints
    ADVERTISEMENTS: {
        GET_FEED: '/api/advertisements',
        CREATE: '/api/advertisements/create',
    },
    // Peer-related endpoints
    PEERS: {
        GET_NEARBY: '/api/peers/nearby',
    }
};

// User data - will be fetched from API
let currentUser = {
    id: 'loading...',
};

// UI State management
const UI = {
    elements: {
        tokenBalance: document.getElementById('token-balance'),
        feedContainer: document.getElementById('feed-container'),
        feedLoading: document.getElementById('feed-loading'),
        peersContainer: document.getElementById('peers-container'),
        sendModal: document.getElementById('send-modal'),
        receiveModal: document.getElementById('receive-modal'),
        sendBtn: document.getElementById('send-btn'),
        receiveBtn: document.getElementById('receive-btn'),
        moreBtn: document.getElementById('more-btn'),
        recipientIdInput: document.getElementById('recipient-id'),
        tokenAmountInput: document.getElementById('token-amount'),
        sendConfirmBtn: document.getElementById('send-confirm'),
        sendCancelBtn: document.getElementById('send-cancel'),
        receiveCloseBtn: document.getElementById('receive-close'),
        userIdDisplay: document.getElementById('user-id-display'),
        modalUserIdDisplay: document.getElementById('modal-user-id'),
        receiveCodeContainer: document.getElementById('receive-code-container'),
    },
    
    initialize() {
        // Set up event listeners
        this.elements.sendBtn.addEventListener('click', () => this.showSendModal());
        this.elements.receiveBtn.addEventListener('click', () => this.showReceiveModal());
        this.elements.sendCancelBtn.addEventListener('click', () => this.hideSendModal());
        this.elements.receiveCloseBtn.addEventListener('click', () => this.hideReceiveModal());
        this.elements.sendConfirmBtn.addEventListener('click', () => this.handleSendTokens());
        
        // Load user data first, then all other data
        this.loadUserData().then(() => this.loadData());
    },
    
    async loadUserData() {
        try {
            const userData = await API_Client.getUserInfo();
            currentUser = userData;
            
            // Update displayed user ID
            if (this.elements.userIdDisplay) {
                this.elements.userIdDisplay.textContent = userData.id;
            }
            
            // Update modal user ID
            if (this.elements.modalUserIdDisplay) {
                this.elements.modalUserIdDisplay.textContent = userData.id;
            }
            
            // Update page title to include user ID
            document.title = `JuiceTokens - ${userData.id}`;
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },
    
    async loadData() {
        await Promise.all([
            this.loadTokenBalance(),
            this.loadAdvertisements(),
            this.loadNearbyPeers()
        ]);
    },
    
    async loadTokenBalance() {
        try {
            const balance = await API_Client.getTokenBalance();
            this.elements.tokenBalance.textContent = balance;
        } catch (error) {
            console.error('Error loading token balance:', error);
            this.elements.tokenBalance.textContent = 'Error';
        }
    },
    
    async loadAdvertisements() {
        try {
            const advertisements = await API_Client.getAdvertisements();
            this.renderAdvertisements(advertisements);
        } catch (error) {
            console.error('Error loading advertisements:', error);
            this.elements.feedContainer.innerHTML = '<div class="error">Failed to load advertisements</div>';
        } finally {
            this.elements.feedLoading.style.display = 'none';
        }
    },
    
    async loadNearbyPeers() {
        try {
            const peers = await API_Client.getNearbyPeers();
            this.renderPeers(peers);
        } catch (error) {
            console.error('Error loading peers:', error);
            this.elements.peersContainer.innerHTML = '<div>No peers found</div>';
        }
    },
    
    renderAdvertisements(advertisements) {
        this.elements.feedContainer.innerHTML = '';
        
        if (!advertisements || advertisements.length === 0) {
            this.elements.feedContainer.innerHTML = '<div>No advertisements available</div>';
            return;
        }
        
        advertisements.forEach(ad => {
            const adElement = document.createElement('div');
            adElement.className = 'advertisement';
            
            adElement.innerHTML = `
                <div class="advertisement-header">
                    <div class="advertisement-type">${ad.type}</div>
                    <div>${ad.creatorName || 'Unknown'}</div>
                </div>
                <div><strong>${ad.title}</strong></div>
                <div>${ad.description}</div>
                <div style="margin-top: 8px">
                    ${ad.tokenValue ? `Value: ${ad.tokenValue} tokens` : ''}
                </div>
            `;
            
            this.elements.feedContainer.appendChild(adElement);
        });
    },
    
    renderPeers(peers) {
        this.elements.peersContainer.innerHTML = '';
        
        if (!peers || peers.length === 0) {
            this.elements.peersContainer.innerHTML = '<div>No peers nearby</div>';
            return;
        }
        
        peers.forEach(peer => {
            const peerElement = document.createElement('span');
            peerElement.className = 'peer-bubble';
            peerElement.title = `Peer ${peer.id}`;
            this.elements.peersContainer.appendChild(peerElement);
        });
    },
    
    showSendModal() {
        this.elements.sendModal.style.display = 'flex';
    },
    
    hideSendModal() {
        this.elements.sendModal.style.display = 'none';
        this.elements.recipientIdInput.value = '';
        this.elements.tokenAmountInput.value = '10';
    },
    
    showReceiveModal() {
        this.elements.receiveModal.style.display = 'flex';
        this.loadReceiveCode();
    },
    
    hideReceiveModal() {
        this.elements.receiveModal.style.display = 'none';
    },
    
    async loadReceiveCode() {
        try {
            const receiveCode = await API_Client.getReceiveCode();
            
            // In a real implementation, this would generate a QR code
            // For now, just display the text code
            this.elements.receiveCodeContainer.innerHTML = `
                <div style="font-family: monospace; padding: 20px; background: #f5f5f5; border-radius: 4px;">
                    ${receiveCode}
                </div>
            `;
        } catch (error) {
            console.error('Error getting receive code:', error);
            this.elements.receiveCodeContainer.innerHTML = '<div class="error">Failed to generate receive code</div>';
        }
    },
    
    async handleSendTokens() {
        const recipientId = this.elements.recipientIdInput.value.trim();
        const amount = parseInt(this.elements.tokenAmountInput.value, 10);
        
        if (!recipientId) {
            alert('Please enter a recipient ID');
            return;
        }
        
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        try {
            const result = await API_Client.sendTokens(recipientId, amount);
            
            if (result.success) {
                alert('Tokens sent successfully!');
                this.hideSendModal();
                this.loadTokenBalance(); // Refresh the balance
            } else {
                alert(`Failed to send tokens: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error sending tokens:', error);
            alert('An error occurred while sending tokens');
        }
    }
};

// API Client - Interfaces with the TypeScript backend
const API_Client = {
    // Get user information
    async getUserInfo() {
        try {
            const response = await fetch(API.USER.GET_INFO);
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API error:', error);
            // Default user data
            return { id: 'unknown-user' };
        }
    },
    
    // Make API requests to the TypeScript backend
    async getTokenBalance() {
        try {
            const response = await fetch(API.TOKENS.GET_BALANCE);
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const data = await response.json();
            return data.balance;
        } catch (error) {
            console.error('API error:', error);
            // Mock data for development
            return 80;
        }
    },
    
    async getAdvertisements() {
        try {
            const response = await fetch(API.ADVERTISEMENTS.GET_FEED);
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const data = await response.json();
            return data.advertisements;
        } catch (error) {
            console.error('API error:', error);
            // Mock data for development
            return [
                {
                    type: "OFFER",
                    title: "Fresh vegetables from my garden",
                    description: "Organic tomatoes, lettuce, and carrots available weekly.",
                    creatorId: "user-432",
                    creatorName: "Alice",
                    tokenValue: 25
                },
                {
                    type: "REQUEST",
                    title: "Need help with garden work",
                    description: "Looking for someone to help with weeding and planting.",
                    creatorId: "user-876",
                    creatorName: "Bob",
                    tokenValue: 40
                }
            ];
        }
    },
    
    async getNearbyPeers() {
        try {
            const response = await fetch(API.PEERS.GET_NEARBY);
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const data = await response.json();
            return data.peers;
        } catch (error) {
            console.error('API error:', error);
            // Mock data for development
            return [
                { id: 'peer-1', distance: 10 },
                { id: 'peer-2', distance: 25 },
                { id: 'peer-3', distance: 50 }
            ];
        }
    },
    
    async sendTokens(recipientId, amount) {
        try {
            const response = await fetch(API.TOKENS.SEND, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recipientId, amount })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API error:', error);
            // Mock response for development
            return { success: true, transactionId: 'mock-tx-id' };
        }
    },
    
    async getReceiveCode() {
        try {
            const response = await fetch(API.TOKENS.RECEIVE_CODE);
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const data = await response.json();
            return data.code;
        } catch (error) {
            console.error('API error:', error);
            // Mock data for development
            return `RECEIVE-${currentUser.id}-${Date.now()}`;
        }
    }
};

// Initialize the UI
document.addEventListener('DOMContentLoaded', () => {
    UI.initialize();
});
