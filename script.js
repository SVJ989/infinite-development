let cart = JSON.parse(localStorage.getItem("cart")) || [];

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

    alert(name + " has been added to your cart!");

    updateCartCount();
}


function removeFromCart(name) {

    cart = cart.filter(product => product.name !== name);

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
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

        totalElement.textContent = "0.00";

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

    totalElement.textContent = total.toFixed(2);
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


displayCart();
updateCartCount();
