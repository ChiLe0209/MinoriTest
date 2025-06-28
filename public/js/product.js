document.addEventListener('DOMContentLoaded', () => {

    // === LẤY CÁC PHẦN TỬ DOM ===
    const productNameEl = document.getElementById('product-name');
    const productBrandEl = document.getElementById('product-brand');
    const productSkuEl = document.getElementById('product-sku');
    const productPriceEl = document.getElementById('product-price');
    const productStockEl = document.getElementById('product-stock');
    const productImageEl = document.getElementById('product-image');
    const productDescriptionEl = document.getElementById('product-description');
    const variantOptionsContainer = document.getElementById('variant-options');
    const variantsContainer = document.getElementById('variants-container');

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    /**
     * Cập nhật giao diện với thông tin của một biến thể cụ thể.
     * @param {object} product - Dữ liệu sản phẩm chung.
     * @param {object} variant - Dữ liệu của biến thể được chọn.
     */
    function displayVariantDetails(product, variant) {
        document.title = `${product.ten_hang} - ${variant.name}`;
        
        productNameEl.textContent = product.ten_hang;
        productBrandEl.textContent = product.thuong_hieu;
        productDescriptionEl.innerHTML = product.mo_ta_chi_tiet || "Sản phẩm này chưa có mô tả chi tiết.";

        // Cập nhật thông tin theo biến thể
        productImageEl.src = variant.image;
        productImageEl.alt = `${product.ten_hang} - ${variant.name}`;
        productPriceEl.textContent = formatCurrency(variant.price);
        productStockEl.textContent = variant.stock;
        productSkuEl.textContent = variant.sku || product.ma_hang; // Ưu tiên SKU của biến thể
    }

    /**
     * Tạo các nút để chọn biến thể.
     * @param {object} product - Dữ liệu sản phẩm chung.
     */
    function renderVariantOptions(product) {
        if (!variantOptionsContainer || !product.variants || product.variants.length <= 1) {
            variantsContainer.style.display = 'none'; // Ẩn khu vực chọn nếu không có hoặc chỉ có 1 biến thể
            return;
        }

        variantOptionsContainer.innerHTML = '';
        product.variants.forEach((variant, index) => {
            const button = document.createElement('button');
            button.className = 'variant-btn';
            button.textContent = variant.name;
            button.dataset.index = index; // Lưu chỉ số của biến thể

            // Đặt active cho biến thể đầu tiên
            if (index === 0) {
                button.classList.add('active');
            }

            button.addEventListener('click', () => {
                // Xóa active ở các nút khác
                document.querySelectorAll('.variant-btn').forEach(btn => btn.classList.remove('active'));
                // Thêm active cho nút được click
                button.classList.add('active');
                
                // Lấy biến thể được chọn từ mảng và hiển thị lại chi tiết
                const selectedVariant = product.variants[index];
                displayVariantDetails(product, selectedVariant);
            });

            variantOptionsContainer.appendChild(button);
        });
    }

    /**
     * Hàm chính: Lấy dữ liệu sản phẩm từ API và khởi tạo trang.
     */
    async function initProductPage() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');

        if (!productId) {
            document.body.innerHTML = '<p class="text-center text-red-500 text-2xl p-10">ID sản phẩm không hợp lệ.</p>';
            return;
        }

        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) throw new Error('Không tìm thấy sản phẩm');
            
            const product = await response.json();

            // Kiểm tra xem sản phẩm có biến thể hay không
            if (!product.variants || product.variants.length === 0) {
                 // Nếu không có biến thể, hiển thị ảnh bìa và các thông tin cũ (nếu có)
                productImageEl.src = product.hinh_anh_bia;
                productNameEl.textContent = product.ten_hang;
                productPriceEl.textContent = formatCurrency(product.gia_ban); // Giả sử có giá bán cũ
                variantsContainer.style.display = 'none';
                return;
            }

            // Mặc định hiển thị biến thể đầu tiên
            const defaultVariant = product.variants[0];
            displayVariantDetails(product, defaultVariant);
            
            // Tạo các nút chọn biến thể
            renderVariantOptions(product);

        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
            document.getElementById('product-detail-container').innerHTML = `<p class="text-center text-red-500 text-2xl col-span-full">${error.message}</p>`;
        }
    }

    // Thêm một ít CSS để nút biến thể trông đẹp hơn
    const style = document.createElement('style');
    style.textContent = `
        .variant-btn {
            padding: 8px 16px;
            border: 2px solid var(--border-color, #e5e7eb);
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .variant-btn:hover {
            border-color: var(--primary-color, #2563eb);
            color: var(--primary-color, #2563eb);
        }
        .variant-btn.active {
            border-color: var(--primary-color, #2563eb);
            background-color: var(--primary-color, #2563eb);
            color: white;
        }
    `;
    document.head.appendChild(style);

    // Khởi chạy
    initProductPage();
});