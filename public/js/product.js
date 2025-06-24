document.addEventListener('DOMContentLoaded', () => {

    // 1. LẤY CÁC PHẦN TỬ DOM
    const productNameEl = document.getElementById('product-name');
    const productBrandEl = document.getElementById('product-brand');
    const productSkuEl = document.getElementById('product-sku');
    const productPriceEl = document.getElementById('product-price');
    const productStockEl = document.getElementById('product-stock');
    const productImageEl = document.getElementById('product-image');
    const productDescriptionEl = document.getElementById('product-description');
    
    // Các element của chức năng liên hệ
    const contactBtn = document.getElementById('contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const closeContactModalBtn = document.getElementById('close-contact-modal-btn');

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return '0 đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // 2. HÀM LẤY VÀ HIỂN THỊ DỮ LIỆU SẢN PHẨM
    async function fetchAndDisplayProduct() {
        // Lấy ID sản phẩm từ URL
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');

        if (!productId) {
            if(productNameEl) productNameEl.textContent = "Sản phẩm không hợp lệ hoặc không tồn tại.";
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/products/${productId}`);
            if (!response.ok) {
                throw new Error('Không tìm thấy sản phẩm');
            }
            const product = await response.json();

            // Điền thông tin sản phẩm vào trang
            document.title = product.ten_hang; // Cập nhật tiêu đề của tab trình duyệt
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
            console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
            const container = document.getElementById('product-detail-container');
            if (container) {
                container.innerHTML = `<p class="text-center text-red-500 text-2xl col-span-full">${error.message}</p>`;
            }
        }
    }
    
    // 3. GẮN SỰ KIỆN CHO CÁC NÚT
    if (contactBtn && contactModal) {
        contactBtn.addEventListener('click', () => {
            contactModal.classList.remove('hidden');
        });
    }

    if (closeContactModalBtn && contactModal) {
        closeContactModalBtn.addEventListener('click', () => {
            contactModal.classList.add('hidden');
        });
    }
    
    // 4. KHỞI CHẠY
    fetchAndDisplayProduct();
});