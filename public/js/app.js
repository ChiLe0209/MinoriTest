document.addEventListener('DOMContentLoaded', () => {

    // 1. KHAI BÁO BIẾN VÀ LẤY DOM ELEMENTS
    let allProducts = [];
    let currentPage = 1;
    let currentCategory = 'all';

    const productGrid = document.getElementById('product-grid');
    const paginationControls = document.getElementById('pagination-controls');
    const categoryFilters = document.getElementById('category-filters');
    const contactModal = document.getElementById('contact-modal');
    const closeContactModalBtn = document.getElementById('close-contact-modal-btn');
    const heroImages = document.querySelectorAll('.hero-image');

    // 2. LOGIC CHO HERO SLIDER
    if (heroImages.length > 0) {
        let currentIndex = 0;
        const intervalTime = 3000;
        function showSlide(index) {
            heroImages.forEach(img => img.classList.remove('active'));
            if (heroImages[index]) {
                heroImages[index].classList.add('active');
            }
        }
        function nextSlide() {
            currentIndex = (currentIndex + 1) % heroImages.length;
            showSlide(currentIndex);
        }
        showSlide(currentIndex);
        setInterval(nextSlide, intervalTime);
    }
    
    // 3. CÁC HÀM CHÍNH CỦA ỨNG DỤNG
    async function fetchData(url) {
        try {
            const response = await fetch(url);
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
            } else {
                 console.error("Dữ liệu sản phẩm không hợp lệ từ server:", data);
            }
        } catch (error) {
            if (productGrid) productGrid.innerHTML = '<p class="text-center text-red-500 col-span-full">Không thể tải được sản phẩm.</p>';
        }
    }

    async function renderCategoryFilters() {
        if (!categoryFilters) return;
        const categories = await fetchData('/api/categories');
        
        const dynamicFilters = categoryFilters.querySelectorAll('.dynamic-filter');
        if(dynamicFilters) dynamicFilters.forEach(btn => btn.remove());

        if (categories && Array.isArray(categories)) {
            categories.forEach(category => {
                const button = document.createElement('button');
                button.dataset.category = category.slug; 
                button.className = 'filter-btn dynamic-filter capitalize bg-white text-gray-700 px-5 py-2 rounded-full text-sm font-medium shadow-sm transition-transform transform hover:scale-105';
                button.textContent = category.name; 
                categoryFilters.appendChild(button);
            });
        }
    }

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // =======================================================================
    // SỬA ĐỔI Ở ĐÂY: Đổi nút "Thêm vào giỏ" thành nút "Liên hệ"
    // =======================================================================
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
                        <p class="text-gray-500 text-sm capitalize mt-1">${(product.danh_muc || '').replace(/-/g, ' ')}</p>
                        <div class="flex-grow"></div>
                        <p class="text-lg text-blue-600 font-semibold mt-2">${formatCurrency(product.gia_ban)}</p>
                        <button class="contact-btn mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                            Liên hệ
                        </button>
                    </div>
                </div>`;
        });
    };

    function renderPagination(totalPages, currentPage) {
        if (!paginationControls) return;
        paginationControls.innerHTML = '';
        if (totalPages <= 1) return;

        const createButton = (content, pageNumber, isDisabled = false, isActive = false) => {
            const button = document.createElement('button');
            button.dataset.page = pageNumber;
            button.innerHTML = content;
            button.disabled = isDisabled;
            let baseClasses = 'px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-200';
            let activeClasses = 'bg-blue-600 text-white cursor-default';
            let defaultClasses = 'bg-white text-gray-700 hover:bg-gray-100';
            let disabledClasses = 'bg-white text-gray-400 cursor-not-allowed opacity-60';
            if (isDisabled) {
                button.className = `${baseClasses} ${disabledClasses}`;
            } else if (isActive) {
                button.className = `${baseClasses} ${activeClasses}`;
            } else {
                button.className = `${baseClasses} ${defaultClasses}`;
            }
            return button;
        };

        const createEllipsis = () => {
            const span = document.createElement('span');
            span.textContent = '...';
            span.className = 'px-4 py-2 text-sm text-gray-500';
            return span;
        };
        
        paginationControls.appendChild(createButton('&lt;', currentPage - 1, currentPage === 1));
        if (totalPages <= 7) { 
            for (let i = 1; i <= totalPages; i++) {
                paginationControls.appendChild(createButton(i, i, false, i === currentPage));
            }
        } else {
            paginationControls.appendChild(createButton(1, 1, false, currentPage === 1));
            if (currentPage > 3) paginationControls.appendChild(createEllipsis());
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);
            for (let i = startPage; i <= endPage; i++) {
                paginationControls.appendChild(createButton(i, i, false, i === currentPage));
            }
            if (currentPage < totalPages - 2) paginationControls.appendChild(createEllipsis());
            paginationControls.appendChild(createButton(totalPages, totalPages, false, currentPage === totalPages));
        }
        paginationControls.appendChild(createButton('&gt;', currentPage + 1, currentPage === totalPages));
    }
    
    // 4. GẮN CÁC SỰ KIỆN
    
    // SỬA ĐỔI: Gán sự kiện cho các nút "Liên hệ"
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('contact-btn')) {
                if(contactModal) contactModal.classList.remove('hidden');
            }
        });
    }

    // Sự kiện đóng modal liên hệ
    if (closeContactModalBtn) {
        closeContactModalBtn.addEventListener('click', () => {
            if(contactModal) contactModal.classList.add('hidden');
        });
    }

    if (categoryFilters) {
        categoryFilters.addEventListener('click', (e) => {
            const clickedButton = e.target.closest('.filter-btn');
            if (!clickedButton) return;
            const category = clickedButton.dataset.category;
            if (category !== currentCategory) {
                fetchProducts(1, category);
            }
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-white', 'text-gray-700');
            });
            clickedButton.classList.remove('bg-white', 'text-gray-700');
            clickedButton.classList.add('bg-blue-600', 'text-white');
        });
    }

    if (paginationControls) {
        paginationControls.addEventListener('click', (e) => {
            const pageButton = e.target.closest('button');
            if (pageButton && !pageButton.disabled && pageButton.dataset.page) {
                const page = parseInt(pageButton.dataset.page, 10);
                if (page !== currentPage) {
                    fetchProducts(page, currentCategory);
                }
            }
        });
    }

    // 5. KHỞI CHẠY ỨNG DỤNG
    if(productGrid) {
        fetchProducts(1, 'all');
        renderCategoryFilters();
    }
});