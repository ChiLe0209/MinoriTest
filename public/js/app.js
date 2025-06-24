document.addEventListener('DOMContentLoaded', () => {

    // 1. KHAI BÁO BIẾN VÀ LẤY DOM ELEMENTS
    let allProducts = [];
    let cart = [];
    try {
        const savedCart = JSON.parse(localStorage.getItem('cart'));
        if (Array.isArray(savedCart)) {
            cart = savedCart;
        }
    } catch (e) {
        console.error("Lỗi khi đọc giỏ hàng từ localStorage, bắt đầu với giỏ hàng mới.", e);
        cart = [];
    }

    let currentPage = 1;
    let currentCategory = 'all';

    const productGrid = document.getElementById('product-grid');
    const paginationControls = document.getElementById('pagination-controls');
    const categoryFilters = document.getElementById('category-filters');
    const cartButton = document.getElementById('cart-button');
    const cartButtonMobile = document.getElementById('cart-button-mobile');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountEl = document.getElementById('cart-count');
    const cartCountMobileEl = document.getElementById('cart-count-mobile');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const heroImages = document.querySelectorAll('.hero-image');

    // 2. LOGIC CHO HERO SLIDER
    if (heroImages.length > 0) {
        let currentIndex = 0;
        const intervalTime = 3000;
        function showSlide(index) {
            heroImages.forEach(img => {
                if(img) img.classList.remove('active');
            });
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
            const response = await fetch(url); // Đã xóa localhost
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

    async function submitOrder(orderData) {
        try {
            const response = await fetch('/api/orders', { // Đã xóa localhost
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Có lỗi khi đặt hàng');
            }
            alert('Đặt hàng thành công!');
            cart = [];
            saveCart();
            renderCart();
            if(checkoutForm) checkoutForm.reset();
            if(checkoutModal) checkoutModal.classList.add('hidden');
        } catch (error) {
            console.error('Lỗi khi gửi đơn hàng:', error);
            alert(`Đã xảy ra lỗi: ${error.message}`);
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
                        <button data-id="${product._id}" class="add-to-cart-btn mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>`;
        });
    };

    const renderCart = () => {
        if (!cartItemsContainer || !cartTotalEl) return;
        let total = 0;
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center">Giỏ hàng của bạn đang trống.</p>';
        } else {
            cart.forEach(item => {
                const price = typeof item.gia_ban === 'number' ? item.gia_ban : 0;
                const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
                const name = item.ten_hang || 'Sản phẩm không tên';
                const image = item.hinh_anh || '/images/placeholder.png'; 
                total += price * quantity;
                cartItemsContainer.innerHTML += `
                    <div class="flex items-center justify-between mb-4 pb-4 border-b">
                        <img src="${image}" alt="${name}" class="w-16 h-16 object-cover rounded-md">
                        <div class="flex-grow mx-3">
                            <p class="font-semibold">${name}</p>
                            <p class="text-sm text-gray-600">${formatCurrency(price)}</p>
                        </div>
                        <div class="flex items-center">
                            <button data-id="${item._id}" class="quantity-change-btn decrease-btn px-2">-</button>
                            <span class="mx-2">${quantity}</span>
                            <button data-id="${item._id}" class="quantity-change-btn increase-btn px-2">+</button>
                        </div>
                        <button data-id="${item._id}" class="remove-from-cart-btn ml-4 text-red-500 text-2xl font-light leading-none">&times;</button>
                    </div>`;
            });
        }
        cartTotalEl.textContent = formatCurrency(total);
        const totalItems = cart.reduce((sum, item) => {
            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
            return sum + quantity;
        }, 0);
        if (cartCountEl) cartCountEl.textContent = totalItems;
        if (cartCountMobileEl) cartCountMobileEl.textContent = totalItems;
        saveCart();
    };

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

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
            if (currentPage > 3) {
                paginationControls.appendChild(createEllipsis());
            }
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);
            for (let i = startPage; i <= endPage; i++) {
                paginationControls.appendChild(createButton(i, i, false, i === currentPage));
            }
            if (currentPage < totalPages - 2) {
                paginationControls.appendChild(createEllipsis());
            }
            paginationControls.appendChild(createButton(totalPages, totalPages, false, currentPage === totalPages));
        }
        paginationControls.appendChild(createButton('&gt;', currentPage + 1, currentPage === totalPages));
    }

    const addToCart = (product) => {
        if (!product) return;
        const cartItem = cart.find(item => item._id === product._id);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        renderCart();
        if (cartSidebar) cartSidebar.classList.remove('translate-x-full');
    };

    const changeQuantity = (productId, change) => {
        const cartItem = cart.find(item => item._id === productId);
        if (cartItem) {
            cartItem.quantity += change;
            if (cartItem.quantity <= 0) {
                removeFromCart(productId);
            } else {
                renderCart();
            }
        }
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item._id !== productId);
        renderCart();
    };
    
    // 4. GẮN CÁC SỰ KIỆN
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const button = e.target;
                const product = allProducts.find(p => p._id === button.dataset.id);
                addToCart(product);
            }
        });
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            const productId = button.dataset.id;
            if (button.classList.contains('increase-btn')) changeQuantity(productId, 1);
            if (button.classList.contains('decrease-btn')) changeQuantity(productId, -1);
            if (button.classList.contains('remove-from-cart-btn')) removeFromCart(productId);
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
    
    const openCartSidebar = () => {
        if (cartSidebar) {
            cartSidebar.classList.remove('translate-x-full');
        }
    };
    
    if (cartButton) cartButton.addEventListener('click', openCartSidebar);
    if (cartButtonMobile) cartButtonMobile.addEventListener('click', openCartSidebar);

    if (closeCartBtn) closeCartBtn.addEventListener('click', () => cartSidebar.classList.add('translate-x-full'));
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => cart.length > 0 ? checkoutModal.classList.remove('hidden') : alert('Giỏ hàng trống!'));
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => checkoutModal.classList.add('hidden'));

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const customerData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value
            };
            if (!customerData.name || !customerData.phone || !customerData.address) {
                alert('Vui lòng điền đầy đủ thông tin đặt hàng.');
                return;
            }
            const orderData = {
                customer: customerData,
                items: cart.map(item => ({ 
                    productId: item._id, 
                    name: item.ten_hang, 
                    image: item.hinh_anh, 
                    price: item.gia_ban, 
                    quantity: item.quantity 
                }))
            };
            submitOrder(orderData);
        });
    }

    // 5. KHỞI CHẠY ỨNG DỤNG
    if(productGrid) {
        fetchProducts(1, 'all');
        renderCategoryFilters();
    }
    renderCart();

    const params = new URLSearchParams(window.location.search);
    if (params.get('openCart') === 'true') {
        if (cartSidebar) {
            cartSidebar.classList.remove('translate-x-full');
        }
    }
});