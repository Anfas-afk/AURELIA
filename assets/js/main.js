// Initialize AOS
AOS.init({
    duration: 1000,
    easing: 'ease-out-quart',
    once: true,
    offset: 100
});

// --- Product Data Database ---
const products = [
    {
        id: 1,
        name: "Lune Chair",
        price: 1250,
        image: "assets/images/chair-1.png",
        description: "The Lune Chair features a sculptural silhouette wrapped in premium boucle fabric. Its organic curves provide exceptional comfort while making a bold artistic statement in any living space. Handcrafted with a solid wood frame.",
        category: "Seating"
    },
    {
        id: 2,
        name: "Onyx Table",
        price: 3400,
        image: "assets/images/table-1.png",
        description: "Carved from a single block of Nero Marquina marble, the Onyx Table is a study in monolithic beauty. Finished with brushed brass detailing, it serves as a commanding centerpiece for the modern lounge.",
        category: "Tables"
    },
    {
        id: 3,
        name: "The Sovereign Sofa",
        price: 5800,
        image: "assets/images/hero-sofa.png",
        description: "Our flagship seating piece, the Sovereign Sofa, combines deep-buttoned velvet upholstery with a kiln-dried hardwood frame. It offers an unparalleled seating experience, designed to age gracefully over decades.",
        category: "Seating"
    },
    {
        id: 4,
        name: "Ethereal Lounge",
        price: 2100,
        image: "assets/images/chair-1.png",
        description: "A perfect blend of form and function, the Ethereal Lounge chair offers a floating sensation with its ergonomic design. Upholstered in Italian leather or custom fabric options.",
        category: "Seating"
    },
    {
        id: 5,
        name: "Obsidian Console",
        price: 4200,
        image: "assets/images/table-1.png",
        description: "Sleek, dark, and mysterious. The Obsidian Console features a high-gloss lacquer finish and geometric legs, perfect for entryways or as a media unit in a minimalist home.",
        category: "Tables"
    },
    {
        id: 6,
        name: "Velvet Sectional",
        price: 7500,
        image: "assets/images/hero-sofa.png",
        description: "Modular luxury. The Velvet Sectional allows for endless configurations. Featuring down-filled cushions and stain-resistant velvet for everyday elegance.",
        category: "Seating"
    }
];

// --- Cart Logic ---
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('aurelia_cart')) || [];
        this.init();
    }

    init() {
        this.injectCartHTML();
        this.updateBadge();
        this.bindEvents();
        this.render();
    }

    injectCartHTML() {
        const cartHTML = `
            <div class="cart-overlay-bg"></div>
            <div class="cart-sidebar">
                <div class="cart-header">
                    <h3>Your Selection</h3>
                    <div class="close-cart">&times;</div>
                </div>
                <div class="cart-items">
                    <!-- Items injected here -->
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total</span>
                        <span id="cart-total-price">$0</span>
                    </div>
                    <a href="checkout.html" class="btn btn-primary" style="width: 100%; text-align: center;">Proceed to Checkout</a>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', cartHTML);
    }

    bindEvents() {
        this.sidebar = document.querySelector('.cart-sidebar');
        this.overlay = document.querySelector('.cart-overlay-bg');

        // Toggle Open
        const cartTriggers = document.querySelectorAll('.cart-icon, .view-cart-trigger');
        cartTriggers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        });

        // Close
        document.querySelector('.close-cart').addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());

        // Remove Items Delegation
        document.querySelector('.cart-items').addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-item-remove')) {
                const id = parseInt(e.target.dataset.id);
                this.remove(id);
            }
        });
    }

    open() {
        this.sidebar.classList.add('open');
        this.overlay.classList.add('open');
    }

    close() {
        this.sidebar.classList.remove('open');
        this.overlay.classList.remove('open');
    }

    add(productId) {
        const existing = this.items.find(i => i.id === productId);
        if (existing) {
            existing.qty++;
        } else {
            this.items.push({ id: productId, qty: 1 });
        }
        this.save();
        this.render();
        this.open();
    }

    remove(productId) {
        this.items = this.items.filter(i => i.id !== productId);
        this.save();
        this.render();
    }

    save() {
        localStorage.setItem('aurelia_cart', JSON.stringify(this.items));
        this.updateBadge();
    }

    updateBadge() {
        const count = this.items.reduce((sum, item) => sum + item.qty, 0);
        const cartBadges = document.querySelectorAll('.cart-badge');
        cartBadges.forEach(badge => {
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    }

    render() {
        const container = document.querySelector('.cart-items');
        if (!container) return; // Guard

        container.innerHTML = '';
        let total = 0;

        if (this.items.length === 0) {
            container.innerHTML = '<p class="text-center" style="opacity: 0.5; text-align: center; margin-top: 2rem;">Your cart is empty.</p>';
        } else {
            this.items.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    total += product.price * item.qty;
                    container.innerHTML += `
                        <div class="cart-item">
                            <img src="${product.image}" class="cart-item-img" alt="${product.name}">
                            <div class="cart-item-info">
                                <div class="cart-item-title">${product.name}</div>
                                <div class="cart-item-price">$${product.price.toLocaleString()} x ${item.qty}</div>
                                <div class="cart-item-remove" data-id="${product.id}">Remove</div>
                            </div>
                        </div>
                    `;
                }
            });
        }

        const totalEl = document.getElementById('cart-total-price');
        if (totalEl) totalEl.textContent = '$' + total.toLocaleString();
    }
}

// Instantiate Cart
const cart = new Cart();


// --- Page Specific Logic ---

// 1. Product Details Page Renderer
if (window.location.pathname.includes('product.html')) {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const product = products.find(p => p.id === id);

    if (product) {
        document.title = `${product.name} | AURELIA`;
        document.getElementById('pd-img').src = product.image;
        document.getElementById('pd-title').textContent = product.name;
        document.getElementById('pd-price').textContent = `$${product.price.toLocaleString()}`;
        document.getElementById('pd-desc').textContent = product.description;

        // Add to Cart Button Logic
        document.getElementById('add-to-cart-btn').addEventListener('click', () => {
            cart.add(product.id);
        });

        // Buy Now Button Logic (WhatsApp)
        document.getElementById('buy-now-btn').addEventListener('click', () => {
            const phoneNumber = "918590468094";
            // Use the current page URL (which includes the product ID)
            const productUrl = window.location.href;

            // Formatting: URL on its own line helps WhatsApp recognize it
            const text = `*New Purchase Inquiry*%0A%0A*Product:* ${product.name}%0A*Price:* $${product.price}%0A%0A*View Product:*%0A${productUrl}%0A%0AI am interested in buying this product. Please share more details.`;

            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${text}`;
            window.open(whatsappUrl, '_blank');
        });
    } else {
        const grid = document.querySelector('.product-detail-grid');
        if (grid) grid.innerHTML = '<h2>Product not found</h2>';
    }
}

// 2. Shop Page Rendering & Filtering
const productGrid = document.getElementById('product-grid');
if (productGrid) {

    function renderProducts(category = 'All') {
        productGrid.innerHTML = '';

        const filtered = category === 'All'
            ? products
            : products.filter(p => p.category === category);

        if (filtered.length === 0) {
            productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.5;">No products found in this category.</p>';
            return;
        }

        filtered.forEach((product, index) => {
            // Calculate delay for AOS stagger
            const delay = (index + 1) * 100;

            const html = `
                <a href="product.html?id=${product.id}" class="product-card" data-aos="fade-up" data-aos-delay="${delay}">
                    <div class="product-img-wrapper">
                        <img src="${product.image}" alt="${product.name}" class="product-img">
                        <div class="product-overlay">
                            <button class="btn-quick-view">View Details</button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price">$${product.price.toLocaleString()}</p>
                    </div>
                </a>
            `;
            productGrid.innerHTML += html;
        });
    }

    // Initial Render
    renderProducts('All');

    // Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');
            // Filter
            renderProducts(btn.textContent.trim());
        });
    });
}


// --- Custom Cursor (Existing) ---
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

if (cursorDot && cursorOutline) {
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Delegation for hover effects to handle dynamic elements
    document.addEventListener('mouseover', (e) => {
        if (e.target.matches('a, button, .menu-toggle, input, .product-card, .product-card *')) {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorOutline.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.matches('a, button, .menu-toggle, input, .product-card, .product-card *')) {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.backgroundColor = 'transparent';
        }
    });
}

// --- Mobile Menu (Existing) ---
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        body.classList.toggle('menu-open');
        menuToggle.textContent = navMenu.classList.contains('active') ? 'Close' : 'Menu';
    });
}

// --- Header Scroll (Existing) ---
const header = document.querySelector('.header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}
