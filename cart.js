document.addEventListener("DOMContentLoaded", function () {
    updateCartHeader();
    updateCartPage();

    // Add to Cart Event (Works on Shop & Product Details Page)
    document.addEventListener("click", function (event) {
        let addBtn = event.target.closest(".add-to-cart");
        if (addBtn) {
            event.preventDefault();

            let product = null;
            let productElement = addBtn.closest(".product-wrap"); // Shop Page

            if (productElement) {
                // 🛒 Get product details from shop page
                product = {
                    id: productElement.dataset.id,
                    name: productElement.querySelector("h4 a").innerText,
                    price: parseFloat(productElement.querySelector(".product-price span").innerText.replace("Ksh", "").trim()),
                    image: productElement.querySelector(".product-img img").src,
                    quantity: 1
                };
            } else {
                // 🛍 Get product details from product details page
                let productId = getProductIdFromURL() || addBtn.dataset.id;
                let productNameElem = document.getElementById("product-name");
                let productPriceElem = document.getElementById("product-price");
                let productImageElem = document.getElementById("product-image");
                let quantityInput = document.querySelector(".cart-plus-minus-box");

                if (productId && productNameElem && productPriceElem && productImageElem) {
                    product = {
                        id: productId,
                        name: productNameElem.textContent.trim(),
                        price: parseFloat(productPriceElem.textContent.replace("Ksh", "").trim()),
                        image: productImageElem.src,
                        quantity: parseInt(quantityInput?.value || 1, 10)
                    };
                }
            }

            if (product) {
                addToCart(product);
            }
        }
    });

    // Remove from Cart Event
    document.addEventListener("click", function (event) {
        let removeBtn = event.target.closest(".remove-from-cart");
        if (removeBtn) {
            event.preventDefault();
            let prodId = removeBtn.dataset.id;
            removeFromCart(prodId);
        }
    });

    // Update Quantity in Cart
    document.addEventListener("input", function (event) {
        if (event.target.matches(".cart-quantity")) {
            let prodId = event.target.dataset.id;
            let newQty = parseInt(event.target.value);
            updateCartQuantity(prodId, newQty);
        }
    });

    // Clear Cart Event
    document.addEventListener("click", function (event) {
        if (event.target.matches("#clear-cart")) {
            event.preventDefault();
            clearCart();
        }
    });
});

// ----------------- Cart Functions -----------------

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += product.quantity;
    } else {
        cart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartHeader();
    updateCartPage();
}

// Remove Product from Cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let updatedCart = cart.filter(item => item.id !== productId);

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    updateCartHeader();
    updateCartPage();
}

// Update Product Quantity in Cart
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

// Clear the Entire Cart
function clearCart() {
    localStorage.removeItem("cart");
    updateCartHeader();
    updateCartPage();
}

// ----------------- UI Update Functions -----------------

// Update Cart Info in Header
function updateCartHeader() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Select all elements for desktop & mobile cart
    let cartCountElems = document.querySelectorAll("#cart-count");
    let cartListElems = document.querySelectorAll("#cart-items-list");
    let cartTotalElems = document.querySelectorAll("#cart-total");

    let totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    let totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCountElems.forEach(elem => {
        elem.textContent = `${totalQuantity} Items`;
    });

    cartListElems.forEach(cartListElem => {
        cartListElem.innerHTML = "";
        cart.forEach(item => {
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
    });

    cartTotalElems.forEach(elem => {
        elem.textContent = `Ksh ${totalAmount.toFixed(2)}`;
    });
}

// Update Cart Page
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

// Helper function to get product ID from URL
function getProductIdFromURL() {
    let params = new URLSearchParams(window.location.search);
    return params.get("id") || null;
}

// Ensure Cart Header Updates on Every Page Load
document.addEventListener("DOMContentLoaded", updateCartHeader);
