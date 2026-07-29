const discordBuyLink = "https://discordapp.com/channels/1530386963364843632/1530837263158743080/1531283430321553550";

let cart = [];

try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
} catch (error) {
    cart = [];
    localStorage.removeItem("cart");
}


/* =========================
   ADD TO CART
========================= */

function addToCart(name, price) {

    price = Number(price);

    if (!name || isNaN(price)) {
        console.error("Invalid product:", name, price);
        return;
    }

    const existingProduct = cart.find(
        product => product.name === name
    );

    if (existingProduct) {

        existingProduct.quantity += 1;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1
        });

    }

    saveCart();

    updateCartCount();

    showCartNotification(name);
}


/* =========================
   SAVE CART
========================= */

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );
}


/* =========================
   REMOVE
========================= */

function removeFromCart(name) {

    cart = cart.filter(
        product => product.name !== name
    );

    saveCart();

    displayCart();
    updateCartCount();
}


/* =========================
   QUANTITY
========================= */

function changeQuantity(name, amount) {

    const product = cart.find(
        product => product.name === name
    );

    if (!product) return;

    product.quantity += amount;

    if (product.quantity <= 0) {

        removeFromCart(name);
        return;

    }

    saveCart();

    displayCart();
    updateCartCount();
}


/* =========================
   CART DISPLAY
========================= */

function displayCart() {

    const container =
        document.getElementById("cart-items");

    const totalElement =
        document.getElementById("cart-total");

    if (!container) return;

    container.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Add a product from our shop.</p>
            </div>
        `;

        if (totalElement) {
            totalElement.textContent = "0.00";
        }

        return;
    }

    cart.forEach(product => {

        const productTotal =
            Number(product.price) *
            Number(product.quantity);

        total += productTotal;

        const item =
            document.createElement("div");

        item.className = "cart-item";

        item.innerHTML = `

            <div>
                <h3>${escapeHTML(product.name)}</h3>
                <p>€${Number(product.price).toFixed(2)} each</p>
            </div>

            <div class="quantity">

                <button
                    type="button"
                    onclick="changeQuantity('${escapeAttribute(product.name)}', -1)">
                    −
                </button>

                <span>${product.quantity}</span>

                <button
                    type="button"
                    onclick="changeQuantity('${escapeAttribute(product.name)}', 1)">
                    +
                </button>

            </div>

            <div class="cart-item-price">
                €${productTotal.toFixed(2)}
            </div>

            <button
                type="button"
                class="remove-btn"
                onclick="removeFromCart('${escapeAttribute(product.name)}')">
                🗑️
            </button>
        `;

        container.appendChild(item);
    });

    if (totalElement) {
        totalElement.textContent =
            total.toFixed(2);
    }
}


/* =========================
   CART COUNT
========================= */

function updateCartCount() {

    const countElement =
        document.getElementById("cart-count");

    if (!countElement) return;

    let count = 0;

    cart.forEach(product => {

        count += Number(product.quantity) || 0;

    });

    countElement.textContent = count;
}


/* =========================
   CHECKOUT
========================= */

function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty!");
        return;

    }

    window.location.href =
        "checkout.html";
}


/* =========================
   NOTIFICATION
========================= */

function showCartNotification(name) {

    const notification =
        document.createElement("div");

    notification.className =
        "cart-notification";

    notification.innerHTML = `

        <div class="notification-icon">
            ✓
        </div>

        <div>
            <strong>Added to cart</strong>
            <p>${escapeHTML(name)}</p>
        </div>

        <a href="cart.html">
            View Cart
        </a>

    `;

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.classList.add("show");

    }, 10);

    setTimeout(() => {

        notification.classList.remove("show");

        setTimeout(() => {

            notification.remove();

        }, 300);

    }, 3500);
}


/* =========================
   CHECKOUT DISPLAY
========================= */

function displayCheckout() {

    const container =
        document.getElementById("checkout-items");

    const totalElement =
        document.getElementById("checkout-total");

    if (!container || !totalElement) {
        return;
    }

    container.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Go back to the shop and add a product.</p>
            </div>
        `;

        totalElement.textContent =
            "0.00";

        return;
    }

    cart.forEach(product => {

        const productTotal =
            Number(product.price) *
            Number(product.quantity);

        total += productTotal;

        container.innerHTML += `

            <div class="checkout-item">

                <div>
                    <h3>${escapeHTML(product.name)}</h3>
                    <p>
                        Quantity: ${product.quantity}
                    </p>
                </div>

                <div class="checkout-item-price">
                    €${productTotal.toFixed(2)}
                </div>

            </div>

        `;
    });

    totalElement.textContent =
        total.toFixed(2);
}


/* =========================
   PLACE ORDER
========================= */

async function placeOrder() {

    if (cart.length === 0) {

        alert("Your cart is empty!");
        return;

    }

    const name =
        document
            .getElementById("customer-name")
            ?.value
            .trim();

    const email =
        document
            .getElementById("customer-email")
            ?.value
            .trim();

    const discord =
        document
            .getElementById("discord-name")
            ?.value
            .trim();

    if (!name || !email || !discord) {

        showOrderPopup(
            "Missing Information",
            "Please fill in all your information before placing your order.",
            null,
            false
        );

        return;
    }

    let total = 0;

    const products = cart.map(product => {

        const productTotal =
            Number(product.price) *
            Number(product.quantity);

        total += productTotal;

        return {

            name: product.name,

            quantity:
                Number(product.quantity),

            price:
                Number(product.price),

            total:
                productTotal

        };

    });

    const order = {

        name: name,

        email: email,

        discord: discord,

        products: products,

        total: total,

        date:
            new Date().toISOString()

    };

    try {

        const response =
            await fetch(
                "https://infinite-order-api.soren2159.workers.dev",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(order)
                }
            );

        if (!response.ok) {
            throw new Error(
                "Order failed"
            );
        }

        localStorage.setItem(
            "lastOrder",
            JSON.stringify(order)
        );

        window.location.href =
            "payment.html";

    } catch (error) {

        console.error(error);

        showOrderPopup(
            "Something went wrong",
            "We couldn't send your order. Please try again or contact us on Discord.",
            null,
            false
        );

    }
}


/* =========================
   POPUP
========================= */

function showOrderPopup(
    title,
    message,
    total,
    success
) {

    const oldPopup =
        document.querySelector(
            ".order-popup-overlay"
        );

    if (oldPopup) {
        oldPopup.remove();
    }

    const popup =
        document.createElement("div");

    popup.className =
        "order-popup-overlay";

    popup.innerHTML = `

        <div class="order-popup">

            <div class="order-popup-icon">
                ${success ? "✓" : "!"}
            </div>

            <h2>${title}</h2>

            <p>${message}</p>

            ${
                total !== null
                ? `
                    <div class="order-popup-total">

                        <span>
                            ORDER TOTAL
                        </span>

                        <strong>
                            €${Number(total).toFixed(2)}
                        </strong>

                    </div>
                `
                : ""
            }

            <div class="order-popup-buttons">

                ${
                    success
                    ? `
                        <button
                            type="button"
                            class="order-popup-discord"
                            onclick="window.open(discordBuyLink, '_blank')">
                            Continue to Discord
                        </button>
                    `
                    : ""
                }

                <button
                    type="button"
                    class="order-popup-close"
                    onclick="closeOrderPopup()">

                    ${success ? "Close" : "Try Again"}

                </button>

            </div>

        </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => {

        popup.classList.add("show");

    }, 10);
}


/* =========================
   CLOSE POPUP
========================= */

function closeOrderPopup() {

    const popup =
        document.querySelector(
            ".order-popup-overlay"
        );

    if (!popup) return;

    popup.classList.remove("show");

    setTimeout(() => {

        popup.remove();

    }, 300);
}


/* =========================
   SECURITY HELPERS
========================= */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(text) {

    return String(text)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        displayCart();
        updateCartCount();
        displayCheckout();

    }
);
