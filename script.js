let cart = JSON.parse(localStorage.getItem("cart")) || [];

const discordBuyLink =
    "https://discordapp.com/channels/1530386963364843632/1530837263158743080/1531283430321553550";


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


function updateCartCount() {

    const countElement = document.getElementById("cart-count");

    if (!countElement) return;

    let count = 0;

    cart.forEach(product => {
        count += product.quantity;
    });

    countElement.textContent = count;
}


function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }

    window.location.href = "checkout.html";
}


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
   DISCORD ORDER
========================= */

function placeOrder() {

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }

    let orderText = "🛒 **NEW ORDER**%0A%0A";

    let total = 0;

    cart.forEach(product => {

        const productTotal = product.price * product.quantity;

        total += productTotal;

        orderText +=
            `• ${product.name} × ${product.quantity} — €${productTotal.toFixed(2)}%0A`;
    });

    orderText += `%0A💰 **Total: €${total.toFixed(2)}**`;

    /*
     * We bewaren de bestelling lokaal.
     * Zo kan de informatie beschikbaar blijven wanneer
     * de klant terugkomt op de website.
     */

    localStorage.setItem(
        "lastOrder",
        JSON.stringify({
            products: cart,
            total: total
        })
    );

    /*
     * Open het Rimpllee Buy-ticketpaneel.
     */

    window.open(discordBuyLink, "_blank");

    /*
     * Laat de klant weten wat hij moet doen.
     */

    setTimeout(() => {

        alert(
            "Your order is ready!\\n\\n" +
            "Discord will open. Click the 💵 Buy button in our ticket panel and send the order details shown on this page."
        );

    }, 500);
}


displayCart();
updateCartCount();
displayCheckout();
