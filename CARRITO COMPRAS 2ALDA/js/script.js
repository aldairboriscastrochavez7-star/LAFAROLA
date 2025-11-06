// Funcionalidad del carrito
let cart = [];
let selectedColor = null;
let cartItems = document.getElementById('cartItems');
let cartTotal = document.getElementById('cartTotal');

// Elementos DOM
const cartToggle = document.getElementById('cartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const overlay = document.getElementById('overlay');
const cartCount = document.getElementById('cartCount');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const checkoutBtn = document.getElementById('checkoutBtn');

// Inicializar la aplicación
function init() {
    loadCart();
    setupEventListeners();
    updateCartUI();
}

// Configurar oyentes de eventos
function setupEventListeners() {
    cartToggle.addEventListener('click', toggleCart);
    cartSidebar.addEventListener('click', toggleCart);
    overlay.addEventListener('click', toggleCart);

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCartHandler);
    });

    document.querySelectorAll('.color-option').forEach(button => {
        button.addEventListener('click', selectColor);
    });

    checkoutBtn.addEventListener('click', checkout);
}

// Activar o desactivar la visibilidad del carrito
function toggleCart() {
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}

// Manejar la selección de color
function selectColor(e) {
    const colorButton = e.target;
    colorButton.parentElement.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('active'));
    colorButton.classList.add('active');
    selectedColor = colorButton.getAttribute('data-color');
}

// Agregar artículo al carrito
function addToCartHandler(e) {
    const button = e.target;
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));
    const color = selectedColor || button.getAttribute('data-color') || 'default';

    if (!id || !name || isNaN(price)) {
        console.error('Datos del artículo incompletos');
        return;
    }

    addToCart(id, name, price, color);
}

function addToCart(id, name, price, color) {
    const item = { id, name, price, color, quantity: 1 };
    const existingItemIndex = cart.findIndex(item => item.id === id && item.color === color);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push(item);
    }

    updateCartUI();
    saveCart();
}

// Guardar carrito y actualizar la interfaz
function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('shoppingCart');
    cart = savedCart ? JSON.parse(savedCart) : [];
}

// Renderizar artículos del carrito
function renderCartItems() {
    if (!cartItems) {
        console.error('Elemento cartItems no encontrado');
        return;
    }

    cartItems.innerHTML = '';
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="https://placeholder-image-service.onrender.com/image?size=60x60&type=product&id=${item.id}&thumbnailId=thumb-${item.id}" alt="Miniatura de ${item.name}">
            </div>
            <div class="cart-item-details">
                <span class="item-name">${item.name}</span>
                <div class="item-color" style="background-color: ${item.color}"></div>
                <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                <button class="quantity-btn decrease" data-id="${item.id}" data-color="${item.color}">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}" data-color="${item.color}">
                <button class="quantity-btn increase" data-id="${item.id}" data-color="${item.color}">+</button>
                <button class="remove-item" data-id="${item.id}" data-color="${item.color}">Eliminar</button>
            </div>
        `;
        cartItems.appendChild(cartItemElement);
    });

    // Agregar detectores de eventos a los controles de cantidad
    document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const color = this.getAttribute('data-color');
            const item = cart.find(item => item.id === id && item.color === color);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                updateQuantity(id, color, item.quantity);
            }
        });
    });

    document.querySelectorAll('.quantity-btn.increase').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const color = this.getAttribute('data-color');
            const item = cart.find(item => item.id === id && item.color === color);
            if (item) {
                item.quantity += 1;
                updateQuantity(id, color, item.quantity);
            }
        });
    });

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const color = this.getAttribute('data-color');
            removeCartItem(id, color);
        });
    });
}

// Actualizar cantidad de artículo
function updateQuantity(id, color, newQuantity) {
    const item = cart.find(item => item.id === id && item.color === color);
    if (item) {
        item.quantity = newQuantity;
        updateCartUI();
    }
}

// Eliminar artículo del carrito
function removeCartItem(id, color) {
    const itemIndex = cart.findIndex(item => item.id === id && item.color === color);
    if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
        updateCartUI();
    }
}

// Actualizar la interfaz de usuario del carrito
function updateCartUI() {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    renderCartItems();
    updateCartTotal();

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
    } else {
        emptyCartMessage.style.display = 'none';
    }
}

// Actualizar total
function updateCartTotal() {
    if (!cartTotal) {
        console.error('Elemento cartTotal no encontrado');
        return;
    }
    cartTotal.textContent = `$${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}`;
}

// Función checkout
function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega algunos productos antes de finalizar tu compra.');
    } else {
        alert('Compra realizada con éxito. Gracias por tu compra!');
        cart = [];
        updateCartUI();
        saveCart();
    }
}

// Mostrar notificación
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        opacity: 1;
        transition: opacity 0.3s, transform 0.3s;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Inicializar la aplicación cuando se carga el DOM
document.addEventListener('DOMContentLoaded', init);