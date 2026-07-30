const discordBuyLink = "https://discordapp.com/channels/1530386963364843632/1530837263158743080/1531283430321553550";

let cart = JSON.parse(localStorage.getItem("cart")) || [];


/* =========================
   ADD TO CART
========================= */

function addToCart(name, price) {

    const existingProduct = cart.find(
        product => product.name === name
    );

    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({
            name: name,
            price: Number(price),
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
                <h3>${product.name}</h3>
                <p>€${Number(product.price).toFixed(2)} each</p>
            </div>

            <div class="quantity">

                <button
                    type="button"
                    onclick="changeQuantity('${product.name}', -1)">
                    −
                </button>

                <span>
                    ${product.quantity}
                </span>

                <button
                    type="button"
                    onclick="changeQuantity('${product.name}', 1)">
                    +
                </button>

            </div>

            <div class="cart-item-price">
                €${productTotal.toFixed(2)}
            </div>

            <button
                type="button"
                class="remove-btn"
                onclick="removeFromCart('${product.name}')">
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

    const notification = document.createElement("div");

    notification.className = "cart-notification";

    notification.innerHTML = `
        <div class="notification-icon">
            ✓
        </div>

        <div class="notification-content">
            <strong>Added to cart</strong>
            <span>${name}</span>
        </div>

        <a href="cart.html" class="notification-cart">
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

    }, 3000);
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
                    <h3>${product.name}</h3>

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

        alert(
            "Please fill in all your information."
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

        alert(
            "Something went wrong. Please try again."
        );

    }

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
