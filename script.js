// ============================
// Global Variables
// ============================
let wishlist = JSON.parse(localStorage.getItem('kartini-wishlist')) || [];
let currentTheme = localStorage.getItem('kartini-theme') || 'light';

// ============================
// Theme Toggle Functionality
// ============================
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('kartini-theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.innerHTML = currentTheme === 'light' ? '🌙' : '☀️'; 
        themeBtn.setAttribute('aria-label', currentTheme === 'light' ? 'Тъмна тема' : 'Светла тема');
    }
}

// ============================
// Wishlist Functionality
// ============================
function toggleWishlist(productId, productTitle, productSize, productImage) {
    const index = wishlist.findIndex(item => item.id === productId);
    
    if (index > -1) {
        // Remove from wishlist
        wishlist.splice(index, 1);
        showNotification(`"${productTitle}" беше премахната от любими ❤️`);
    } else {
        // Add to wishlist
        wishlist.push({
            id: productId,
            title: productTitle,
            size: productSize,
            image: productImage,
            addedAt: new Date().toISOString()
        });
        showNotification(`"${productTitle}" беше добавена в любими ❤️`);
    }
    
    localStorage.setItem('kartini-wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
    updateWishlistCount();
}

function isInWishlist(productId) {
    return wishlist.some(item => item.id === productId);
}

function updateWishlistUI() {
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
        const productId = btn.getAttribute('data-product-id');
        if (isInWishlist(productId)) {
            btn.classList.add('active');
            btn.innerHTML = '❤️';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '♡';
        }
    });
}

function updateWishlistCount() {
    const countElement = document.getElementById('wishlist-count');
    if (countElement) {
        countElement.textContent = wishlist.length;
        countElement.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
}

function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================
// Filter & Sort Functionality
// ============================
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.querySelector('.sort-select');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Toggle active state
            const filterGroup = this.closest('.filter-group');
            filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Apply filters
            applyFilters();
        });
    });
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
}

function applyFilters() {
    const products = document.querySelectorAll('.product-card');
    const activeFilters = {};
    
    // Get all active filters
    document.querySelectorAll('.filter-group').forEach(group => {
        const activeBtn = group.querySelector('.filter-btn.active');
        const groupName = group.querySelector('h4').textContent.toLowerCase();
        const filterValue = activeBtn.textContent.trim().toLowerCase();
        
        if (filterValue !== 'всички') {
            activeFilters[groupName] = filterValue;
        }
    });
    
    // Filter products
    let visibleCount = 0;
    products.forEach(product => {
        let shouldShow = true;
        
        // Check each filter
        for (const [filterType, filterValue] of Object.entries(activeFilters)) {
            const productData = product.getAttribute(`data-${filterType}`);
            if (productData && !productData.toLowerCase().includes(filterValue)) {
                shouldShow = false;
                break;
            }
        }
        
        if (shouldShow) {
            product.style.display = '';
            visibleCount++;
        } else {
            product.style.display = 'none';
        }
    });
    
    // Update count
    updateProductCount(visibleCount);
}

function sortProducts(sortType) {
    const grid = document.querySelector('.products-grid');
    const products = Array.from(grid.querySelectorAll('.product-card'));
    
    products.sort((a, b) => {
        const titleA = a.querySelector('.product-title').textContent;
        const titleB = b.querySelector('.product-title').textContent;
        
        switch(sortType) {
            case 'Име А-Я':
                return titleA.localeCompare(titleB, 'bg');
            case 'Име Я-А':
                return titleB.localeCompare(titleA, 'bg');
            case 'Популярни':
                // Sort by badge (популярно, ново, trending)
                const badgeA = a.querySelector('.product-badge')?.textContent || '';
                const badgeB = b.querySelector('.product-badge')?.textContent || '';
                return badgeB.localeCompare(badgeA);
            default: // Най-нови
                return 0;
        }
    });
    
    // Re-append sorted products
    products.forEach(product => grid.appendChild(product));
}

function updateProductCount(count) {
    const countElement = document.querySelector('.section-header-inline .count');
    if (countElement) {
        countElement.textContent = `(${count})`;
    }
}

// ============================
// Quick View Modal
// ============================
let currentModalProduct = null;

function openQuickView(productCard) {
    const title = productCard.querySelector('.product-title').textContent;
    const description = productCard.querySelector('.product-description').textContent;
    const size = productCard.querySelector('.product-size').textContent;
    const finish = productCard.querySelector('.product-finish').textContent;
    const imageSvg = productCard.querySelector('.product-image-placeholder').innerHTML;
    const productId = productCard.querySelector('.btn-wishlist').getAttribute('data-product-id');
    
    currentModalProduct = {
        id: productId,
        title: title,
        size: size,
        image: imageSvg
    };
    
    // Create modal
    const modal = document.getElementById('quick-view-modal');
    modal.querySelector('.modal-product-image').innerHTML = imageSvg;
    modal.querySelector('.modal-product-title').textContent = title;
    modal.querySelector('.modal-product-description').textContent = description;
    modal.querySelector('.modal-product-size').textContent = size;
    modal.querySelector('.modal-product-finish').textContent = finish;
    
    // Update wishlist button
    const wishlistBtn = modal.querySelector('.modal-btn-wishlist');
    if (isInWishlist(productId)) {
        wishlistBtn.classList.add('active');
        wishlistBtn.innerHTML = '❤️ В любими';
    } else {
        wishlistBtn.classList.remove('active');
        wishlistBtn.innerHTML = '♡ Добави в любими';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentModalProduct = null;
}

function toggleModalWishlist() {
    if (currentModalProduct) {
        toggleWishlist(
            currentModalProduct.id,
            currentModalProduct.title,
            currentModalProduct.size,
            currentModalProduct.image
        );
        
        // Update modal button
        const wishlistBtn = document.querySelector('.modal-btn-wishlist');
        if (isInWishlist(currentModalProduct.id)) {
            wishlistBtn.classList.add('active');
            wishlistBtn.innerHTML = '❤️ В любими';
        } else {
            wishlistBtn.classList.remove('active');
            wishlistBtn.innerHTML = '♡ Добави в любими';
        }
    }
}

// ============================
// Lazy Loading for Images
// ============================
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ============================
// Smooth Scroll
// ============================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================
// Mobile Menu Toggle
// ============================
function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
}

// ============================
// Gallery Category Filter (Home Page)
// ============================
function initGalleryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.textContent.trim().toLowerCase();
            
            // Filter gallery items
            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if (category === 'всички' || itemCategory === category) {
                    item.style.display = '';
                    setTimeout(() => item.style.opacity = '1', 10);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => item.style.display = 'none', 300);
                }
            });
        });
    });
}

// ============================
// Initialize Everything
// ============================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Initialize wishlist UI
    updateWishlistUI();
    updateWishlistCount();
    
    // Initialize filters and sorting
    initFilters();
    
    // Initialize lazy loading
    initLazyLoading();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize gallery filters (for home page)
    initGalleryFilters();
    
    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Quick view buttons - Navigate to product page
    document.querySelectorAll('.btn-quick-view').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            if (productId) {
                window.location.href = `/pages/product.html?id=${productId}`;
            }
        });
    });
    
    // Modal close buttons
    const modalCloseBtn = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeQuickView);
    if (modalOverlay) modalOverlay.addEventListener('click', closeQuickView);
    
    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeQuickView();
    });
    
    // Wishlist buttons
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            const productId = this.getAttribute('data-product-id');
            const productTitle = productCard.querySelector('.product-title').textContent;
            const productSize = productCard.querySelector('.product-size').textContent;
            const productImage = productCard.querySelector('.product-image-placeholder').innerHTML;
            
            toggleWishlist(productId, productTitle, productSize, productImage);
        });
    });
    
    // Modal wishlist button
    const modalWishlistBtn = document.querySelector('.modal-btn-wishlist');
    if (modalWishlistBtn) {
        modalWishlistBtn.addEventListener('click', toggleModalWishlist);
    }
    
    // Add scroll effect to header
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Load head component
    loadHead();
    
    // Load footer component
    loadFooter();
    
    // Load header component
    loadHeader();
    
    console.log('✅ Картини.top - JavaScript initialized successfully!');
});

// ============================
// Head Component Loader
// ============================
async function loadHead() {
    const headPlaceholder = document.getElementById('head-placeholder');
    if (!headPlaceholder) return;
    
    try {
        // Determine the correct path based on current location
        const currentPath = window.location.pathname;
        const isInSubfolder = currentPath.includes('/pages/') || currentPath.includes('/categories/');
        const headPath = isInSubfolder ? '../components/head_meta.html' : 'components/head_meta.html';
        
        const response = await fetch(headPath);
        if (response.ok) {
            const headHTML = await response.text();
            headPlaceholder.innerHTML = headHTML;
            
            // Fix stylesheet path for main page
            if (!isInSubfolder) {
                const styleLink = document.querySelector('link[href="../styles.css"]');
                if (styleLink) {
                    styleLink.setAttribute('href', 'styles.css');
                }
            }
        } else {
            console.error('Head не може да бъде зареден');
        }
    } catch (error) {
        console.error('Грешка при зареждане на head:', error);
    }
}

// ============================
// Header Component Loader
// ============================
async function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;
    
    try {
        // Determine the correct path based on current location
        const currentPath = window.location.pathname;
        const isInSubfolder = currentPath.includes('/pages/') || currentPath.includes('/categories/');
        const headerPath = isInSubfolder ? '../components/header_menu.html' : 'components/header_menu.html';
        
        const response = await fetch(headerPath);
        if (response.ok) {
            const headerHTML = await response.text();
            headerPlaceholder.innerHTML = headerHTML;
            
            // Fix links for main page (index.html)
            if (!isInSubfolder) {
                // Main page - fix all links
                headerPlaceholder.querySelectorAll('a[href^="../"]').forEach(link => {
                    let href = link.getAttribute('href');
                    // Remove ../ prefix for main page
                    href = href.replace(/^\.\.\//, '');
                    // Fix index.html references
                    if (href.includes('index.html')) {
                        href = href.replace('index.html', '');
                    }
                    link.setAttribute('href', href);
                });
                
                // Fix logo link
                const logoLink = headerPlaceholder.querySelector('.logo a');
                if (logoLink) {
                    logoLink.setAttribute('href', '#home');
                }
            }
            
            // Re-initialize event listeners after header is loaded
            initHeaderEventListeners();
        } else {
            console.error('Header не може да бъде зареден');
        }
    } catch (error) {
        console.error('Грешка при зареждане на header:', error);
    }
}

// Initialize header event listeners
function initHeaderEventListeners() {
    // Wishlist button
    const wishlistBtn = document.getElementById('wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', toggleModalWishlist);
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    
    if (hamburger && mobileMenu && mobileMenuOverlay) {
        // Toggle menu when hamburger clicked
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when overlay clicked
        mobileMenuOverlay.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Close menu when any menu link clicked
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    
    // Update wishlist count
    updateWishlistCount();
}

// ============================
// Footer Component Loader
// ============================
async function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;
    
    try {
        // Determine the correct path based on current location
        const currentPath = window.location.pathname;
        const isInSubfolder = currentPath.includes('/pages/') || currentPath.includes('/categories/');
        const footerPath = isInSubfolder ? '../components/footer.html' : 'components/footer.html';
        
        const response = await fetch(footerPath);
        if (response.ok) {
            const footerHTML = await response.text();
            footerPlaceholder.innerHTML = footerHTML;
            
            // Fix links for pages in subfolders
            if (isInSubfolder) {
                footerPlaceholder.querySelectorAll('a[href^="#"]').forEach(link => {
                    const href = link.getAttribute('href');
                    link.setAttribute('href', '../index.html' + href);
                });
            }
        } else {
            console.error('Footer не може да бъде зареден');
        }
    } catch (error) {
        console.error('Грешка при зареждане на footer:', error);
    }
}

// ============================
// Helper Functions
// ============================

// Generate unique ID for products
function generateProductId(title) {
    return title.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// Auto-assign product IDs on page load
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.product-card').forEach((card, index) => {
        const title = card.querySelector('.product-title').textContent;
        const productId = generateProductId(title) + '-' + index;
        const wishlistBtn = card.querySelector('.btn-wishlist');
        if (wishlistBtn && !wishlistBtn.getAttribute('data-product-id')) {
            wishlistBtn.setAttribute('data-product-id', productId);
        }
    });
});

// ============================
// Blog Functionality
// ============================
let blogArticles = [];
let currentBlogPage = 1;
const articlesPerPage = 6;

// Load blog articles from JSON
async function loadBlogArticles() {
    try {
        const currentPath = window.location.pathname;
        const isInSubfolder = currentPath.includes('/pages/');
        const blogDataPath = isInSubfolder ? '../components/blog-data.json' : 'components/blog-data.json';
        
        const response = await fetch(blogDataPath);
        if (response.ok) {
            const blogData = await response.json();
            blogArticles = blogData.articles;
            
            // Display blog grid if on blog page
            if (document.getElementById('blogGrid')) {
                displayBlogArticles(blogArticles);
                setupBlogFilters();
            }
            
            // Display featured article
            if (document.getElementById('featuredArticle')) {
                displayFeaturedArticle();
            }
        }
    } catch (error) {
        console.error('Грешка при зареждане на блог статиите:', error);
    }
}

// Display blog articles in grid
function displayBlogArticles(articles) {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;
    
    const startIndex = (currentBlogPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const paginatedArticles = articles.slice(startIndex, endIndex);
    
    blogGrid.innerHTML = '';
    
    paginatedArticles.forEach(article => {
        const articleCard = document.createElement('article');
        articleCard.className = 'blog-card';
        articleCard.innerHTML = `
            <div class="blog-card-image">
                <div class="blog-card-placeholder">
                    ${getCategoryIcon(article.category)}
                </div>
                <span class="blog-card-category">${article.category}</span>
            </div>
            <div class="blog-card-content">
                <h3 class="blog-card-title">${article.title}</h3>
                <p class="blog-card-excerpt">${article.excerpt}</p>
                <div class="blog-card-meta">
                    <span class="blog-author">${article.author}</span>
                    <span class="blog-date">${new Date(article.date).toLocaleDateString('bg-BG')}</span>
                    <span class="blog-read-time">${article.readTime} мин</span>
                </div>
                <a href="blog-article.html?id=${article.id}" class="blog-read-more">Прочети повече →</a>
            </div>
        `;
        blogGrid.appendChild(articleCard);
    });
    
    setupBlogPagination(articles.length);
}

// Setup blog filters
function setupBlogFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('blogSearch');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            const filtered = filter === 'all' 
                ? blogArticles 
                : blogArticles.filter(a => a.category.toLowerCase() === filter);
            
            currentBlogPage = 1;
            displayBlogArticles(filtered);
        });
    });
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const search = this.value.toLowerCase();
            const filtered = blogArticles.filter(a => 
                a.title.toLowerCase().includes(search) || 
                a.excerpt.toLowerCase().includes(search)
            );
            
            currentBlogPage = 1;
            displayBlogArticles(filtered);
        });
    }
}

// Setup pagination
function setupBlogPagination(totalArticles) {
    const pagination = document.getElementById('blogPagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(totalArticles / articlesPerPage);
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '← Предишна';
    prevBtn.disabled = currentBlogPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentBlogPage > 1) {
            currentBlogPage--;
            displayBlogArticles(blogArticles);
        }
    });
    pagination.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn' + (i === currentBlogPage ? ' active' : '');
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentBlogPage = i;
            displayBlogArticles(blogArticles);
        });
        pagination.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Следваща →';
    nextBtn.disabled = currentBlogPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentBlogPage < totalPages) {
            currentBlogPage++;
            displayBlogArticles(blogArticles);
        }
    });
    pagination.appendChild(nextBtn);
}

// Display featured article
function displayFeaturedArticle() {
    const featured = blogArticles.find(a => a.featured);
    if (!featured) return;
    
    const featuredSection = document.getElementById('featuredArticle');
    if (!featuredSection) return;
    
    featuredSection.innerHTML = `
        <div class="featured-card">
            <div class="featured-image">
                <div class="featured-placeholder">
                    ${getCategoryIcon(featured.category)}
                </div>
            </div>
            <div class="featured-content">
                <h3 class="featured-title">${featured.title}</h3>
                <p class="featured-excerpt">${featured.excerpt}</p>
                <div class="featured-meta">
                    <span>${featured.author}</span>
                    <span>${new Date(featured.date).toLocaleDateString('bg-BG')}</span>
                </div>
                <a href="blog-article.html?id=${featured.id}" class="btn-primary">Прочети статията</a>
            </div>
        </div>
    `;
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'Дизайн': '🎨',
        'Совети': '💡',
        'Вдъхновение': '✨',
        'Тренди': '📈'
    };
    return icons[category] || '📝';
}

// Newsletter subscription
function setupNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            // TODO: Integrate with email service
            alert('Благодарим за абонамента! Ще ти изпратим нови статии по имейл.');
            this.reset();
        });
    }
}

// ============================
// Product Sorting - New Products First
// ============================
function sortNewProductsFirst() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    const productCards = Array.from(productsGrid.querySelectorAll('.product-card'));
    
    // Sort products: products with "Ново" badge first
    productCards.sort((a, b) => {
        const aIsNew = a.querySelector('.product-badge')?.textContent.includes('Ново') ? 1 : 0;
        const bIsNew = b.querySelector('.product-badge')?.textContent.includes('Ново') ? 1 : 0;
        return bIsNew - aIsNew; // New products first
    });
    
    // Re-append sorted products
    productCards.forEach(card => {
        productsGrid.appendChild(card);
    });
}

// Initialize product sorting on page load
document.addEventListener('DOMContentLoaded', function() {
    sortNewProductsFirst();
    
    if (document.getElementById('blogGrid') || document.getElementById('featuredArticle')) {
        loadBlogArticles();
        setupNewsletter();
    }
});
