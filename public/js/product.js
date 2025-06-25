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

    // --- HÀM HELPER ---
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'Chưa có giá';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // --- HÀM LẤY VÀ HIỂN THỊ DỮ LIỆU SẢN PHẨM ---
    async function fetchAndDisplayProduct() {
        // Lấy ID sản phẩm từ URL
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');

        if (!productId) {
            if(productNameEl) productNameEl.textContent = "Sản phẩm không hợp lệ hoặc không tồn tại.";
            return;
        }

        try {
            // Gọi đến API tương đối, không dùng localhost
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) {
                throw new Error('Không tìm thấy sản phẩm');
            }
            const product = await response.json();

            // Điền thông tin sản phẩm vào trang
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
                // Dùng innerHTML để có thể hiển thị các định dạng HTML
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
    
    // --- GẮN CÁC SỰ KIỆN ---

    // Gắn sự kiện cho nút "Liên hệ" chính
    if (contactBtn && contactModal) {
        contactBtn.addEventListener('click', () => {
            contactModal.classList.remove('hidden');
        });
    }

    // Gắn sự kiện cho nút "Đóng" trên modal
    if (closeContactModalBtn && contactModal) {
        closeContactModalBtn.addEventListener('click', () => {
            contactModal.classList.add('hidden');
        });
    }
    
    // --- KHỞI CHẠY ---
    fetchAndDisplayProduct();
});