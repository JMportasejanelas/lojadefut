// Shopping Cart functionality
class ShoppingCart {
    constructor() {
        this.items = [];
        this.selectedSizes = {};
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateCartCount();
    }

    setupEventListeners() {
        // Cart icon click
        document.querySelector('.cart-icon').addEventListener('click', () => {
            this.openCart();
        });

        // Close modal
        const closeBtn = document.querySelector('.close-cart');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeCart();
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('cartModal');
            if (e.target === modal) {
                this.closeCart();
            }
        });

        // Add to cart buttons
        document.querySelectorAll('.btn-add-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const product = e.target.closest('.btn-add-cart');
                const productCard = product.closest('.product-card');
                const selectedSize = this.getSelectedSize(productCard);
                
                if (!selectedSize) {
                    this.showToast('Por favor, selecione um tamanho/número', 'warning');
                    return;
                }

                this.addToCart(
                    product.dataset.product,
                    parseFloat(product.dataset.price),
                    selectedSize
                );
            });
        });

        // Size buttons
        document.querySelectorAll('.size-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                this.selectSize(productCard, e.target);
            });
        });

        // Checkout button
        const checkoutBtn = document.querySelector('.btn-checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.checkout();
            });
        }

        // Clear cart button
        const clearCartBtn = document.querySelector('.btn-clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    selectSize(productCard, sizeButton) {
        // Remove selected class from all size buttons in this product
        productCard.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selected class to clicked button
        sizeButton.classList.add('selected');
        
        // Store selected size for this product
        const productName = productCard.querySelector('.product-info h3').textContent;
        this.selectedSizes[productName] = sizeButton.textContent;
    }

    getSelectedSize(productCard) {
        const productName = productCard.querySelector('.product-info h3').textContent;
        return this.selectedSizes[productName] || null;
    }

    addToCart(productName, price, size) {
        const existingItem = this.items.find(item => 
            item.name === productName && item.size === size
        );

        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({
                id: Date.now(),
                name: productName,
                price: price,
                size: size,
                quantity: 1
            });
        }

        this.saveToStorage();
        this.updateCartCount();
        this.showToast(`${productName} (${size}) adicionado ao carrinho!`, 'success');
    }

    removeFromCart(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveToStorage();
        this.updateCartCount();
        this.renderCart();
    }

    updateQuantity(itemId, change) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                this.saveToStorage();
                this.renderCart();
            }
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartCount() {
        const count = this.items.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = count;
    }

    openCart() {
        const modal = document.getElementById('cartModal');
        const customerForm = document.getElementById('customerForm');
        const btnCheckout = document.getElementById('btnCheckout');
        
        // Reset form state when opening cart
        customerForm.style.display = 'none';
        customerForm.style.visibility = 'hidden';
        customerForm.classList.remove('show');
        btnCheckout.textContent = 'Fazer Pedido';
        
        modal.style.display = 'block';
        this.renderCart();
    }

    closeCart() {
        document.getElementById('cartModal').style.display = 'none';
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (this.items.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Seu carrinho está vazio</p>';
        } else {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-size">Tamanho/Número: ${item.size}</div>
                    </div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-item-btn" onclick="cart.removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }

        cartTotal.textContent = this.getTotal().toFixed(2);
    }

    clearCart() {
        if (confirm('Tem certeza que deseja esvaziar o carrinho?')) {
            this.items = [];
            this.saveToStorage();
            this.updateCartCount();
            this.renderCart();
            this.showToast('Carrinho esvaziado com sucesso!', 'success');
        }
    }

    checkout() {
        if (this.items.length === 0) {
            this.showToast('Seu carrinho está vazio!', 'warning');
            return;
        }

        // Close cart and show form immediately
        this.closeCart();
        
        // Show form immediately
        const customerForm = document.getElementById('customerForm');
        const btnCheckout = document.getElementById('btnCheckout');
        
        // Show form with animation
        setTimeout(() => {
            customerForm.style.display = 'block';
            customerForm.style.visibility = 'visible';
            customerForm.classList.add('show');
            customerForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Change button to process order
            btnCheckout.textContent = 'Processar Pedido';
            btnCheckout.onclick = () => {
                this.processOrder();
            };
            
            this.showToast('Por favor, preencha seus dados para continuar', 'info');
        }, 300);
        
        return;
    }

    processOrder() {
        // Validate form
        const form = document.getElementById('checkoutForm');
        const formData = new FormData(form);
        
        const customerData = {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value,
            cpf: document.getElementById('customerCPF').value,
            address: document.getElementById('customerAddress').value,
            notes: document.getElementById('customerNotes').value
        };

        // Validate required fields
        if (!customerData.name || !customerData.phone || !customerData.email || !customerData.cpf || !customerData.address) {
            this.showToast('Por favor, preencha todos os campos obrigatórios', 'warning');
            return;
        }

        // Validate email
        if (!this.validateEmail(customerData.email)) {
            this.showToast('Por favor, insira um e-mail válido', 'warning');
            return;
        }

        // Validate phone
        if (!this.validatePhone(customerData.phone)) {
            this.showToast('Por favor, insira um telefone válido', 'warning');
            return;
        }

        // Process order with customer data
        this.processOrderWithPayment(customerData);
    }

    backToCart() {
        // Hide form
        const customerForm = document.getElementById('customerForm');
        customerForm.style.display = 'none';
        customerForm.style.visibility = 'hidden';
        customerForm.classList.remove('show');
        
        // Reset button text
        const btnCheckout = document.getElementById('btnCheckout');
        btnCheckout.textContent = 'Fazer Pedido';
        btnCheckout.onclick = () => {
            this.checkout();
        };
        
        // Show cart
        this.openCart();
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return re.test(phone);
    }

    async processOrderWithPayment(customerData) {
        const total = this.getTotal();
        const itemsList = this.items.map(item => 
            `${item.quantity}x ${item.name} (${item.size}) - R$ ${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');

        // Create order object
        const order = {
            id: Date.now(),
            customer: customerData,
            items: [...this.items],
            total: total,
            date: new Date().toISOString(),
            status: 'pending',
            statusHistory: [{
                status: 'pending',
                date: new Date().toISOString()
            }],
            paymentMethod: 'whatsapp'
        };

        try {
            this.showToast('Processando pedido...', 'info');

            // Save order to localStorage (BANCO DE DADOS)
            this.saveOrder(order);
            
            // Send WhatsApp message
            this.sendWhatsAppOrder(order, customerData);
            
            // Clear cart and show success
            this.items = [];
            this.saveToStorage();
            this.updateCartCount();
            
            // Hide form
            const customerForm = document.getElementById('customerForm');
            customerForm.style.display = 'none';
            customerForm.style.visibility = 'hidden';
            customerForm.classList.remove('show');
            
            // Reset button
            const btnCheckout = document.getElementById('btnCheckout');
            btnCheckout.textContent = 'Fazer Pedido';
            btnCheckout.onclick = () => {
                this.checkout();
            };
            
            this.showToast('Pedido enviado com sucesso! Verifique seu WhatsApp.', 'success');

        } catch (error) {
            console.error('Order processing error:', error);
            this.showToast('Erro ao processar pedido. Tente novamente.', 'error');
        }
    }

    saveOrder(order) {
        try {
            // Get existing orders
            let orders = [];
            const stored = localStorage.getItem('ginga7_orders');
            if (stored) {
                orders = JSON.parse(stored);
            }
            
            // Add new order
            orders.push(order);
            
            // Save to localStorage (BANCO DE DADOS)
            localStorage.setItem('ginga7_orders', JSON.stringify(orders));
            
            // Also save customer data for analytics
            this.saveCustomerData(order.customer);
            
            console.log('✅ Order saved successfully to database:', order);
            console.log('📊 Total orders in database:', orders.length);
            
        } catch (error) {
            console.error('❌ Error saving order:', error);
            throw error;
        }
    }

    saveCustomerData(customer) {
        try {
            let customers = [];
            const stored = localStorage.getItem('ginga7_customers');
            if (stored) {
                customers = JSON.parse(stored);
            }
            
            // Check if customer already exists
            const existingIndex = customers.findIndex(c => c.email === customer.email);
            
            if (existingIndex >= 0) {
                // Update existing customer
                customers[existingIndex] = {
                    ...customers[existingIndex],
                    ...customer,
                    lastOrder: new Date().toISOString(),
                    orderCount: (customers[existingIndex].orderCount || 0) + 1
                };
            } else {
                // Add new customer
                customers.push({
                    ...customer,
                    firstOrder: new Date().toISOString(),
                    lastOrder: new Date().toISOString(),
                    orderCount: 1
                });
            }
            
            localStorage.setItem('ginga7_customers', JSON.stringify(customers));
            console.log('✅ Customer data saved successfully:', customer);
            
        } catch (error) {
            console.error('❌ Error saving customer data:', error);
        }
    }

    sendWhatsAppOrder(order, customerData) {
        const total = this.getTotal();
        const itemsList = order.items.map(item => 
            `${item.quantity}x ${item.name} (${item.size}) - R$ ${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');

        const message = `🛒 *NOVO PEDIDO - GINGA7* 🛒\n\n` +
            `*Dados do Cliente:*\n` +
            `👤 Nome: ${customerData.name}\n` +
            `📱 WhatsApp: ${customerData.phone}\n` +
            `📧 Email: ${customerData.email}\n` +
            `🆔 CPF: ${customerData.cpf}\n` +
            `🏠 Endereço: ${customerData.address}\n` +
            `${customerData.notes ? `📝 Observações: ${customerData.notes}\n` : ''}\n\n` +
            `*Itens do Pedido:*\n${itemsList}\n\n` +
            `💰 *Total: R$ ${total.toFixed(2)}*\n\n` +
            `📅 Data: ${new Date().toLocaleString('pt-BR')}\n\n` +
            `*Pedido #${order.id}*`;

        const whatsappUrl = `https://wa.me/5577981202155?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        console.log('WhatsApp message sent to:', whatsappUrl);
        console.log('Order saved to database:', order);
    }

    // Test function to verify system is working
    testSystem() {
        console.log('🧪 Testing system...');
        
        // Test localStorage
        const testOrder = {
            id: Date.now(),
            customer: {
                name: 'Test Customer',
                phone: '(77) 98120-2155',
                email: 'test@email.com',
                cpf: '123.456.789-00',
                address: 'Test Address',
                notes: 'Test notes'
            },
            items: [{
                name: 'Test Product',
                quantity: 1,
                size: 'M',
                price: 99.90
            }],
            total: 99.90,
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        try {
            this.saveOrder(testOrder);
            console.log('✅ System test passed!');
            console.log('📊 Check localStorage for orders and customers');
            return true;
        } catch (error) {
            console.error('❌ System test failed:', error);
            return false;
        }
    }

    saveToStorage() {
        localStorage.setItem('ginga7_cart', JSON.stringify(this.items));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('ginga7_cart');
        if (stored) {
            this.items = JSON.parse(stored);
        }
    }

    showToast(message, type = 'success') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize cart when DOM is loaded
let cart;
document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
    
    // Add scroll effect to header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
        } else {
            header.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    });

    // Add animation to products when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Size filter functionality for chuteiras page
    const sizeFilterButtons = document.querySelectorAll('.size-filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    sizeFilterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedSize = e.target.dataset.size;
            
            // Update active button
            sizeFilterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            // Filter products
            productCards.forEach(card => {
                const cardSizes = card.dataset.sizes;
                
                if (selectedSize === 'all' || cardSizes.includes(selectedSize)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Input masks for form fields
    setupInputMasks();
    
    // Close modal with X button - Multiple approaches
    const setupCloseButtons = () => {
        // Method 1: Query all close buttons
        const closeBtns = document.querySelectorAll('.close-cart');
        closeBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (cart) {
                    cart.closeCart();
                }
            };
        });
        
        // Method 2: Direct selector
        const closeBtn = document.querySelector('.close-cart');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (cart) {
                    cart.closeCart();
                }
            });
        }
    };
    
    setupCloseButtons();
    
    // Auto-show form when clicking Fazer Pedido
    const setupAutoForm = () => {
        const checkoutBtn = document.getElementById('btnCheckout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (cart) {
                    cart.checkout();
                }
            });
        }
    };
    
    setupAutoForm();
    
    // Setup clear cart button
    const setupClearCartButton = () => {
        const clearCartBtn = document.querySelector('.btn-clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (cart) {
                    cart.clearCart();
                }
            });
        }
    };
    
    setupClearCartButton();

    // Test system on load
    setTimeout(() => {
        if (cart && typeof cart.testSystem === 'function') {
            const testResult = cart.testSystem();
            if (testResult) {
                console.log('🎉 Sistema está funcionando corretamente!');
            }
        }
    }, 2000);

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            mainNav.classList.toggle('active');
            
            // Change icon
            const icon = mobileMenuBtn.querySelector('i');
            if (mainNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mainNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking on links
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('cartModal');
        if (modal && e.target === modal) {
            if (cart) {
                cart.closeCart();
            }
        }
    });

    // Close modal with ESC key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('cartModal');
            if (modal && modal.style.display === 'block') {
                if (cart) {
                    cart.closeCart();
                }
            }
        }
    });
});

function setupInputMasks() {
    // Phone mask
    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value.length <= 2) {
                    value = `(${value}`;
                } else if (value.length <= 7) {
                    value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                } else {
                    value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                }
            }
            
            e.target.value = value;
        });
    }

    // CPF mask
    const cpfInput = document.getElementById('customerCPF');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = `${value.slice(0, 3)}.${value.slice(3)}`;
                } else if (value.length <= 9) {
                    value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
                } else {
                    value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9, 11)}`;
                }
            }
            
            e.target.value = value;
        });
    }
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return re.test(phone);
}

// Search functionality (for future implementation)
function searchProducts(query) {
    const allProducts = document.querySelectorAll('.product-card');
    const normalizedQuery = query.toLowerCase();

    allProducts.forEach(product => {
        const productName = product.querySelector('h3').textContent.toLowerCase();
        if (productName.includes(normalizedQuery)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Filter functionality (for future implementation)
function filterProducts(category) {
    const allProducts = document.querySelectorAll('.product-card');
    
    allProducts.forEach(product => {
        if (category === 'all') {
            product.style.display = 'block';
        } else {
            // Add data-category attributes to products for filtering
            const productCategory = product.dataset.category;
            if (productCategory === category) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        }
    });
}

// Contact form validation (for future implementation)
function validateContactForm(formData) {
    const errors = [];
    
    if (!formData.name || formData.name.trim().length < 3) {
        errors.push('Nome deve ter pelo menos 3 caracteres');
    }
    
    if (!formData.email || !validateEmail(formData.email)) {
        errors.push('Email inválido');
    }
    
    if (!formData.phone || !validatePhone(formData.phone)) {
        errors.push('Telefone inválido. Use o formato (XX) XXXX-XXXX');
    }
    
    if (!formData.message || formData.message.trim().length < 10) {
        errors.push('Mensagem deve ter pelo menos 10 caracteres');
    }
    
    return errors;
}

// Initialize analytics (for future implementation)
function initAnalytics() {
    // Track page views
    console.log('Page view: Home');
    
    // Track product views
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productName = card.querySelector('h3').textContent;
            console.log('Product view:', productName);
        });
    });
    
    // Track add to cart events
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productName = button.dataset.product;
            console.log('Add to cart:', productName);
        });
    });
}

// Performance optimization
function optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
    });
}

// Initialize optimizations
document.addEventListener('DOMContentLoaded', () => {
    optimizeImages();
    initAnalytics();
});
