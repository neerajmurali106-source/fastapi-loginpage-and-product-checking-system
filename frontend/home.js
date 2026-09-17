async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("This browser does not support notifications.");
        return;
    }

    if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log("Notifications allowed");
        }
    }
}
// =========================
// LOAD PRODUCTS
// =========================

async function loadProducts() {

    try {

        const response = await fetch("/products");

        const products = await response.json();

        const table = document.getElementById("products");

        table.innerHTML = "";


        if (products.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="6">
                        No products found.
                    </td>
                </tr>
            `;

            return;
        }


        products.forEach(product => {

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>${product.id}</td>

                <td class="product-name">
                    ${product.name}
                </td>

                <td>
                    ${product.description}
                </td>

                <td class="price">
                    ₹${product.price}
                </td>

                <td>
                    ${product.quantity}
                </td>

                <td>

                    <button
                        class="action-button"
                        onclick="editProduct(${product.id})"
                    >
                        Edit
                    </button>

                </td>

            `;

            table.appendChild(row);

        });

    }

    catch (error) {

        console.error(error);

        document.getElementById("products").innerHTML = `

            <tr>

                <td colspan="6">
                    Could not load products.
                </td>

            </tr>

        `;

    }

}



// =========================
// ADD PRODUCT
// =========================

async function addProduct() {

    const name =
        document.getElementById("productName").value.trim();

    const description =
        document.getElementById("productDescription").value.trim();

    const price =
        document.getElementById("productPrice").value;

    const quantity =
        document.getElementById("productQuantity").value;

    const message =
        document.getElementById("addMessage");


    if (!name) {

        message.textContent = "Please enter product name.";

        return;

    }


    if (!description) {

        message.textContent = "Please enter description.";

        return;

    }


    if (price === "" || Number(price) < 0) {

        message.textContent = "Please enter a valid price.";

        return;

    }


    if (quantity === "" || Number(quantity) < 0) {

        message.textContent = "Please enter a valid quantity.";

        return;

    }


    try {

        const response = await fetch(
            "/products",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: name,

                    description: description,

                    price: Number(price),

                    quantity: Number(quantity)

                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            message.textContent =
                data.detail || "Could not add product.";

            return;

        }


        message.textContent =
            "Product added successfully.";


        document.getElementById("productName").value = "";

        document.getElementById("productDescription").value = "";

        document.getElementById("productPrice").value = "";

        document.getElementById("productQuantity").value = "";


        loadProducts();

    }

    catch (error) {

        console.error(error);

        message.textContent =
            "Could not connect to server.";

    }

}



// =========================
// EDIT PRODUCT
// =========================

async function editProduct(productId) {

    const rows =
        document.querySelectorAll("#products tr");


    for (const row of rows) {

        const firstCell = row.querySelector("td");


        if (!firstCell) {
            continue;
        }


        if (Number(firstCell.textContent) !== productId) {
            continue;
        }


        const cells = row.querySelectorAll("td");


        const name =
            cells[1].textContent.trim();

        const description =
            cells[2].textContent.trim();

        const price =
            cells[3].textContent
                .replace("₹", "")
                .trim();

        const quantity =
            cells[4].textContent.trim();


        row.innerHTML = `

            <td>
                ${productId}
            </td>

            <td>

                <input
                    class="edit-input"
                    id="edit-name-${productId}"
                    value="${name}"
                >

            </td>

            <td>

                <input
                    class="edit-input"
                    id="edit-description-${productId}"
                    value="${description}"
                >

            </td>

            <td>

                <input
                    class="edit-input"
                    type="number"
                    id="edit-price-${productId}"
                    value="${price}"
                >

            </td>

            <td>

                <input
                    class="edit-input"
                    type="number"
                    id="edit-quantity-${productId}"
                    value="${quantity}"
                >

            </td>

            <td>

                <button
                    class="action-button"
                    onclick="saveProduct(${productId})"
                >
                    Save
                </button>

                <button
                    class="action-button"
                    onclick="loadProducts()"
                >
                    Cancel
                </button>

            </td>

        `;

    }

}



// =========================
// SAVE PRODUCT
// =========================

async function saveProduct(productId) {

    const name =
        document.getElementById(
            `edit-name-${productId}`
        ).value.trim();


    const description =
        document.getElementById(
            `edit-description-${productId}`
        ).value.trim();


    const price =
        document.getElementById(
            `edit-price-${productId}`
        ).value;


    const quantity =
        document.getElementById(
            `edit-quantity-${productId}`
        ).value;


    try {

        const response = await fetch(
            `/products/${productId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: name,

                    description: description,

                    price: Number(price),

                    quantity: Number(quantity)

                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Could not update product."
            );

            return;

        }


        loadProducts();

    }

    catch (error) {

        console.error(error);

        alert("Could not connect to server.");

    }

}



// =========================
// SHOW PURCHASE FORM
// =========================

function showPurchaseForm() {

    const section =
        document.getElementById(
            "purchase-section"
        );


    section.style.display = "block";


    section.scrollIntoView({
        behavior: "smooth"
    });


    document.getElementById(
        "purchaseStatus"
    ).textContent = "";

}



// =========================
// CANCEL PURCHASE
// =========================

function cancelPurchase() {

    const section =
        document.getElementById(
            "purchase-section"
        );


    section.style.display = "none";


    document.getElementById(
        "purchaseUsername"
    ).value = "";


    document.getElementById(
        "purchaseProductName"
    ).value = "";


    document.getElementById(
        "purchaseDescription"
    ).value = "";


    document.getElementById(
        "purchasePrice"
    ).value = "";


    document.getElementById(
        "purchaseQuantity"
    ).value = "1";


    document.getElementById(
        "purchaseStatus"
    ).textContent = "";

}



// =========================
// CREATE PURCHASE
// =========================

async function confirmPurchase() {

    const username =
        document.getElementById(
            "purchaseUsername"
        ).value.trim();


    const productName =
        document.getElementById(
            "purchaseProductName"
        ).value.trim();


    const description =
        document.getElementById(
            "purchaseDescription"
        ).value.trim();


    const price =
        document.getElementById(
            "purchasePrice"
        ).value;


    const quantity =
        document.getElementById(
            "purchaseQuantity"
        ).value;


    const status =
        document.getElementById(
            "purchaseStatus"
        );


    // VALIDATION

    if (!username) {

        status.textContent =
            "Please enter your username.";

        return;

    }


    if (!productName) {

        status.textContent =
            "Please enter the product name.";

        return;

    }


    if (!description) {

        status.textContent =
            "Please enter the description.";

        return;

    }


    if (
        price === "" ||
        Number(price) < 0
    ) {

        status.textContent =
            "Please enter a valid price.";

        return;

    }


    if (
        quantity === "" ||
        Number(quantity) <= 0
    ) {

        status.textContent =
            "Please enter a valid quantity.";

        return;

    }


    try {

        status.textContent =
            "Submitting purchase request...";


        const response = await fetch(
            "/purchases",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    username: username,

                    product_name: productName,

                    description: description,

                    price: Number(price),

                    quantity: Number(quantity)

                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            status.textContent =
                data.detail ||
                "Purchase request failed.";

            return;

        }


        status.textContent =
            "Purchase request created successfully.";


        // Clear form

        document.getElementById(
            "purchaseProductName"
        ).value = "";


        document.getElementById(
            "purchaseDescription"
        ).value = "";


        document.getElementById(
            "purchasePrice"
        ).value = "";


        document.getElementById(
            "purchaseQuantity"
        ).value = "1";


        // Load purchase status

        loadPurchases();


    }

    catch (error) {

        console.error(error);

        status.textContent =
            "Could not connect to server.";

    }

}



/// =========================
// LOAD PURCHASES
// =========================

async function loadPurchases() {
    try {
        const response = await fetch("/purchases");
        const purchases = await response.json();

        const container = document.getElementById("purchase-list");
        container.innerHTML = "";

        if (purchases.length === 0) {
            container.innerHTML = `
                <p class="no-purchases">
                    No purchase requests yet.
                </p>
            `;
            return;
        }

        purchases.forEach(purchase => {
            const card = document.createElement("div");
            card.className = "purchase-card";

            let isDelayed = false;

            if (
                purchase.status === "Pending" &&
                purchase.created_at
            ) {
                const createdDate = new Date(purchase.created_at);
                const currentDate = new Date();

                const difference =
                    currentDate - createdDate;

                const daysPassed =
                    difference / (1000 * 60 * 60 * 24);

                if (daysPassed >= 20) {
                    isDelayed = true;
                }
            }

            if (purchase.status === "Pending") {

                card.innerHTML = `
                    <div class="purchase-info">

                        <span class="purchase-item-name">
                            📦 ${purchase.product_name}
                        </span>

                        <span class="purchase-quantity">
                            Qty: ${purchase.quantity}
                        </span>

                        <span class="status-pending">
                            Pending
                        </span>

                        <button
                            class="arrived-button"
                            onclick="markArrived(${purchase.id})"
                        >
                            Arrived
                        </button>

                        ${
                            isDelayed
                                ? `
                                    <span class="item-delayed">
                                        Item Delayed
                                    </span>
                                  `
                                : ""
                        }

                    </div>
                `;

            } else {

                card.innerHTML = `
                    <div class="purchase-info">

                        <span class="purchase-item-name">
                            📦 ${purchase.product_name}
                        </span>

                        <span class="purchase-quantity">
                            Qty: ${purchase.quantity}
                        </span>

                        <span class="status-arrived">
                            Arrived
                        </span>

                        <button
                            class="delete-button"
                            onclick="deletePurchase(${purchase.id})"
                            title="Delete purchase"
                        >
                            🗑
                        </button>

                    </div>
                `;
            }

            container.appendChild(card);
        });

    } catch (error) {

        console.error(error);

        document.getElementById("purchase-list").innerHTML = `
            <p class="no-purchases">
                Could not load purchase requests.
            </p>
        `;
    }
}


// =========================
// MARK AS ARRIVED
// =========================

async function markArrived(purchaseId) {

    try {

        const response = await fetch(
            `/purchases/${purchaseId}/arrived`,
            {
                method: "PUT"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Could not update purchase status."
            );

            return;
        }


        // Reload the purchase list
        // This removes the Arrived button
        // and displays Arrived status

        await loadPurchases();

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not connect to server."
        );

    }

}

// =========================
// DELETE PURCHASE
// =========================

async function deletePurchase(purchaseId) {

    const confirmed = confirm(
        "Delete this purchase?"
    );


    if (!confirmed) {

        return;

    }


    try {

        const response = await fetch(
            `/purchases/${purchaseId}`,
            {
                method: "DELETE"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Could not delete purchase."
            );

            return;
        }


        // Reload purchase list

        await loadPurchases();

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not connect to server."
        );

    }

}

// =========================
// CHECK 20-DAY PURCHASES
// =========================

async function checkOverduePurchases() {
    try {
        const response = await fetch("/purchases/overdue");

        if (!response.ok) {
            console.error("Could not check overdue purchases");
            return;
        }

        const overduePurchases = await response.json();

        overduePurchases.forEach(purchase => {

            new Notification("📦 Purchase Reminder", {
                body: `"${purchase.product_name}" has been pending for 20 days.`
            });

        });

    } catch (error) {
        console.error("Overdue purchase check failed:", error);
    }
}




// =========================
// PAGE LOAD
// =========================

loadProducts();

loadPurchases();

