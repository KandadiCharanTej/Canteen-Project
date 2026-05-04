// State Management
const appState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    menu: [],
    categories: ['All', 'Snacks', 'Main Course', 'Drinks', 'Desserts'],
    activeCategory: 'All',
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    currentPage: 'menu',
    orders: [],
    slots: [],
    selectedSlot: null,
    searchQuery: '',
    
    save() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('token', this.token);
    },

    navigateTo(page) {
        this.currentPage = page;
        this.render();
        
        // Update nav UI
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const activeNav = document.getElementById(`nav-${page}`);
        if (activeNav) activeNav.classList.add('active');
        
        // Hide header on certain pages if needed
        const header = document.getElementById('mainHeader');
        if (page === 'admin' || page === 'profile' || page === 'orders') {
            header.style.display = 'none';
        } else {
            header.style.display = 'block';
        }
        
        window.scrollTo(0, 0);
    },

    render() {
        const content = document.getElementById('mainContent');
        if (this.currentPage === 'menu') appFunctions.renderMenu(content);
        else if (this.currentPage === 'cart') appFunctions.renderCart(content);
        else if (this.currentPage === 'orders') appFunctions.renderOrders(content);
        else if (this.currentPage === 'profile') appFunctions.renderProfile(content);
        else if (this.currentPage === 'admin') appFunctions.renderAdmin(content);
        
        this.updateCartBadge();
        this.checkAdminNav();
    },

    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        const count = this.cart.reduce((acc, item) => acc + item.quantity, 0);
        if (count > 0) {
            badge.innerText = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    },

    checkAdminNav() {
        const adminNav = document.getElementById('nav-admin');
        if (this.user && this.user.role === 'admin') {
            adminNav.style.display = 'flex';
        } else {
            adminNav.style.display = 'none';
        }
    }
};

// Functions
const appFunctions = {
    async init() {
        await this.fetchMenu();
        appState.render();
        
        // Background polling for orders if logged in
        setInterval(() => {
            if (appState.token && (appState.currentPage === 'orders' || appState.currentPage === 'admin')) {
                this.fetchOrders();
                if (appState.currentPage === 'admin') this.render();
            }
        }, 5000);
    },

    async fetchMenu() {
        try {
            const response = await fetch('/menu');
            appState.menu = await response.json();
        } catch (e) {
            this.showToast("Failed to load menu");
        }
    },

    async fetchOrders() {
        if (!appState.token) return;
        try {
            const response = await fetch('/orders', {
                headers: { 'Authorization': `Bearer ${appState.token}` }
            });
            appState.orders = await response.json();
        } catch (e) {}
    },

    async fetchSlots() {
        try {
            const response = await fetch('/slots');
            appState.slots = await response.json();
        } catch (e) {}
    },

    filterMenu() {
        appState.searchQuery = document.getElementById('searchInput').value.toLowerCase();
        appState.render();
    },

    setCategory(cat) {
        appState.activeCategory = cat;
        appState.render();
    },

    renderMenu(container) {
        let html = `
            <div class="categories-wrapper">
                ${appState.categories.map(cat => `
                    <div class="category-chip ${appState.activeCategory === cat ? 'active' : ''}" 
                         onclick="appFunctions.setCategory('${cat}')">${cat}</div>
                `).join('')}
            </div>
            <div class="menu-grid">
        `;

        const filtered = appState.menu.filter(item => {
            const matchCat = appState.activeCategory === 'All' || item.category === appState.activeCategory;
            const matchSearch = item.name.toLowerCase().includes(appState.searchQuery);
            return matchCat && matchSearch;
        });

        if (filtered.length === 0) {
            html += `<div class="empty-state">No items found</div>`;
        } else {
            filtered.forEach(item => {
                const cartItem = appState.cart.find(c => c.id === item.id);
                const quantity = cartItem ? cartItem.quantity : 0;
                
                // Determine availability badge
                let badgeClass = 'badge-instock';
                let badgeText = 'In Stock';
                if (item.available_quantity <= 0) {
                    badgeClass = 'badge-soldout';
                    badgeText = 'Sold Out';
                } else if (item.available_quantity < 10) {
                    badgeClass = 'badge-fewleft';
                    badgeText = 'Few left';
                }

                html += `
                    <div class="menu-card">
                        <div class="menu-img-container">
                            <img src="${item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}" alt="${item.name}">
                            <div class="availability-badge ${badgeClass}">${badgeText}</div>
                        </div>
                        <div class="menu-info">
                            <div>
                                <h3>${item.name}</h3>
                                <div class="menu-category">${item.category}</div>
                            </div>
                            <div class="menu-price-row">
                                <span class="price">₹${item.price}</span>
                                ${quantity > 0 ? `
                                    <div class="quantity-control">
                                        <button class="qty-btn" onclick="appFunctions.updateCart(${item.id}, -1)">-</button>
                                        <span class="qty-value">${quantity}</span>
                                        <button class="qty-btn" onclick="appFunctions.updateCart(${item.id}, 1)">+</button>
                                    </div>
                                ` : `
                                    <button class="add-btn" ${item.available_quantity <= 0 ? 'disabled' : ''} 
                                            onclick="appFunctions.addToCart(${item.id})">ADD</button>
                                `}
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        html += `</div>`;
        container.innerHTML = html;
    },

    addToCart(itemId) {
        if (!appState.token) {
            this.openAuthModal();
            return;
        }
        this.updateCart(itemId, 1);
        this.showToast("Added to cart");
    },

    updateCart(itemId, delta) {
        const item = appState.menu.find(i => i.id === itemId);
        const cartIndex = appState.cart.findIndex(c => c.id === itemId);
        
        if (cartIndex > -1) {
            appState.cart[cartIndex].quantity += delta;
            if (appState.cart[cartIndex].quantity <= 0) {
                appState.cart.splice(cartIndex, 1);
            }
        } else if (delta > 0) {
            appState.cart.push({ ...item, quantity: 1 });
        }
        
        appState.save();
        appState.render();
    },

    renderCart(container) {
        if (appState.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <ion-icon name="cart-outline"></ion-icon>
                    <h3>Your cart is empty</h3>
                    <p>Add some delicious food from the menu</p>
                    <button class="primary-btn" onclick="appState.navigateTo('menu')">Browse Menu</button>
                </div>
            `;
            return;
        }

        let html = `<h2 class="page-title">My Cart</h2>`;
        
        appState.cart.forEach(item => {
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">₹${item.price} x ${item.quantity}</div>
                    </div>
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="appFunctions.updateCart(${item.id}, -1)">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="appFunctions.updateCart(${item.id}, 1)">+</button>
                    </div>
                </div>
            `;
        });

        const subtotal = appState.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        html += `
            <div class="cart-summary">
                <div class="summary-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
                <div class="summary-row"><span>Taxes & Fees</span><span>₹0</span></div>
                <div class="summary-total"><span>Total</span><span>₹${subtotal}</span></div>
            </div>

            <div style="margin-top: 24px;">
                <h3 style="margin-bottom: 12px; font-size: 16px;">Select Pickup Time</h3>
                <div class="slot-grid" id="slotGrid">
                    <!-- Slots loaded via JS -->
                    <div class="empty-state">Loading slots...</div>
                </div>
            </div>

            <div style="margin-top: 24px; margin-bottom: 40px;">
                <h3 style="margin-bottom: 12px; font-size: 16px;">Payment Mode</h3>
                <div style="display: flex; gap: 12px;">
                    <label style="flex:1; border:1px solid var(--border); padding: 12px; border-radius: var(--radius-sm); display:flex; align-items:center; gap:8px;">
                        <input type="radio" name="payment" value="cash" checked> Cash
                    </label>
                    <label style="flex:1; border:1px solid var(--border); padding: 12px; border-radius: var(--radius-sm); display:flex; align-items:center; gap:8px;">
                        <input type="radio" name="payment" value="upi"> UPI (Manual)
                    </label>
                </div>
            </div>

            <button class="primary-btn" onclick="appFunctions.placeOrder()" id="placeOrderBtn">Place Order • ₹${subtotal}</button>
        `;

        container.innerHTML = html;
        this.loadSlots();
    },

    async loadSlots() {
        await this.fetchSlots();
        const grid = document.getElementById('slotGrid');
        if (!grid) return;

        grid.innerHTML = appState.slots.map(slot => {
            const isFull = slot.current_orders >= slot.max_orders;
            return `
                <button class="slot-btn ${isFull ? 'disabled' : ''} ${appState.selectedSlot === slot.slot_time ? 'active' : ''}" 
                        ${isFull ? 'disabled' : ''} 
                        onclick="appFunctions.selectSlot('${slot.slot_time}')">
                    ${slot.slot_time}
                    <div style="font-size: 9px; opacity: 0.7;">${isFull ? 'Full' : `${slot.max_orders - slot.current_orders} left`}</div>
                </button>
            `;
        }).join('');
    },

    selectSlot(time) {
        appState.selectedSlot = time;
        this.loadSlots();
    },

    async placeOrder() {
        if (!appState.selectedSlot) {
            this.showToast("Please select a time slot");
            return;
        }

        const btn = document.getElementById('placeOrderBtn');
        btn.disabled = true;
        btn.innerText = "Placing Order...";

        const orderData = {
            time_slot: appState.selectedSlot,
            items: appState.cart.map(i => ({ item_id: i.id, quantity: i.quantity })),
            payment_method: document.querySelector('input[name="payment"]:checked').value
        };

        try {
            const response = await fetch('/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${appState.token}`
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                appState.cart = [];
                appState.save();
                this.showToast("Order Placed Successfully!");
                appState.navigateTo('orders');
            } else {
                const err = await response.json();
                this.showToast(err.detail || "Order failed");
            }
        } catch (e) {
            this.showToast("Network error");
        } finally {
            btn.disabled = false;
        }
    },

    async renderOrders(container) {
        await this.fetchOrders();
        
        let html = `<h2 class="page-title">My Orders</h2>`;
        
        if (appState.orders.length === 0) {
            html += `
                <div class="empty-state">
                    <ion-icon name="receipt-outline"></ion-icon>
                    <h3>No orders yet</h3>
                    <p>When you order food, it will appear here</p>
                </div>
            `;
        } else {
            // Sort by ID desc
            const sorted = [...appState.orders].sort((a, b) => b.id - a.id);
            sorted.forEach(order => {
                html += `
                    <div class="order-card">
                        <div class="order-header">
                            <span class="order-id">Order #${order.id}</span>
                            <span class="order-status status-${order.status}">${order.status}</span>
                        </div>
                        <div style="font-size: 14px; margin-bottom: 8px;">
                            <strong>Pickup:</strong> ${order.time_slot}
                        </div>
                        <div class="order-otp">
                            <div style="font-size: 12px; margin-bottom: 4px; color: var(--text-muted);">Share this OTP at counter:</div>
                            <div class="otp-number">${order.otp}</div>
                        </div>
                    </div>
                `;
            });
        }
        
        container.innerHTML = html;
    },

    renderProfile(container) {
        if (!appState.user) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Welcome to CanteenFood</h3>
                    <p>Login to see your profile and history</p>
                    <button class="primary-btn" onclick="appFunctions.openAuthModal()">Login / Sign Up</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="text-align: center; margin-top: 20px;">
                <div style="font-size: 80px; color: var(--primary);"><ion-icon name="person-circle"></ion-icon></div>
                <h2 style="font-size: 24px; margin-top: 8px;">${appState.user.name}</h2>
                <p style="color: var(--text-muted);">${appState.user.contact} • ${appState.user.role}</p>
            </div>
            
            <div style="margin-top: 40px;">
                <button class="primary-btn" style="background: white; color: var(--text-main); border: 1px solid var(--border); box-shadow: none;" 
                        onclick="appFunctions.logout()">Logout</button>
            </div>
        `;
    },

    async renderAdmin(container) {
        if (!appState.user || appState.user.role !== 'admin') {
            appState.navigateTo('menu');
            return;
        }

        await this.fetchOrders();
        
        let html = `
            <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom: 24px;">
                <h2 class="page-title" style="margin-bottom:0;">Admin Dashboard</h2>
                <button class="add-btn" onclick="appFunctions.showToast('Add Item feature coming soon')">+ Add Item</button>
            </div>
        `;

        // Group orders by status or slot? Let's show all pending/preparing first
        const activeOrders = appState.orders.filter(o => o.status !== 'completed').sort((a,b) => a.id - b.id);
        
        html += `<div class="admin-section"><h3>Active Orders (${activeOrders.length})</h3></div>`;
        
        if (activeOrders.length === 0) {
            html += `<div class="empty-state">No active orders</div>`;
        } else {
            activeOrders.forEach(order => {
                html += `
                    <div class="admin-order-card">
                        <div class="order-header">
                            <div>
                                <strong>Order #${order.id}</strong>
                                <div style="font-size: 12px; color: var(--text-muted);">${order.time_slot}</div>
                            </div>
                            <span class="order-status status-${order.status}">${order.status}</span>
                        </div>
                        <div style="margin: 12px 0;">
                            <strong>OTP:</strong> <span style="font-family: monospace; font-size: 18px; color: var(--primary); font-weight: bold;">${order.otp}</span>
                        </div>
                        <div class="admin-actions">
                            ${order.status === 'pending' ? `
                                <button class="admin-btn btn-prepare" onclick="appFunctions.updateOrderStatus(${order.id}, 'preparing')">Prepare</button>
                            ` : ''}
                            ${order.status === 'preparing' ? `
                                <button class="admin-btn btn-ready" onclick="appFunctions.updateOrderStatus(${order.id}, 'ready')">Mark Ready</button>
                            ` : ''}
                            ${order.status === 'ready' ? `
                                <button class="admin-btn btn-complete" onclick="appFunctions.promptOTP(${order.id}, '${order.otp}')">Verify OTP</button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    },

    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${appState.token}`
                },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                this.showToast(`Order updated to ${status}`);
                this.renderAdmin(document.getElementById('mainContent'));
            }
        } catch (e) {}
    },

    promptOTP(orderId, correctOtp) {
        const input = prompt("Enter the 4-digit OTP shown by student:");
        if (input === correctOtp) {
            this.updateOrderStatus(orderId, 'completed');
            this.showToast("OTP Verified! Order Completed.");
        } else if (input !== null) {
            this.showToast("Invalid OTP. Please check again.");
        }
    },

    // Auth
    openAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
    },
    closeAuthModal() {
        document.getElementById('authModal').style.display = 'none';
    },
    switchAuthTab(tab) {
        document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
        document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
        document.getElementById('loginForm').classList.toggle('active', tab === 'login');
        document.getElementById('signupForm').classList.toggle('active', tab === 'signup');
    },

    async handleLogin(e) {
        e.preventDefault();
        const contact = document.getElementById('loginPhone').value;
        const password = document.getElementById('loginPassword').value;

        const formData = new FormData();
        formData.append('username', contact);
        formData.append('password', password);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                appState.token = data.access_token;
                // For demo, we don't have a /me endpoint, so we store basic info or fetch it.
                // In a real app, you'd fetch user details here. 
                // Let's assume the token is the contact for simplicity in this MVP.
                appState.user = { name: "User", contact: contact, role: "student" };
                
                // Check if admin (hardcoded logic for demo or based on response)
                if (contact.includes('admin')) appState.user.role = 'admin';

                appState.save();
                this.closeAuthModal();
                this.showToast("Welcome back!");
                appState.render();
            } else {
                this.showToast("Invalid phone or password");
            }
        } catch (e) {
            this.showToast("Login failed");
        }
    },

    async handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const contact = document.getElementById('signupPhone').value;
        const role = document.getElementById('signupRole').value;
        const password = document.getElementById('signupPassword').value;

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, contact, role, password })
            });

            if (response.ok) {
                this.showToast("Signup successful! Please login.");
                this.switchAuthTab('login');
            } else {
                const err = await response.json();
                this.showToast(err.detail || "Signup failed");
            }
        } catch (e) {
            this.showToast("Signup failed");
        }
    },

    logout() {
        appState.user = null;
        appState.token = null;
        appState.cart = [];
        appState.save();
        this.showToast("Logged out");
        appState.navigateTo('menu');
    },

    showToast(msg) {
        const toast = document.getElementById('toast');
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => appFunctions.init());
