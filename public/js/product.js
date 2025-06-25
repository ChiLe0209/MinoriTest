document.addEventListener('DOMContentLoaded', () => {
    let currentProduct = null;
    let cart = [];
    try {
        const savedCart = JSON.parse(localStorage.getItem('cart'));
        if (Array.isArray(savedCart)) {
            cart = savedCart;
        }
    } catch (e) {
        cart = [];
    }

    const productNameEl = document.getElementById('product-name');
    const productBrandEl = document.getElementById('product-brand');
    const productSkuEl = document.getElementById('product-sku');
    const productPriceEl = document.getElementById('product-price');
    const productStockEl = document.getElementById('product-stock');
    const productImageEl = document.getElementById('product-image');
    const productDescriptionEl = document.getElementById('product-description');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    const cartCountEl = document.getElementById('cart-count');
    const cartCountMobileEl = document.getElementById('cart-count-mobile');

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }
    
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountEl) cartCountEl.textContent = totalItems;
        if (cartCountMobileEl) cartCountMobileEl.textContent = totalItems;
    }
    
    function addToCart() {
        if (!currentProduct) return;
        const cartItem = cart.find(item => item._id === currentProduct._id);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...currentProduct, quantity: 1 });
        }
        saveCart();
        alert(`Đã thêm "${currentProduct.ten_hang}" vào giỏ hàng!`);
    }
    
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    function getProductIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async function fetchAndDisplayProduct() {
        const productId = getProductIdFromUrl();
        if (!productId) {
            if (productNameEl) productNameEl.textContent = "Sản phẩm không hợp lệ.";
            return;
        }

        try {
            // SỬA ĐỔI QUAN TRỌNG: Xóa bỏ "http://localhost:8000"
            const response = await fetch(`/api/products/${productId}`);
            
            if (!response.ok) {
                throw new Error('Không tìm thấy sản phẩm');
            }
            const product = await response.json();
            currentProduct = product;

            document.title = product.ten_hang;
            if(productNameEl) productNameEl.textContent = product.ten_hang;
            if(productBrandEl) productBrandEl.textContent = product.thuong_hieu;
            if(productSkuEl) productSkuEl.textContent = product.ma_hang;
            if(productPriceEl) productPriceEl.textContent = formatCurrency(product.gia_ban);
            if(productStockEl) productStockEl.textContent = product.ton_kho;
            if(productImageEl) {
                productImageEl.src = product.hinh_anh;
                productImageEl.alt = product.ten_hang;
            }
            if (productDescriptionEl) {
                productDescriptionEl.innerHTML = product.mo_ta_chi_tiet || "Sản phẩm này chưa có mô tả chi tiết.";
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
            const container = document.getElementById('product-detail-container');
            if (container) {
                container.innerHTML = `<p class="text-center text-red-500 text-2xl col-span-full">${error.message}</p>`;
            }
        }
    }
    
    if (addToCartBtn) {
       addToCartBtn.addEventListener('click', addToCart);
    }
    
    updateCartCount();
    fetchAndDisplayProduct();
});