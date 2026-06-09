/**
 * Chinese Cuisine Project - Main Logic
 * Includes: Custom Modal System, Navigation Logic, Auth Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initModalSystem();
    checkLoginStatus(); // Check if user is logged in
    
    // Init Carousel if elements exist (moved logic here for safer execution)
    if(document.getElementById('heroCarousel')) {
        initCarousel();
    }
});

/* --- Custom Modal System --- */
// Elements
let modalOverlay;
let modalContainer;
let modalTitle;
let modalBody;
let modalActions;

function initModalSystem() {
    // Create Modal HTML Structure dynamically if it doesn't exist
    if (!document.querySelector('.modal-overlay')) {
        const modalHtml = `
            <div class="modal-overlay" id="customModal">
                <div class="modal-container">
                    <h3 class="modal-title" id="modalTitle">提示</h3>
                    <p class="modal-body" id="modalBody">内容</p>
                    <div class="modal-actions" id="modalActions">
                        <!-- Buttons injected via JS -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    modalOverlay = document.getElementById('customModal');
    modalContainer = modalOverlay.querySelector('.modal-container');
    modalTitle = document.getElementById('modalTitle');
    modalBody = document.getElementById('modalBody');
    modalActions = document.getElementById('modalActions');

    // Close on overlay click (optional, usually only for 'info' type)
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

/**
 * Show a custom alert modal
 * @param {string} title - The title of the modal
 * @param {string} message - The message body
 * @param {string} type - 'success', 'error', 'info', 'warning'
 */
function showModal(title, message, type = 'info') {
    modalTitle.textContent = title;
    modalBody.textContent = message;
    
    // Clear previous actions
    modalActions.innerHTML = '';

    // Create OK button
    const okBtn = document.createElement('button');
    okBtn.className = 'btn btn-primary';
    okBtn.textContent = '确定';
    okBtn.onclick = closeModal;

    modalActions.appendChild(okBtn);

    // Styling based on type (optional adjustments)
    if (type === 'error') {
        modalTitle.style.color = '#c0392b'; // specific red for error
    } else {
        modalTitle.style.color = 'var(--text-dark)';
    }

    openModal();
}

/**
 * Show a custom confirm modal
 * @param {string} title 
 * @param {string} message 
 * @param {function} onConfirm - Callback if user clicks 'Confirm'
 */
function showConfirm(title, message, onConfirm) {
    modalTitle.textContent = title;
    modalBody.textContent = message;
    
    modalActions.innerHTML = '';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-outline';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = closeModal;

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-primary';
    confirmBtn.textContent = '确定';
    confirmBtn.onclick = () => {
        closeModal();
        if (typeof onConfirm === 'function') onConfirm();
    };

    modalActions.appendChild(cancelBtn);
    modalActions.appendChild(confirmBtn);

    openModal();
}

function openModal() {
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
}


/**
 * Helper Validation Function
 * @param {string} selector - Input selector
 * @param {string} errorMsg - Error message to show
 * @returns {boolean} isValid
 */
function validateRequired(selector, errorMsg) {
    const input = document.querySelector(selector);
    const parent = input.parentElement;
    const existingError = parent.querySelector('.error-message');
    
    if (!input.value.trim()) {
        input.classList.add('error');
        if (existingError) {
            existingError.textContent = errorMsg;
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMsg;
            parent.appendChild(errorDiv);
        }
        return false;
    } else {
        input.classList.remove('error');
        if (existingError) existingError.remove();
        return true;
    }
}

/* --- Carousel Logic --- */
let slideIndex = 0;
let slides;
let dots;
let carouselInterval;

function initCarousel() {
    slides = document.querySelectorAll('.carousel-slide');
    const controls = document.getElementById('carouselControls');
    
    if (!slides.length || !controls) return;

    // Clear existing dots to prevent duplicates
    controls.innerHTML = '';

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => showSlide(index);
        controls.appendChild(dot);
    });
    
    dots = document.querySelectorAll('.carousel-dot');

    // Auto play
    startCarousel();
}

function showSlide(n) {
    // Wrap around
    if (n >= slides.length) slideIndex = 0;
    else if (n < 0) slideIndex = slides.length - 1;
    else slideIndex = n;

    // Update slides
    slides.forEach(slide => slide.classList.remove('active'));
    slides[slideIndex].classList.add('active');

    // Update dots
    dots.forEach(dot => dot.classList.remove('active'));
    dots[slideIndex].classList.add('active');
    
    resetTimer(); // Reset timer on manual interaction
}

function nextSlide() {
    showSlide(slideIndex + 1);
}

function startCarousel() {
    carouselInterval = setInterval(nextSlide, 5000); // 5 seconds
}

function resetTimer() {
    clearInterval(carouselInterval);
    startCarousel();
}

/* --- Auth Logic --- */
function checkLoginStatus() {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.username) {
                updateNavForLogin(user.username);
            }
        }
    } catch (e) {
        console.error('Error parsing user data', e);
    }
}

function updateNavForLogin(username) {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Remove Login/Register buttons
    const loginBtn = navLinks.querySelector('a[href="login.html"]');
    const registerBtn = navLinks.querySelector('a[href="register.html"]');
    if (loginBtn) loginBtn.remove();
    if (registerBtn) registerBtn.remove();

    // Remove any existing user info (in case of re-run)
    const existingUser = navLinks.querySelector('.user-info-span');
    if (existingUser) existingUser.remove();

    // Add User Info
    const userSpan = document.createElement('span');
    userSpan.className = 'user-info-span';
    userSpan.style.marginRight = '15px';
    userSpan.style.fontWeight = 'bold';
    userSpan.style.color = '#333';
    userSpan.textContent = `欢迎, ${username}`;

    // Add Logout Button
    const logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    logoutBtn.className = 'btn btn-outline';
    logoutBtn.style.padding = '5px 15px';
    logoutBtn.style.fontSize = '0.9rem';
    logoutBtn.style.borderWidth = '1px';
    logoutBtn.textContent = '退出';
    logoutBtn.onclick = logout;

    navLinks.appendChild(userSpan);
    navLinks.appendChild(logoutBtn);
}

function logout(e) {
    if(e) e.preventDefault();
    localStorage.removeItem('user');
    // localStorage.removeItem('token'); // If we were using tokens
    
    showModal('提示', '您已退出登录', 'info');
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}
