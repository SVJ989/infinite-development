```javascript
const discordBuyLink = "https://discordapp.com/channels/1530386963364843632/1530837263158743080/1531283430321553550";

let cart = JSON.parse(localStorage.getItem("cart")) || [];


/* =========================
   CART
========================= */

function addToCart(name, price) {

    const existingProduct = cart.find(product => product.name === name);

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    showCartNotification(name);
    updateCartCount();
}


function removeFromCart(name) {

    cart = cart.filter(product => product.name !== name);

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
    updateCartCount();
}


function changeQuantity(name, amount) {

    const product = cart.find(product => product.name === name);

    if (!product) return;

    product.quantity += amount;

    if (product.quantity <= 0) {
        removeFromCart(name);
        return;
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
    updateCartCount();
}


/* =========================
   DISPLAY CART
========================= */

function displayCart() {

    const container = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");

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

        const productTotal = product.price * product.quantity;

        total += productTotal;

        container.innerHTML += `
            <div class="cart-item">

                <div>
                    <h3>${product.name}</h3>
                    <p>€${product.price.toFixed(2)} each</p>
                </div>

                <div class="quantity">

                    <button onclick="changeQuantity('${product.name}', -1)">
                        −
                    </button>

                    <span>${product.quantity}</span>

                    <button onclick="changeQuantity('${product.name}', 1)">
                        +
                    </button>

                </div>

                <div class="cart-item-price">
                    €${productTotal.toFixed(2)}
                </div>

                <button
                    class="remove-btn"
                    onclick="removeFromCart('${product.name}')">
                    🗑️
                </button>

            </div>
        `;
    });

    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
    }
}


/* =========================
   CART COUNT
========================= */

function updateCartCount() {

    const countElement = document.getElementById("cart-count");

    if (!countElement) return;

    let count = 0;

    cart.forEach(product => {
        count += product.quantity;
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

    window.location.href = "checkout.html";
}


/* =========================
   CART NOTIFICATION
========================= */

function showCartNotification(name) {

    const notification = document.createElement("div");

    notification.className = "cart-notification";

    notification.innerHTML = `
        <div class="notification-icon">✓</div>

        <div>
            <strong>Added to cart</strong>
            <p>${name}</p>
        </div>

        <a href="cart.html">View Cart</a>
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

    const container = document.getElementById("checkout-items");
    const totalElement = document.getElementById("checkout-total");

    if (!container || !totalElement) return;

    container.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Go back to the shop and add a product.</p>
            </div>
        `;

        totalElement.textContent = "0.00";

        return;
    }

    cart.forEach(product => {

        const productTotal = product.price * product.quantity;

        total += productTotal;

        container.innerHTML += `
            <div class="checkout-item">

                <div>
                    <h3>${product.name}</h3>
                    <p>Quantity: ${product.quantity}</p>
                </div>

                <div class="checkout-item-price">
                    €${productTotal.toFixed(2)}
                </div>

            </div>
        `;
    });

    totalElement.textContent = total.toFixed(2);
}


/* =========================
   PLACE ORDER
========================= */

async function placeOrder() {

    if (cart.length === 0) {
        return;
    }

    const name =
        document.getElementById("customer-name")?.value.trim();

    const email =
        document.getElementById("customer-email")?.value.trim();

    const discord =
        document.getElementById("discord-name")?.value.trim();


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
    let products = [];


    cart.forEach(product => {

        const productTotal =
            product.price * product.quantity;

        total += productTotal;

        products.push({
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            total: productTotal
        });

    });


    const order = {

        name: name,
        email: email,
        discord: discord,

        products: products,

        total: total,

        date: new Date().toISOString()

    };


    try {

        const response = await fetch(
            "https://infinite-order-api.soren2159.workers.dev",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(order)
            }
        );


        if (!response.ok) {
            throw new Error("Order failed");
        }


        /* =========================
           GET ORDER NUMBER
        ========================= */

        const result = await response.json();


        if (!result.success || !result.orderNumber) {
            throw new Error("Order number missing");
        }


        /* =========================
           SAVE ORDER
        ========================= */

        order.orderNumber = result.orderNumber;


        localStorage.setItem(
            "lastOrder",
            JSON.stringify(order)
        );


        /* =========================
           GO TO PAYMENT
        ========================= */

        window.location.href = "payment.html";


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
   ORDER POPUP
========================= */

function showOrderPopup(
    title,
    message,
    total,
    success
) {

    const oldPopup =
        document.querySelector(".order-popup-overlay");

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

                        <span>ORDER TOTAL</span>

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
                            class="order-popup-discord"
                            onclick="window.open(discordBuyLink, '_blank')">

                            Continue to Discord

                        </button>
                    `
                    : ""
                }

                <button
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
        document.querySelector(".order-popup-overlay");

    if (!popup) return;

    popup.classList.remove("show");


    setTimeout(() => {

        popup.remove();

    }, 300);

}


/* =========================
   START
========================= */

displayCart();
updateCartCount();
displayCheckout();
```
