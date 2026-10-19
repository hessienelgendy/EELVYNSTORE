(function () {
    const backend = window.elvynBackend;
    const loginPanel = document.getElementById('loginPanel');
    const dashboard = document.getElementById('dashboard');
    const notice = document.getElementById('notice');
    const ordersTable = document.getElementById('ordersTable');
    const productsTable = document.getElementById('productsTable');
    const categoryLabels = {
        electronics: 'إلكترونيات',
        home: 'المنزل',
        grocery: 'السوبرماركت',
        beauty: 'جمال وعناية',
        sports: 'رياضة',
        men: 'رجال',
        women: 'أزياء نسائية',
        kids: 'الأطفال',
        accessories: 'إكسسوارات'
    };
    const orderStatuses = ['جديد', 'قيد التنفيذ', 'تم التسليم', 'ملغي'];
    let products = [];
    let orders = [];

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    }

    function money(value) {
        return `${new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(Number(value) || 0)} ج.م`;
    }

    function showNotice(message, type) {
        notice.textContent = message;
        notice.className = `notice ${type || ''}`;
        notice.hidden = false;
        window.clearTimeout(showNotice.timeout);
        showNotice.timeout = window.setTimeout(() => { notice.hidden = true; }, 7000);
    }

    function errorMessage(error) {
        return error?.message || 'حدث خطأ غير متوقع. حاول مرة أخرى.';
    }

    function setBusy(button, busy, busyText) {
        if (!button.dataset.label) button.dataset.label = button.textContent;
        button.disabled = busy;
        button.textContent = busy ? busyText : button.dataset.label;
    }

    function setSignedIn(signedIn) {
        loginPanel.hidden = signedIn;
        dashboard.hidden = !signedIn;
    }

    async function checkAdminAccess() {
        const { data: sessionData, error: sessionError } = await backend.client.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionData.session) {
            setSignedIn(false);
            return false;
        }

        const { data, error } = await backend.client.rpc('is_elvyn_admin');
        if (error) throw error;
        if (data !== true) {
            await backend.client.auth.signOut();
            setSignedIn(false);
            showNotice('هذا الحساب غير مخوّل لإدارة المتجر. أضِفه إلى قائمة الأدمن في Supabase.', 'error');
            return false;
        }
        setSignedIn(true);
        return true;
    }

    function renderStats() {
        document.getElementById('totalOrders').textContent = new Intl.NumberFormat('ar-EG').format(orders.length);
        document.getElementById('newOrders').textContent = new Intl.NumberFormat('ar-EG').format(
            orders.filter(order => order.status === 'جديد').length
        );
        document.getElementById('deliveredRevenue').textContent = money(
            orders.filter(order => order.status === 'تم التسليم')
                .reduce((total, order) => total + Number(order.total), 0)
        );
        document.getElementById('activeProducts').textContent = new Intl.NumberFormat('ar-EG').format(
            products.filter(product => product.active).length
        );
    }

    function renderOrders() {
        if (!orders.length) {
            ordersTable.innerHTML = '<tr><td colspan="6">لا توجد طلبات حتى الآن.</td></tr>';
            return;
        }
        ordersTable.innerHTML = orders.map(order => {
            const date = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
                .format(new Date(order.created_at));
            const items = Array.isArray(order.items)
                ? order.items.map(item => `${escapeHtml(item.name)} × ${escapeHtml(item.quantity)}`).join('، ')
                : 'لا توجد تفاصيل للمنتجات';
            const statusOptions = orderStatuses.map(status =>
                `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`
            ).join('');
            return `<tr>
                <td><strong>#${escapeHtml(order.id)}</strong><p class="muted">${escapeHtml(date)}</p></td>
                <td><strong>${escapeHtml(order.customer_name)}</strong><p class="muted">${escapeHtml(order.customer_phone)}</p></td>
                <td>${escapeHtml(order.governorate)}، ${escapeHtml(order.city)}<p class="muted">${escapeHtml(order.shipping_method)}</p></td>
                <td>${money(order.total)}<p class="muted">${escapeHtml(order.payment_method)}</p></td>
                <td><form class="order-status" data-order-id="${escapeHtml(order.id)}">
                    <select aria-label="حالة الطلب">${statusOptions}</select>
                    <button class="button secondary" type="submit">حفظ</button>
                </form></td>
                <td><details><summary>عرض</summary><p>${escapeHtml(order.address)}</p>
                    <p>${items}</p><p class="muted">${escapeHtml(order.note || 'لا توجد ملاحظات')}</p>
                    <p class="muted">الشحن: ${money(order.shipping_fee)} — المنتجات: ${money(order.subtotal)}</p>
                </details></td>
            </tr>`;
        }).join('');
    }

    function renderProducts() {
        if (!products.length) {
            productsTable.innerHTML = '<tr><td colspan="6">لا توجد منتجات.</td></tr>';
            return;
        }
        productsTable.innerHTML = products.map(product => `<tr>
            <td><strong>${escapeHtml(product.name)}</strong>${product.is_deal ? '<p class="muted">صفقة اليوم</p>' : ''}</td>
            <td>${escapeHtml(categoryLabels[product.category] || product.category)}</td>
            <td>${money(product.price)}</td>
            <td><span class="status-badge">${product.active ? 'ظاهر' : 'مخفي'}</span></td>
            <td><span class="status-badge">${product.is_deal ? 'مفعّلة' : 'غير مفعّلة'}</span></td>
            <td>
                <button class="button secondary" type="button" data-toggle-deal="${escapeHtml(product.id)}">${product.is_deal ? 'إلغاء الصفقة' : 'تفعيل كصفقة'}</button>
                <button class="button secondary" type="button" data-edit-product="${escapeHtml(product.id)}">تعديل</button>
                <button class="button secondary" type="button" data-toggle-product="${escapeHtml(product.id)}">${product.active ? 'إخفاء' : 'إظهار'}</button>
            </td>
        </tr>`).join('');
    }

    async function fetchAllRows(createQuery) {
        const rows = [];
        const pageSize = 1000;
        for (let start = 0; ; start += pageSize) {
            const { data, error } = await createQuery().range(start, start + pageSize - 1);
            if (error) throw error;
            rows.push(...(data || []));
            if (!data || data.length < pageSize) return rows;
        }
    }

    async function loadDashboard() {
        const [loadedProducts, loadedOrders, settingResult] = await Promise.all([
            fetchAllRows(() => backend.client.from('elvyn_products')
                .select('id,name,category,price,image_urls,is_deal,active,created_at')
                .order('created_at', { ascending: false })
                .order('id', { ascending: false })),
            fetchAllRows(() => backend.client.from('orders')
                .select('id,status,customer_name,customer_phone,governorate,city,address,shipping_method,payment_method,note,subtotal,shipping_fee,total,items,created_at')
                .order('created_at', { ascending: false })
                .order('id', { ascending: false })),
            backend.client.from('site_settings').select('value').eq('key', 'deal_discount').maybeSingle()
        ]);
        if (settingResult.error) throw settingResult.error;

        products = loadedProducts;
        orders = loadedOrders;
        document.getElementById('dealDiscount').value = settingResult.data
            ? String(Number(settingResult.data.value))
            : '30';
        renderStats();
        renderOrders();
        renderProducts();
    }

    function resetProductForm() {
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('saveProductButton').textContent = 'إضافة المنتج';
        document.getElementById('saveProductButton').dataset.label = 'إضافة المنتج';
        document.getElementById('cancelEditButton').hidden = true;
    }

    function startProductEdit(product) {
        document.getElementById('productId').value = String(product.id);
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = String(product.price);
        document.getElementById('productDeal').checked = product.is_deal;
        document.getElementById('productImageUrl').value = '';
        document.getElementById('saveProductButton').textContent = 'حفظ التعديلات';
        document.getElementById('saveProductButton').dataset.label = 'حفظ التعديلات';
        document.getElementById('cancelEditButton').hidden = false;
        document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
    }

    async function uploadProductImage(file) {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
            throw new Error('نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP أو AVIF.');
        }
        if (file.size > 8 * 1024 * 1024) throw new Error('حجم الصورة يجب ألا يتجاوز 8 ميجابايت.');

        const extension = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const path = `${crypto.randomUUID()}.${extension}`;
        const { error } = await backend.client.storage.from('elvyn-product-images').upload(path, file, {
            cacheControl: '3600',
            contentType: file.type,
            upsert: false
        });
        if (error) throw error;
        const { data } = backend.client.storage.from('elvyn-product-images').getPublicUrl(path);
        return data.publicUrl;
    }

    document.getElementById('loginForm').addEventListener('submit', async event => {
        event.preventDefault();
        const button = event.currentTarget.querySelector('button[type="submit"]');
        setBusy(button, true, 'جارٍ تسجيل الدخول...');
        try {
            const { error } = await backend.client.auth.signInWithPassword({
                email: document.getElementById('loginEmail').value.trim(),
                password: document.getElementById('loginPassword').value
            });
            if (error) throw error;
            if (await checkAdminAccess()) {
                await loadDashboard();
                showNotice('تم تسجيل الدخول بنجاح.', 'success');
            }
        } catch (error) {
            showNotice(errorMessage(error), 'error');
        } finally {
            setBusy(button, false, 'تسجيل الدخول');
        }
    });

    document.getElementById('signOutButton').addEventListener('click', async () => {
        const { error } = await backend.client.auth.signOut();
        if (error) {
            showNotice(errorMessage(error), 'error');
            return;
        }
        setSignedIn(false);
    });

    document.getElementById('refreshButton').addEventListener('click', async event => {
        setBusy(event.currentTarget, true, 'جارٍ التحديث...');
        try {
            await loadDashboard();
            showNotice('تم تحديث البيانات.', 'success');
        } catch (error) {
            showNotice(errorMessage(error), 'error');
        } finally {
            setBusy(event.currentTarget, false, 'تحديث البيانات');
        }
    });

    document.getElementById('ordersTable').addEventListener('submit', async event => {
        if (!event.target.matches('.order-status')) return;
        event.preventDefault();
        const form = event.target;
        const button = form.querySelector('button');
        setBusy(button, true, 'جارٍ الحفظ...');
        try {
            const orderId = form.dataset.orderId;
            const status = form.querySelector('select').value;
            const { error } = await backend.client.from('orders').update({ status }).eq('id', orderId);
            if (error) throw error;
            await loadDashboard();
            showNotice('تم تحديث حالة الطلب.', 'success');
        } catch (error) {
            showNotice(errorMessage(error), 'error');
        } finally {
            setBusy(button, false, 'حفظ');
        }
    });

    document.getElementById('productsTable').addEventListener('click', async event => {
        const editButton = event.target.closest('[data-edit-product]');
        if (editButton) {
            const product = products.find(item => String(item.id) === editButton.dataset.editProduct);
            if (product) startProductEdit(product);
            return;
        }

        const dealButton = event.target.closest('[data-toggle-deal]');
        if (dealButton) {
            setBusy(dealButton, true, 'جارٍ الحفظ...');
            try {
                const product = products.find(item => String(item.id) === dealButton.dataset.toggleDeal);
                if (!product) throw new Error('لم يتم العثور على المنتج.');
                const { error } = await backend.client.from('elvyn_products')
                    .update({ is_deal: !product.is_deal })
                    .eq('id', product.id);
                if (error) throw error;
                await loadDashboard();
                showNotice(product.is_deal ? 'تم إلغاء صفقة اليوم لهذا المنتج.' : 'تم تفعيل صفقة اليوم لهذا المنتج.', 'success');
            } catch (error) {
                showNotice(errorMessage(error), 'error');
                dealButton.disabled = false;
                dealButton.textContent = dealButton.dataset.label || 'تفعيل كصفقة';
            }
            return;
        }

        const toggleButton = event.target.closest('[data-toggle-product]');
        if (!toggleButton) return;
        setBusy(toggleButton, true, 'جارٍ الحفظ...');
        try {
            const product = products.find(item => String(item.id) === toggleButton.dataset.toggleProduct);
            if (!product) throw new Error('لم يتم العثور على المنتج.');
            const { error } = await backend.client.from('elvyn_products')
                .update({ active: !product.active })
                .eq('id', product.id);
            if (error) throw error;
            await loadDashboard();
            showNotice(product.active ? 'تم إخفاء المنتج من المتجر.' : 'تم إظهار المنتج في المتجر.', 'success');
        } catch (error) {
            showNotice(errorMessage(error), 'error');
            toggleButton.disabled = false;
            toggleButton.textContent = toggleButton.dataset.label || 'حفظ';
        }
    });

    document.getElementById('productForm').addEventListener('submit', async event => {
        event.preventDefault();
        const button = document.getElementById('saveProductButton');
        setBusy(button, true, 'جارٍ الحفظ...');
        try {
            const productId = document.getElementById('productId').value;
            const existingProduct = products.find(product => String(product.id) === productId);
            const file = document.getElementById('productImage').files[0];
            const suppliedImageUrl = document.getElementById('productImageUrl').value.trim();
            let imageUrl = file ? await uploadProductImage(file) : suppliedImageUrl;
            if (!imageUrl && existingProduct) imageUrl = existingProduct.image_urls?.[0] || '';
            if (!imageUrl) throw new Error('اختر صورة للمنتج أو أدخل رابط صورة HTTPS.');
            if (!file && suppliedImageUrl && !suppliedImageUrl.startsWith('https://')) {
                throw new Error('يجب أن يبدأ رابط الصورة بـ HTTPS.');
            }

            const product = {
                name: document.getElementById('productName').value.trim(),
                category: document.getElementById('productCategory').value,
                price: Number(document.getElementById('productPrice').value),
                image_urls: [imageUrl],
                is_deal: document.getElementById('productDeal').checked
            };
            if (productId) {
                const { error } = await backend.client.from('elvyn_products').update(product).eq('id', productId);
                if (error) throw error;
            } else {
                const { error } = await backend.client.from('elvyn_products').insert(product);
                if (error) throw error;
            }
            resetProductForm();
            await loadDashboard();
            showNotice('تم حفظ المنتج بنجاح.', 'success');
        } catch (error) {
            showNotice(errorMessage(error), 'error');
        } finally {
            setBusy(button, false, button.dataset.label || 'إضافة المنتج');
        }
    });

    document.getElementById('cancelEditButton').addEventListener('click', resetProductForm);

    document.getElementById('dealForm').addEventListener('submit', async event => {
        event.preventDefault();
        const button = event.currentTarget.querySelector('button');
        setBusy(button, true, 'جارٍ الحفظ...');
        try {
            const value = Number(document.getElementById('dealDiscount').value);
            if (!Number.isFinite(value) || value < 0 || value > 100) {
                throw new Error('يجب أن تكون نسبة الخصم بين 0 و100.');
            }
            const { error } = await backend.client.from('site_settings').upsert({
                key: 'deal_discount',
                value,
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });
            if (error) throw error;
            showNotice('تم حفظ نسبة الخصم.', 'success');
        } catch (error) {
            showNotice(errorMessage(error), 'error');
        } finally {
            setBusy(button, false, 'حفظ الخصم');
        }
    });

    async function initialize() {
        if (!backend?.configured || !backend.client) {
            setSignedIn(false);
            showNotice(backend?.error || 'تعذر الاتصال بخدمة المتجر.', 'error');
            return;
        }
        try {
            if (await checkAdminAccess()) await loadDashboard();
        } catch (error) {
            setSignedIn(false);
            showNotice(errorMessage(error), 'error');
        }
    }

    initialize();
})();
