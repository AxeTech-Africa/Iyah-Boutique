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
                    quantity: 1,
                    size: "Not Selected",
                    color: "Not Selected"
                };
            } else {
                // 🛍 Get product details from product details page
                let productId = getProductIdFromURL() || addBtn.dataset.id;
                let productNameElem = document.getElementById("product-name");
                let productPriceElem = document.getElementById("product-price");
                let productImageElem = document.getElementById("product-image");
                let quantityInput = document.querySelector(".cart-plus-minus-box");

                // ✅ NEW CODE TO GET SELECTED SIZE & COLOR
                let selectedSizeElem = document.querySelector("#product-size .selected");
                let selectedColorElem = document.querySelector("#product-color .selected");

                let size = selectedSizeElem ? selectedSizeElem.textContent.trim() : "Not Selected";
                let color = selectedColorElem ? selectedColorElem.textContent.trim() : "Not Selected";

                if (productId && productNameElem && productPriceElem && productImageElem) {
                    product = {
                        id: productId + "-" + size + "-" + color, // Unique ID for variations
                        name: productNameElem.textContent.trim(),
                        price: parseFloat(productPriceElem.textContent.replace("Ksh", "").trim()),
                        image: productImageElem.src,
                        quantity: parseInt(quantityInput?.value || 1, 10),
                        size: size,
                        color: color
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
                        <span>Size: ${item.size}, Color: ${item.color}</span><br>
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
                    <td class="product-size">${item.size}</td>
                    <td class="product-color">${item.color}</td>
                    <td class="product-price-cart"><span class="amount">Ksh ${item.price}</span></td>
                    <td class="product-quantity">
                        <input class="cart-quantity" type="number" value="${item.quantity}" data-id="${item.id}" min="1">
                    </td>
                    <td class="product-subtotal">Ksh ${subtotal.toFixed(2)}</td>
                    <td class="product-remove">
                        <a href="#" class="remove-from-cart" data-id="${item.id}"><i class="la la-trash"></i></a>
                    </td>
                </tr>
            `;
        });

        if (cartPageTotalElem) {
            cartPageTotalElem.textContent = `Ksh ${total.toFixed(2)}`;
        }
    }
}

// Load Cart Items into Checkout Page
function loadCartItems() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let orderSummary = document.getElementById('order-summary');
    let grandTotal = document.getElementById('grandTotal');

    orderSummary.innerHTML = '';
    let totalAmount = 0;

    cart.forEach((item) => {
        let itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        orderSummary.innerHTML += `
    <ul>
        <li>${item.name} (Size: ${item.size}, Color: ${item.color}) x${item.quantity} 
            <span>Ksh ${itemTotal}</span>
        </li>
    </ul>`;
    });

    grandTotal.innerText = `Ksh ${totalAmount}`;
}

document.addEventListener('DOMContentLoaded', loadCartItems);


// Helper function to get product ID from URL
function getProductIdFromURL() {
    let params = new URLSearchParams(window.location.search);
    return params.get("id") || null;
}

// Ensure Cart Header Updates on Every Page Load
document.addEventListener("DOMContentLoaded", updateCartHeader);


document.addEventListener("DOMContentLoaded", function () {
    // Get the product ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    // Load the products JSON file
    fetch("products.json")
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id == productId);
            if (!product) return;

            // Clean and extract available sizes
            const availableSizes = product.sizes
                .replace(/\(cm\)/gi, "") // Remove (cm)
                .split(",") // Split by comma
                .map(size => size.trim());

            // Get all size elements and disable unavailable ones
            document.querySelectorAll("#product-size ul li").forEach(sizeEl => {
                const sizeText = sizeEl.textContent.trim();
                if (!availableSizes.includes(sizeText)) {
                    sizeEl.classList.add("disabled");
                } else {
                    sizeEl.classList.remove("disabled"); // Ensure available sizes are not disabled
                }
            });

            // Clean and extract available colors
            const availableColors = product.colors
                .split(",") // Split by comma
                .map(color => color.trim().toLowerCase()); // Trim spaces and normalize case

            // Get all color elements and disable unavailable ones
            document.querySelectorAll("#product-color ul li").forEach(colorEl => {
                const colorText = colorEl.textContent.trim().toLowerCase();
                if (!availableColors.includes(colorText)) {
                    colorEl.classList.add("disabled");
                } else {
                    colorEl.classList.remove("disabled"); // Ensure available colors are not disabled
                }
            });
        })
        .catch(error => console.error("Error loading products:", error));
});

