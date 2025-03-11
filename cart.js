document.addEventListener("DOMContentLoaded", function () {
    // Update header and cart page on load
    updateCartHeader();
    updateCartPage();

    // Global event delegation for Add to Cart button
    document.addEventListener("click", function (event) {
        // Check if the clicked element or one of its parents has the "add-to-cart" class
        let addBtn = event.target.closest(".add-to-cart");
        if (addBtn) {
            event.preventDefault();
            let productElement = addBtn.closest(".product-wrap");
            if (!productElement) return;

            // Get product details from the product card. Ensure your product-wrap has data-id attribute!
            let product = {
                id: productElement.dataset.id, // e.g., <div class="product-wrap" data-id="1">
                name: productElement.querySelector("h4 a").innerText,
                price: parseFloat(
                    productElement.querySelector(".product-price span").innerText
                        .replace("Ksh", "")
                        .trim()
                ),
                image: productElement.querySelector(".product-img img").src,
                quantity: 1
            };

            addToCart(product);
        }
    });

    // Global event delegation for Remove from Cart button (in header & cart page)
    document.addEventListener("click", function (event) {
        let removeBtn = event.target.closest(".remove-from-cart");
        if (removeBtn) {
            event.preventDefault();
            let prodId = removeBtn.dataset.id;
            removeFromCart(prodId);
        }
    });

    // Global event for quantity update in cart page
    document.addEventListener("input", function (event) {
        if (event.target.matches(".cart-quantity")) {
            let prodId = event.target.dataset.id;
            let newQty = parseInt(event.target.value);
            updateCartQuantity(prodId, newQty);
        }
    });

    // Global event for clearing cart (make sure the clear cart link has id="clear-cart")
    document.addEventListener("click", function (event) {
        if (event.target.matches("#clear-cart")) {
            event.preventDefault();
            clearCart();
        }
    });
});

// ----------------- Cart Functions -----------------

// Add product to cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    // Check if the product already exists (by unique id)
    let existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push(product);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartHeader();
    updateCartPage();
}

// Remove product from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartHeader();
    updateCartPage();
}

// Update product quantity in cart
function updateCartQuantity(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity = quantity > 0 ? quantity : 1;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartHeader();
    updateCartPage();
}

// Clear the entire cart
function clearCart() {
    localStorage.removeItem("cart");
    updateCartHeader();
    updateCartPage();
}

// ----------------- UI Update Functions -----------------

// Update the cart information in the header
function updateCartHeader() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartCountElem = document.getElementById("cart-count");
    let cartListElem = document.getElementById("cart-items-list");
    let cartTotalElem = document.getElementById("cart-total");

    // Count unique products (as per your requirement)
    let uniqueCount = cart.length;
    // For total quantity (if needed), you can do:
    // let totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCountElem) {
        cartCountElem.textContent = `${uniqueCount} Items`;
    }

    if (cartListElem) {
        cartListElem.innerHTML = "";
        let totalAmount = 0;
        cart.forEach(item => {
            let subtotal = item.price * item.quantity;
            totalAmount += subtotal;
            cartListElem.innerHTML += `
                <li class="single-shopping-cart">
                    <div class="shopping-cart-img">
                        <a href="#"><img src="${item.image}" alt="${item.name}"></a>
                    </div>
                    <div class="shopping-cart-title">
                        <h4><a href="#">${item.name}</a></h4>
                        <span>Ksh ${item.price} x ${item.quantity}</span>
                    </div>
                    <div class="shopping-cart-delete">
                        <a href="#" class="remove-from-cart" data-id="${item.id}"><i class="la la-trash"></i></a>
                    </div>
                </li>
            `;
        });
        if (cartTotalElem) {
            cartTotalElem.textContent = `Ksh ${totalAmount.toFixed(2)}`;
        }
    }
}

// Update the cart page table
function updateCartPage() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartTableBody = document.getElementById("cart-table-body");
    let cartPageTotalElem = document.getElementById("cart-page-total");

    if (cartTableBody) {
        cartTableBody.innerHTML = "";
        let total = 0;
        cart.forEach(item => {
            let subtotal = item.price * item.quantity;
            total += subtotal;
            cartTableBody.innerHTML += `
                <tr>
                    <td class="product-thumbnail"><a href="#"><img src="${item.image}" alt="${item.name}"></a></td>
                    <td class="product-name"><a href="#">${item.name}</a></td>
                    <td class="product-price-cart"><span class="amount">Ksh ${item.price}</span></td>
                    <td class="product-quantity">
                        <input class="cart-quantity" type="number" value="${item.quantity}" data-id="${item.id}" min="1">
                    </td>
                    <td class="product-subtotal">Ksh ${subtotal.toFixed(2)}</td>
                    <td class="product-remove">
                        <a href="#" class="remove-from-cart" data-id="${item.id}"><i class="la la-close"></i></a>
                    </td>
                </tr>
            `;
        });
        if (cartPageTotalElem) {
            cartPageTotalElem.textContent = `Ksh ${total.toFixed(2)}`;
        }
    }
}

// Ensure cart header updates on every page load
document.addEventListener("DOMContentLoaded", updateCartHeader);
