const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

function scrollToSection(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

document.querySelector('.hero-btn')?.addEventListener('click', () => {
    scrollToSection('shop');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const category = link.dataset.category;
        if (category) {
            const tab = document.querySelector(`.tab[data-tab="${category}"]`);
            tab?.click();
        }
        scrollToSection('shop');
    });
});

document.querySelectorAll('[data-category-shortcut]').forEach(button => {
    button.addEventListener('click', () => {
        const tab = document.querySelector(`.tab[data-tab="${button.dataset.categoryShortcut}"]`);
        tab?.click();
        scrollToSection('shop');
    });
});

document.querySelectorAll('.topbar .links span').forEach(item => {
    item.addEventListener('click', () => {
        const target = item.dataset.scroll;
        if (target === 'newsletter') {
            scrollToSection('newsletter');
        } else {
            scrollToSection('shop');
        }
    });
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        tabs.forEach(item => item.classList.toggle('active', item === tab));
        panels.forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === target);
        });
    });
});

const defaultProducts = [
    { id: 1, name: 'سماعة رأس لاسلكية', category: 'electronics', price: 1499, images: ['images/category-electronics.svg'] },
    { id: 2, name: 'سماعة بلوتوث صغيرة', category: 'electronics', price: 890, images: ['images/category-electronics.svg'] },
    { id: 3, name: 'مصباح جانبي أنيق', category: 'home', price: 720, images: ['images/category-home.svg'] },
    { id: 4, name: 'منظم منزلي متعدد الاستخدام', category: 'home', price: 450, images: ['images/category-home.svg'] },
    { id: 5, name: 'مجموعة عناية يومية', category: 'beauty', price: 690, images: ['images/category-beauty.svg'] },
    { id: 6, name: 'عطر يومي راقٍ', category: 'beauty', price: 1150, images: ['images/category-beauty.svg'] },
    { id: 7, name: 'حذاء رياضي للمشي', category: 'sports', price: 1290, images: ['images/category-sports.svg'] },
    { id: 8, name: 'زجاجة ماء حرارية', category: 'sports', price: 320, images: ['images/category-sports.svg'] },
    { id: 9, name: 'هودي قطني يومي', category: 'men', price: 980, images: ['images/category-fashion.svg'] },
    { id: 10, name: 'جاكيت خفيف كلاسيكي', category: 'women', price: 1250, images: ['images/category-fashion.svg'] },
    { id: 11, name: 'حقيبة ظهر للأطفال', category: 'kids', price: 580, images: ['images/category-kids.svg'] },
    { id: 12, name: 'مكعبات تركيب ملونة', category: 'kids', price: 430, images: ['images/category-kids.svg'] },
    { id: 13, name: 'حقيبة كتف جلدية', category: 'accessories', price: 890, images: ['images/category-accessories.svg'] },
    { id: 14, name: 'ساعة بتصميم بسيط', category: 'accessories', price: 1450, images: ['images/category-accessories.svg'] },
    { id: 15, name: 'سماعة أذن لاسلكية', category: 'electronics', price: 790, images: ['images/category-electronics.svg'] },
    { id: 16, name: 'ماكينة قهوة منزلية', category: 'home', price: 1750, images: ['images/category-home.svg'] },
    { id: 17, name: 'سيروم ترطيب وإشراقة', category: 'beauty', price: 390, images: ['images/category-beauty.svg'] },
    { id: 18, name: 'حقيبة رياضية عملية', category: 'sports', price: 760, images: ['images/category-sports.svg'] },
    { id: 19, name: 'حذاء يومي مريح', category: 'accessories', price: 990, images: ['images/category-accessories.svg'] },
    { id: 20, name: 'حقيبة ظهر عملية', category: 'men', price: 850, images: ['images/category-fashion.svg'] },
    { id: 21, name: 'قهوة محمصة طازجة', category: 'grocery', price: 290, images: ['images/category-grocery.svg'] },
    { id: 22, name: 'مجموعة أساسيات المطبخ', category: 'grocery', price: 540, images: ['images/category-grocery.svg'] }
];

const PRODUCT_KEY = 'elvynProducts';
const CART_KEY = 'elvynCart';
const ORDERS_KEY = 'elvynOrders';
const WHATSAPP_NUMBER = '966500000000';
const LOCAL_IMAGES = [
    'images/93ZGaMRirpRcwfDdcoZMc7Dgol7vQuj6IC7baHym.webp',
    'images/original-6df43789348c74ac03d10840b0a5d684.webp'
];

function normalizeImageUrl(url) {
    if (!url) return '';
    const isExternal = /images\.unsplash\.com|images\.pexels\.com|source\.unsplash\.com/i.test(url);
    if (!isExternal) return url;
    return LOCAL_IMAGES[Math.abs(url.length) % LOCAL_IMAGES.length];
}

function getCart() {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartBadge() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartButton = document.getElementById('cartButton');
    const badge = document.getElementById('cartCount');

    if (badge) badge.textContent = count;
    if (cartButton) {
        const isActive = count > 0;
        cartButton.classList.toggle('active', isActive);
        cartButton.setAttribute('aria-label', isActive ? `عربة التسوق، يوجد ${count} عناصر` : 'عربة التسوق');
    }
}

function getShippingFee() {
    const shippingLocation = document.getElementById('shippingLocation');
    if (!shippingLocation) return 0;
    return Number(shippingLocation.value || 0);
}

function getCartTotals() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const shipping = getShippingFee();
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
}

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');

    if (!cart.length) {
        container.innerHTML = '<div>السلة فارغة حاليًا.</div>';
        totalEl.innerHTML = 'المجموع: 0 جنيه<br>الشحن: 0 جنيه<br><strong>الإجمالي النهائي: 0 جنيه</strong>';
        updateCartBadge();
        return;
    }

    const { subtotal, shipping, total } = getCartTotals();
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name}</span>
            <span>${item.quantity} × ${item.price} جنيه</span>
            <button type="button" class="remove-cart-item" data-product-id="${item.id}">حذف</button>
        </div>
    `).join('');

    totalEl.innerHTML = `
        المجموع: ${subtotal} جنيه<br>
        الشحن: ${shipping} جنيه<br>
        <strong>الإجمالي النهائي: ${total} جنيه</strong>
    `;
    updateCartBadge();
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    renderCart();
}

function removeFromCart(productId) {
    const cart = getCart().filter(item => Number(item.id) !== Number(productId));
    saveCart(cart);
    renderCart();
}

document.getElementById('shippingLocation')?.addEventListener('change', renderCart);

document.getElementById('cartButton')?.addEventListener('click', () => {
    const cartSummary = document.getElementById('cartSummary');
    if (cartSummary) {
        cartSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

document.getElementById('cartItems')?.addEventListener('click', (event) => {
    const button = event.target.closest('.remove-cart-item');
    if (!button) return;
    removeFromCart(button.dataset.productId);
});

function openWhatsApp(productName, price) {
    const message = encodeURIComponent(
        'مرحبًا، أريد طلب هذا المنتج:\n' +
        'اسم المنتج: ' + productName + '\n' +
        'السعر: ' + price + ' جنيه\n' +
        'أرغب في طلبه من ELVYN.'
    );
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + message, '_blank');
}

function normalizeProduct(product) {
    const images = Array.isArray(product.images) && product.images.length
        ? product.images.map(normalizeImageUrl)
        : (product.image ? [normalizeImageUrl(product.image)] : []);

    return {
        ...product,
        images,
        image: images[0] || '',
        isPlaceholder: product.isPlaceholder ?? Boolean(images[0]?.includes('/category-'))
    };
}

function getProducts() {
    const stored = JSON.parse(localStorage.getItem(PRODUCT_KEY) || 'null');
    const starterNames = [
        'جاكيت صفراء أنيقة', 'هودي كاجوال', 'معطف فخم', 'فستان أنثوي',
        'سترة شتوية', 'حذاء رياضي', 'حقيبة فاخرة', 'جاكيت كلاسيكي',
        'سترة رجالية أنيقة', 'فستان خفيف', 'سترة أطفال', 'ملابس رياضية'
    ];
    const isStarterCatalog = Array.isArray(stored) &&
        stored.length === starterNames.length &&
        stored.every(product => starterNames.includes(String(product.name || '').trim()));
    const isPreviousDemoCatalog = Array.isArray(stored) &&
        stored.length === defaultProducts.length - 2 &&
        stored.every((product, index) => {
            const seeded = defaultProducts[index];
            return Number(product.id) === seeded.id &&
                product.name === seeded.name &&
                product.category === seeded.category &&
                Number(product.price) === seeded.price &&
                (product.image || product.images?.[0]) === seeded.images[0];
        });
    const products = stored && stored.length && !isStarterCatalog && !isPreviousDemoCatalog ? stored : defaultProducts;
    const normalized = products.map(normalizeProduct);
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(normalized));
    return normalized;
}

function cardTemplate(product) {
    const images = product.images && product.images.length ? product.images : [product.image];
    const firstImage = images[0] || '';
    const categoryLabels = {
        electronics: 'إلكترونيات',
        home: 'المنزل',
        grocery: 'السوبرماركت',
        beauty: 'جمال وعناية',
        sports: 'رياضة',
        men: 'رجال',
        women: 'أزياء',
        kids: 'الأطفال',
        accessories: 'إكسسوارات'
    };

    return `
        <article class="product-card" data-product-id="${product.id}">
            <div class="product-gallery">
                <button type="button" class="gallery-arrow prev" data-id="${product.id}" data-dir="-1">‹</button>
                <img class="product-image" src="${firstImage}" alt="${product.name}" data-index="0" />
                <button type="button" class="gallery-arrow next" data-id="${product.id}" data-dir="1">›</button>
            </div>
            <div class="product-category">${categoryLabels[product.category] || 'منتجات متنوعة'}</div>
            <div class="name">${product.name}</div>
            <div class="meta">
                <span class="price">${product.price} جنيه</span>
            </div>
            <div class="meta-actions">
                <button type="button" class="btn-cart" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}">أضف للسلة</button>
                <button type="button" class="btn-whatsapp" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}">طلب واتساب</button>
            </div>
        </article>
    `;
}

function renderProducts() {
    const products = getProducts();
    const containers = Object.fromEntries(
        [...document.querySelectorAll('[data-panel]')].map(panel => [
            panel.dataset.panel,
            panel.querySelector('.products')
        ])
    );

    Object.entries(containers).forEach(([key, container]) => {
        if (!container) return;
        const filtered = key === 'all'
            ? products
            : products.filter(product => product.category === key);

        container.innerHTML = filtered.map(cardTemplate).join('');
    });

    document.querySelectorAll('.gallery-arrow').forEach(button => {
        button.addEventListener('click', () => {
            const productId = Number(button.dataset.id);
            const direction = Number(button.dataset.dir || 1);
            const product = getProducts().find(item => Number(item.id) === productId);
            if (!product || !product.images || product.images.length < 2) return;

            const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
            const image = card?.querySelector('.product-image');
            if (!image) return;

            const currentIndex = Number(image.dataset.index || 0);
            const nextIndex = (currentIndex + direction + product.images.length) % product.images.length;

            image.style.opacity = '0';
            setTimeout(() => {
                image.src = product.images[nextIndex];
                image.dataset.index = String(nextIndex);
                image.style.opacity = '1';
            }, 150);
        });
    });

    document.querySelectorAll('.product-image').forEach(image => {
        image.addEventListener('click', () => {
            const modal = document.getElementById('imageModal');
            const modalImage = document.getElementById('modalImage');
            const zoomRange = document.getElementById('zoomRange');
            modalImage.src = image.src;
            modalImage.style.transform = 'scale(1)';
            zoomRange.value = '1';
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
        });
    });

    document.querySelectorAll('.btn-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = Number(button.dataset.productId);
            const product = getProducts().find(item => Number(item.id) === productId);
            if (!product) return;
            addToCart(product);
        });
    });

    document.querySelectorAll('.btn-whatsapp').forEach(button => {
        button.addEventListener('click', () => {
            const productName = button.dataset.productName;
            const productPrice = button.dataset.productPrice;
            openWhatsApp(productName, productPrice);
        });
    });
}

const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const zoomRange = document.getElementById('zoomRange');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');

function setZoom(value) {
    const safeValue = Math.min(3, Math.max(1, Number(value) || 1));
    modalImage.style.transform = `scale(${safeValue})`;
    zoomRange.value = String(safeValue);
}

zoomRange.addEventListener('input', (event) => setZoom(event.target.value));
zoomInBtn.addEventListener('click', () => setZoom(Number(zoomRange.value) + 0.2));
zoomOutBtn.addEventListener('click', () => setZoom(Number(zoomRange.value) - 0.2));

document.querySelector('.image-modal-close').addEventListener('click', () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
});

modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }
});

const orderModal = document.getElementById('orderModal');
const orderForm = document.getElementById('orderForm');

function openOrderModal() {
    const cart = getCart();
    if (!cart.length) return;
    orderModal.classList.add('open');
    orderModal.setAttribute('aria-hidden', 'false');
}

function closeOrderModal() {
    orderModal.classList.remove('open');
    orderModal.setAttribute('aria-hidden', 'true');
}

document.getElementById('shippingBtn').addEventListener('click', openOrderModal);
document.getElementById('closeOrderModal').addEventListener('click', closeOrderModal);

orderModal.addEventListener('click', (event) => {
    if (event.target === orderModal) closeOrderModal();
});

function saveOrder(orderRecord) {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const list = Array.isArray(orders) ? orders : [];
    list.unshift(orderRecord);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
}

function sendOrderToWhatsApp(orderData) {
    const cart = getCart();
    if (!cart.length) return;

    const message = cart.map(item => `${item.name} - ${item.quantity} x ${item.price} جنيه`).join('\n');
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const shippingFee = getShippingFee();
    const total = subtotal + shippingFee;
    const orderRecord = {
        id: Date.now(),
        status: 'جديد',
        createdAt: new Date().toISOString(),
        customerName: orderData.name,
        customerPhone: orderData.phone,
        city: orderData.city,
        address: orderData.address,
        shipping: orderData.shipping,
        payment: orderData.payment,
        note: orderData.note,
        shippingLocation: document.getElementById('shippingLocation')?.selectedOptions[0]?.textContent || 'غير محدد',
        shippingFee,
        subtotal,
        total,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: Number(item.price) * Number(item.quantity)
        }))
    };
    saveOrder(orderRecord);

    const text = [
        'مرحبًا، أريد تأكيد الطلب التالي:',
        'الاسم: ' + orderData.name,
        'رقم الهاتف: ' + orderData.phone,
        'المدينة: ' + orderData.city,
        'العنوان: ' + orderData.address,
        'طريقة الشحن: ' + orderData.shipping,
        'مكان الشحن: ' + orderRecord.shippingLocation,
        'قيمة الشحن: ' + shippingFee + ' جنيه',
        'طريقة الدفع: ' + orderData.payment,
        'الطلب:',
        message,
        'المجموع: ' + subtotal + ' جنيه',
        'الإجمالي النهائي: ' + total + ' جنيه',
        orderData.note ? 'ملاحظات: ' + orderData.note : ''
    ].filter(Boolean).join('\n');

    saveCart([]);
    renderCart();
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank');
    closeOrderModal();
}

document.getElementById('checkoutWhatsApp').addEventListener('click', () => {
    const cart = getCart();
    if (!cart.length) return;

    openOrderModal();
});

orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(orderForm);
    const orderData = {
        name: formData.get('customerName')?.toString().trim() || '',
        phone: formData.get('customerPhone')?.toString().trim() || '',
        city: formData.get('customerCity')?.toString().trim() || '',
        address: formData.get('customerAddress')?.toString().trim() || '',
        shipping: formData.get('shippingMethod')?.toString() || 'توصيل سريع',
        payment: formData.get('paymentMethod')?.toString() || 'انستا باي',
        note: formData.get('customerNote')?.toString().trim() || ''
    };

    if (!orderData.name || !orderData.phone || !orderData.city || !orderData.address) {
        return;
    }

    sendOrderToWhatsApp(orderData);
});

renderProducts();
renderCart();

const newsletterForm = document.getElementById('newsletterForm');
const newsletterEmail = document.getElementById('newsletterEmail');
const newsletterMessage = document.getElementById('newsletterMessage');
const newsletterMessageText = document.getElementById('newsletterMessageText');
const recipient = 'hessienelgendy451@gmail.com';

newsletterForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const email = newsletterEmail.value.trim();
    if (!email) return;

    newsletterMessage.style.display = 'block';
    newsletterMessage.textContent = 'تم الاشتراك بنجاح! شكراً لك.';
    newsletterForm.reset();
});

(function(){
    const toggle = document.getElementById('themeToggle');
    function applyTheme(theme){
        if(theme==='dark') document.documentElement.setAttribute('data-theme','dark');
        else document.documentElement.removeAttribute('data-theme');
        if(toggle) toggle.textContent = theme==='dark' ? '☀️' : '🌙';
    }
    const saved = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(saved);
    if(toggle) toggle.addEventListener('click', ()=>{
        const next = document.documentElement.getAttribute('data-theme')==='dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
    });
})();
