(function () {
    const config = window.ELVYN_SUPABASE_CONFIG;
    const sdk = window.supabase;

    if (!sdk?.createClient) {
        window.elvynBackend = {
            client: null,
            configured: false,
            error: 'تعذر تحميل مكتبة Supabase. تحقق من اتصال الإنترنت ثم أعد تحميل الصفحة.'
        };
        return;
    }

    if (!config?.url || !config?.anonKey) {
        window.elvynBackend = {
            client: null,
            configured: false,
            error: 'أضف رابط مشروع Supabase ومفتاح anon إلى scripts/supabase-config.js.'
        };
        return;
    }

    let client;
    try {
        const projectUrl = new URL(config.url);
        if (!['https:', 'http:'].includes(projectUrl.protocol)) {
            throw new Error('يجب أن يبدأ رابط Supabase بـ https://.');
        }
        client = sdk.createClient(projectUrl.origin, config.anonKey);
    } catch (error) {
        window.elvynBackend = {
            client: null,
            configured: false,
            error: error.message || 'تحقق من رابط مشروع Supabase ومفتاح anon.'
        };
        return;
    }
    const throwIfError = (error) => {
        if (error) throw error;
    };
    const mapProduct = (row) => ({
        ...row,
        images: row.image_urls || [],
        image: row.image_urls?.[0] || '',
        isDealOfDay: Boolean(row.is_deal),
        isPlaceholder: Boolean(row.image_urls?.[0]?.includes('/category-'))
    });
    const api = {
        async getProducts() {
            const { data, error } = await client.from('elvyn_products')
                .select('id,name,category,price,image_urls,is_deal,active,created_at')
                .eq('active', true)
                .order('created_at', { ascending: false });
            throwIfError(error);
            return data.map(mapProduct);
        },
        async getDealDiscount() {
            const { data, error } = await client.from('site_settings')
                .select('value')
                .eq('key', 'deal_discount')
                .maybeSingle();
            throwIfError(error);
            return data ? Number(data.value) : 30;
        },
        async createOrder(order, items) {
            const { data, error } = await client.rpc('create_elvyn_order', {
                p_customer_name: order.name,
                p_customer_phone: order.phone,
                p_governorate: order.governorate,
                p_city: order.city,
                p_address: order.address,
                p_shipping_method: order.shipping,
                p_payment_method: order.payment,
                p_note: order.note || '',
                p_items: items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                }))
            });
            throwIfError(error);
            return data;
        }
    };

    window.elvynBackend = {
        client,
        api,
        configured: true,
        error: ''
    };
})();
