document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Admin script loaded and running.');

    // --- 1. KHAI BÁO BIẾN VÀ LẤY DOM ELEMENTS ---
    const ADMIN_PASSWORD = "admin";
    let currentProductPage = 1;

    // Login
    const loginSection = document.getElementById('admin-login');
    const dashboardSection = document.getElementById('admin-dashboard');
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('password-input');

    // Tabs
    const adminTabs = document.getElementById('admin-tabs');
    const productTabContent = document.getElementById('products-tab-content');
    const orderTabContent = document.getElementById('orders-tab-content');
    const categoriesTabContent = document.getElementById('categories-tab-content');

    // Tables
    const productsTableBody = document.getElementById('products-table-body');
    const categoriesTableBody = document.getElementById('categories-table-body');
    const ordersTableBody = document.getElementById('orders-table-body');
    const productPaginationControls = document.getElementById('product-pagination-controls');

    // Product Modal
    const addProductBtn = document.getElementById('add-product-btn');
    const productModal = document.getElementById('product-modal');
    const productForm = document.getElementById('product-form');
    const closeModalBtn = document.getElementById('close-product-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    
    // Category Modal
    const addCategoryBtn = document.getElementById('add-category-btn');
    const categoryModal = document.getElementById('category-modal');
    const categoryForm = document.getElementById('category-form');
    const closeCategoryModalBtn = document.getElementById('close-category-modal-btn');
    const categoryModalTitle = document.getElementById('category-modal-title');
    const categoryDisplayNameInput = document.getElementById('category-display-name');
    const categorySlugInput = document.getElementById('category-slug');

    // Excel
    const importExcelBtn = document.getElementById('import-excel-btn');
    const importExcelInput = document.getElementById('import-excel-input');
    const downloadTemplateBtn = document.getElementById('download-template-btn');

    // --- 2. CÁC HÀM HELPER ---
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return '0 đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    function generateSlug(str) {
        str = str.toLowerCase().trim();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/[^a-z0-9\s-]/g, '');
        str = str.replace(/\s+/g, '-');
        str = str.replace(/-+/g, '-');
        return str;
    }

    async function fetchData(url) {
        try {
            const response = await fetch(`http://localhost:8000${url}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Lỗi khi tải dữ liệu từ ${url}:`, error);
            return null;
        }
    }

    async function sendData(url, method, data) {
        try {
            const response = await fetch(`http://localhost:8000${url}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: data ? JSON.stringify(data) : null,
            });
            if (!response.ok && response.status !== 204) {
                const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            console.error(`Lỗi khi gửi dữ liệu đến ${url}:`, error);
            alert(`Thao tác thất bại: ${error.message}`);
            return null;
        }
    }

    // --- 3. CÁC HÀM RENDER ---
    const renderProductsTable = async (page = 1) => {
        if (!productsTableBody) return;
        const data = await fetchData(`/api/products?page=${page}&limit=10`);
        const products = data ? data.products : [];
        currentProductPage = data ? data.currentPage : 1;
        productsTableBody.innerHTML = '';

        if (!products || products.length === 0) {
            productsTableBody.innerHTML = '<tr><td colspan="7" class="text-center p-6 text-gray-500">Chưa có sản phẩm nào.</td></tr>';
        } else {
            products.forEach(p => {
                productsTableBody.innerHTML += `
                    <tr class="border-b hover:bg-gray-100">
                        <td class="px-5 py-4 text-sm text-gray-800 hidden sm:table-cell">${p.ma_hang}</td>
                        <td class="px-5 py-4 text-sm">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 w-12 h-12">
                                    <img class="w-full h-full rounded-md object-cover" src="${p.hinh_anh}" alt="${p.ten_hang}">
                                </div>
                                <div class="ml-3">
                                    <p class="text-gray-900 font-semibold whitespace-no-wrap">${p.ten_hang}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-5 py-4 text-sm text-gray-700 hidden lg:table-cell">${p.thuong_hieu}</td>
                        <td class="px-5 py-4 text-sm text-gray-700 hidden md:table-cell">${p.danh_muc}</td>
                        <td class="px-5 py-4 text-sm text-green-600 font-semibold">${formatCurrency(p.gia_ban)}</td>
                        <td class="px-5 py-4 text-sm text-center font-semibold hidden sm:table-cell">${p.ton_kho}</td>
                        <td class="px-5 py-4 text-sm">
                            <button data-id="${p._id}" class="edit-product-btn text-yellow-600 hover:text-yellow-800 font-medium mr-3">Sửa</button>
                            <button data-id="${p._id}" class="delete-product-btn text-red-600 hover:text-red-800 font-medium">Xóa</button>
                        </td>
                    </tr>`;
            });
        }
        if (data) renderProductPagination(data.totalPages, data.currentPage);
    };

    const renderCategoriesTable = async () => {
        if (!categoriesTableBody) return;
        const categories = await fetchData('/api/categories');
        categoriesTableBody.innerHTML = '';
        if (!categories || categories.length === 0) {
            categoriesTableBody.innerHTML = '<tr><td colspan="3" class="text-center p-6 text-gray-500">Chưa có danh mục nào.</td></tr>';
        } else {
            categories.forEach(cat => {
                categoriesTableBody.innerHTML += `
                    <tr class="border-b hover:bg-gray-100">
                        <td class="px-5 py-4 text-sm font-semibold text-gray-900">${cat.name}</td>
                        <td class="px-5 py-4 text-sm text-gray-700">${cat.slug}</td>
                        <td class="px-5 py-4 text-sm">
                            <button data-id="${cat._id}" data-name="${cat.name}" data-slug="${cat.slug}" class="edit-category-btn text-yellow-600 hover:text-yellow-800 font-medium mr-3">Sửa</button>
                            <button data-id="${cat._id}" class="delete-category-btn text-red-600 hover:text-red-800 font-medium">Xóa</button>
                        </td>
                    </tr>`;
            });
        }
    };

    const renderOrdersTable = async () => {
        if (!ordersTableBody) return;
        const data = await fetchData('/api/orders');
        const orders = Array.isArray(data) ? data : [];
        ordersTableBody.innerHTML = '';
        if (orders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="5" class="text-center p-6 text-gray-500">Chưa có đơn hàng nào.</td></tr>';
        } else {
            orders.forEach(order => {
                const customerName = order.customer ? order.customer.name : 'N/A';
                const customerPhone = order.customer ? order.customer.phone : 'N/A';
                const customerAddress = order.customer ? order.customer.address : 'Chưa có thông tin';
                const productsList = Array.isArray(order.items) ? order.items.map(item => `<li class="text-sm">${item.name || 'sản phẩm không xác định'} (SL: ${item.quantity})</li>`).join('') : '';
                const row = `<tr class="border-b hover:bg-gray-100 align-top">
                                <td class="px-5 py-4"><p class="font-semibold text-gray-900">${customerName}</p><p class="text-sm text-gray-600">${customerPhone}</p></td>
                                <td class="px-5 py-4 text-sm text-gray-700 hidden sm:table-cell">${customerAddress}</td>
                                <td class="px-5 py-4 text-sm"><ul class="list-disc list-inside">${productsList}</ul></td>
                                <td class="px-5 py-4 font-bold text-blue-600">${formatCurrency(order.total_price)}</td>
                                <td class="px-5 py-4 text-sm text-gray-600 hidden md:table-cell">${new Date(order.order_date).toLocaleString('vi-VN')}</td>
                             </tr>`;
                ordersTableBody.innerHTML += row;
            });
        }
    };

    function renderProductPagination(totalPages, currentPage) {
        if (!productPaginationControls) return;
        productPaginationControls.innerHTML = '';
        if (totalPages <= 1) return;
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.dataset.page = i;
            pageButton.className = (i === currentPage) ? 'px-4 py-2 text-white bg-blue-600 rounded-md shadow-md' : 'px-4 py-2 text-gray-700 bg-white rounded-md shadow-md hover:bg-gray-100';
            productPaginationControls.appendChild(pageButton);
        }
    }

    async function populateCategoryDropdown() {
        const selectElement = document.getElementById('product-danh-muc');
        if (!selectElement) return;
        const categories = await fetchData('/api/categories');
        selectElement.innerHTML = '';
        if (categories && Array.isArray(categories)) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.slug;
                option.textContent = category.name;
                selectElement.appendChild(option);
            });
        }
    }

    // --- 4. CÁC HÀM XỬ LÝ LOGIC ---
    function initializeTinyMCE(content = '') {
        if (tinymce.get('product-mo-ta')) {
            tinymce.get('product-mo-ta').setContent(content);
        } else {
            tinymce.init({
                selector: 'textarea#product-mo-ta',
                plugins: 'autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount',
                toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | indent outdent | bullist numlist | code | help',
                height: 300,
                setup: function(editor) {
                    editor.on('init', function() {
                        editor.setContent(content);
                    });
                }
            });
        }
    }

    function switchTab(activeTab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('text-blue-600', 'border-blue-600', 'font-semibold');
        });
        const activeBtn = document.querySelector(`.tab-btn[data-tab="${activeTab}"]`);
        if(activeBtn) activeBtn.classList.add('text-blue-600', 'border-blue-600', 'font-semibold');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        const activeContent = document.getElementById(`${activeTab}-tab-content`);
        if(activeContent) activeContent.classList.remove('hidden');
    }

    function exportSampleExcel() { /* Giữ nguyên không đổi */ }
    function readExcelFile(file) { /* Giữ nguyên không đổi */ }

    // --- 5. GẮN CÁC SỰ KIỆN ---

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (passwordInput && passwordInput.value === ADMIN_PASSWORD) {
                loginSection.classList.add('hidden');
                dashboardSection.classList.remove('hidden');
                switchTab('products');
                renderProductsTable(1);
                renderOrdersTable();
                renderCategoriesTable();
            } else {
                alert('Mật khẩu không chính xác!');
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' && loginBtn) loginBtn.click();
        });
    }

    if(adminTabs) {
        adminTabs.addEventListener('click', (e) => {
            const tabButton = e.target.closest('.tab-btn');
            if (tabButton && tabButton.dataset.tab) {
                switchTab(tabButton.dataset.tab);
            }
        });
    }

    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            console.log("[DEBUG] 'Add Product' button clicked");
            productForm.reset();
            document.getElementById('product-id').value = '';
            modalTitle.textContent = "Thêm sản phẩm mới";
            initializeTinyMCE('');
            populateCategoryDropdown();
            productModal.classList.remove('hidden');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => productModal.classList.add('hidden'));
    }

    if (importExcelBtn) {
        importExcelBtn.addEventListener('click', () => {
            console.log("[DEBUG] 'Import Excel' button clicked");
            if(importExcelInput) importExcelInput.click();
        });
    }
    
    if (importExcelInput) {
        importExcelInput.addEventListener('change', (e) => readExcelFile(e.target.files[0]));
    }
    
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', exportSampleExcel);
    }
    
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('product-id').value;
            const moTaChiTiet = tinymce.get('product-mo-ta') ? tinymce.get('product-mo-ta').getContent() : '';
            const productData = {
                ma_hang: document.getElementById('product-ma-hang').value,
                ten_hang: document.getElementById('product-ten-hang').value,
                thuong_hieu: document.getElementById('product-thuong-hieu').value,
                danh_muc: document.getElementById('product-danh-muc').value,
                gia_ban: parseFloat(document.getElementById('product-gia-ban').value),
                ton_kho: parseInt(document.getElementById('product-ton-kho').value, 10),
                hinh_anh: document.getElementById('product-hinh-anh').value,
                mo_ta_chi_tiet: moTaChiTiet,
            };
            const response = id ? await sendData(`/api/products/${id}`, 'PUT', productData) : await sendData('/api/products', 'POST', productData);
            if (response) {
                await renderProductsTable(id ? currentProductPage : 1);
                productModal.classList.add('hidden');
            }
        });
    }

    if (productsTableBody) {
        productsTableBody.addEventListener('click', async (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            const productId = button.dataset.id;
            if (button.classList.contains('delete-product-btn')) {
                if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                    const response = await sendData(`/api/products/${productId}`, 'DELETE');
                    if (response) await renderProductsTable(currentProductPage);
                }
            } else if (button.classList.contains('edit-product-btn')) {
                const productToEdit = await fetchData(`/api/products/${productId}`);
                if (productToEdit) {
                    modalTitle.textContent = "Chỉnh sửa sản phẩm";
                    document.getElementById('product-id').value = productToEdit._id;
                    document.getElementById('product-ma-hang').value = productToEdit.ma_hang;
                    document.getElementById('product-ten-hang').value = productToEdit.ten_hang;
                    document.getElementById('product-thuong-hieu').value = productToEdit.thuong_hieu;
                    document.getElementById('product-gia-ban').value = productToEdit.gia_ban;
                    document.getElementById('product-ton-kho').value = productToEdit.ton_kho;
                    document.getElementById('product-hinh-anh').value = productToEdit.hinh_anh;
                    await populateCategoryDropdown();
                    document.getElementById('product-danh-muc').value = productToEdit.danh_muc;
                    initializeTinyMCE(productToEdit.mo_ta_chi_tiet || '');
                    productModal.classList.remove('hidden');
                }
            }
        });
    }
    
    if(addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
             categoryForm.reset();
             document.getElementById('category-id').value = '';
             categoryModalTitle.textContent = "Thêm Danh mục Mới";
             categoryModal.classList.remove('hidden');
        });
    }
    
    if(closeCategoryModalBtn) {
        closeCategoryModalBtn.addEventListener('click', () => categoryModal.classList.add('hidden'));
    }

    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('category-id').value;
            const categoryData = {
                name: document.getElementById('category-display-name').value.trim(),
                slug: document.getElementById('category-slug').value.trim().toLowerCase(),
            };
            if(!categoryData.name || !categoryData.slug) return alert('Vui lòng điền đầy đủ Tên hiển thị và Slug.');
            const response = id ? await sendData(`/api/categories/${id}`, 'PUT', categoryData) : await sendData('/api/categories', 'POST', categoryData);
            if(response) {
                await renderCategoriesTable();
                await populateCategoryDropdown();
                categoryModal.classList.add('hidden');
            }
        });
    }
    
    if (categoriesTableBody) {
        categoriesTableBody.addEventListener('click', async (e) => {
            const button = e.target.closest('button');
            if(!button) return;
            const categoryId = button.dataset.id;
            if (button.classList.contains('delete-category-btn')) {
                if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
                    const response = await sendData(`/api/categories/${categoryId}`, 'DELETE');
                    if (response) {
                        await renderCategoriesTable();
                        await populateCategoryDropdown();
                    }
                }
            } else if (button.classList.contains('edit-category-btn')) {
                categoryForm.reset();
                categoryModalTitle.textContent = "Chỉnh sửa Danh mục";
                document.getElementById('category-id').value = categoryId;
                document.getElementById('category-display-name').value = button.dataset.name;
                document.getElementById('category-slug').value = button.dataset.slug;
                categoryModal.classList.remove('hidden');
            }
        });
    }
    
    if (categoryDisplayNameInput) {
        categoryDisplayNameInput.addEventListener('input', () => {
            const categoryId = document.getElementById('category-id').value;
            if (!categoryId) { // Chỉ tự động tạo slug khi thêm mới
                 categorySlugInput.value = generateSlug(categoryDisplayNameInput.value);
            }
        });
    }
    
    if (productPaginationControls) {
        productPaginationControls.addEventListener('click', (e) => {
            const pageButton = e.target.closest('button[data-page]');
            if (pageButton) {
                const page = parseInt(pageButton.dataset.page, 10);
                if (page !== currentProductPage) renderProductsTable(page);
            }
        });
    }
});