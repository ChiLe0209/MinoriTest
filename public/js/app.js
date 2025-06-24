// public/js/app.js (Phiên bản chỉ có chức năng liên hệ)
document.addEventListener('DOMContentLoaded', () => {

    let allProducts = [];
    let currentPage = 1;
    let currentCategory = 'all';

    const productGrid = document.getElementById('product-grid');
    const paginationControls = document.getElementById('pagination-controls');
    const categoryFilters = document.getElementById('category-filters');
    const contactModal = document.getElementById('contact-modal');
    const closeContactModalBtn = document.getElementById('close-contact-modal-btn');
    const heroImages = document.querySelectorAll('.hero-image');

    // Hero Slider
    if (heroImages.length > 0) {
        let currentIndex = 0;
        const intervalTime = 3000;
        function showSlide(index) {
            heroImages.forEach(img => img.classList.remove('active'));
            if (heroImages[index]) heroImages[index].classList.add('active');
        }
        function nextSlide() {
            currentIndex = (currentIndex + 1) % heroImages.length;
            showSlide(currentIndex);
        }
        showSlide(currentIndex);
        setInterval(nextSlide, intervalTime);
    }
    
    // Các hàm xử lý dữ liệu và hiển thị
async function fetchData(url) {
    try {
        const response = await fetch(url); // Đã xóa bỏ localhost:8000
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Lỗi khi tải dữ liệu từ ${url}:`, error);
        return null;
    }
}
    
    async function fetchProducts(page = 1, category = 'all') {
        try {
            const url = `/api/products?page=${page}&limit=8&category=${category}`;
            const data = await fetchData(url);
            if (data && Array.isArray(data.products)) {
                allProducts = data.products;
                currentPage = data.currentPage;
                currentCategory = category;
                renderProducts(allProducts); 
                renderPagination(data.totalPages, data.currentPage);
            }
        } catch (error) {
            if (productGrid) productGrid.innerHTML = '<p class="text-center text-red-500 col-span-full">Không thể tải được sản phẩm.</p>';
        }
    }

    async function renderCategoryFilters() {
        if (!categoryFilters) return;
        const categories = await fetchData('/api/categories');
        categoryFilters.querySelectorAll('.dynamic-filter').forEach(btn => btn.remove());
        if (categories && Array.isArray(categories)) {
            categories.forEach(category => {
                const button = document.createElement('button');
                button.dataset.category = category.slug; 
                button.className = 'filter-btn dynamic-filter capitalize bg-white text-gray-700 px-5 py-2 rounded-full text-sm font-medium shadow-sm hover:scale-105';
                button.textContent = category.name; 
                categoryFilters.appendChild(button);
            });
        }
    }

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const renderProducts = (productArray) => {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        if (!Array.isArray(productArray) || productArray.length === 0) {
            productGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">Không có sản phẩm nào phù hợp.</p>';
            return;
        }
        productArray.forEach(product => {
            productGrid.innerHTML += `
                <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col group">
                    <a href="/product.html?id=${product._id}" class="block h-60 bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img src="${product.hinh_anh}" alt="${product.ten_hang}" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300">
                    </a>
                    <div class="p-5 flex flex-col flex-grow">
                        <a href="/product.html?id=${product._id}" class="hover:text-blue-600">
                           <h3 class="text-xl font-bold text-gray-800 truncate" title="${product.ten_hang}">${product.ten_hang}</h3>
                        </a>
                        <p class="text-gray-500 text-sm capitalize mt-1">${product.danh_muc.replace(/-/g, ' ')}</p>
                        <div class="flex-grow"></div>
                        <p class="text-lg text-blue-600 font-semibold mt-2">${formatCurrency(product.gia_ban)}</p>
                        <button class="contact-btn mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                            Liên hệ
                        </button>
                    </div>
                </div>`;
        });
    };

    function renderPagination(totalPages, currentPage) { /* Giữ nguyên không đổi */ }

    // Gắn sự kiện
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('contact-btn')) {
                contactModal.classList.remove('hidden');
            }
        });
    }

    if (closeContactModalBtn) {
        closeContactModalBtn.addEventListener('click', () => {
            contactModal.classList.add('hidden');
        });
    }
    
    // Các sự kiện cho bộ lọc và phân trang giữ nguyên
    if (categoryFilters) { /* ... */ }
    if (paginationControls) { /* ... */ }

    // Khởi chạy
    if(productGrid) {
        fetchProducts(1, 'all');
        renderCategoryFilters();
    }
});