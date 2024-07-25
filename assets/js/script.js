document.addEventListener('DOMContentLoaded', () => {
    let cart = document.querySelector('.items__items');
    let orderCount = document.querySelector('.order__count');
    let orderItems = document.querySelector('.order__items');
    let orderDescription = document.querySelector('.order__des');
    let orderImage = document.querySelector('.order__image');
    let orderTotalSection = document.querySelector('.order__total-section');
    let totalPriceElement = document.querySelector('.total__price');
    let confirmOrderButton = document.querySelector('.confirm__order');
    let modal = document.getElementById('order-modal');
    let startNewOrderButton = document.getElementById('start-new-order');
    let orderDetails = document.querySelector('.order-details');
    let orderTotalElement = document.querySelector('.order-total .total__price');

    fetch("data.json")
        .then(res => res.json())
        .then(data => {
            cart.innerHTML = data.map(item => `
                <div class="items__cart" data-name="${item.name}">
                    <div class="cart__img">
                        <img src="${item.image.desktop}" alt="${item.name}">
                    </div>
                    <div class="cart__add" data-name="${item.name}" data-price="${item.price}" data-image="${item.image.desktop}">
                        <img src="./assets/images/icon-add-to-cart.svg" class="add-to" alt="add-to-cart">
                        <span class="add-to-des">Add to Cart</span>
                    </div>
                    <div class="cart__detail">
                        <div class="item__name">${item.category}</div>
                        <div class="item__description">${item.name}</div>
                        <div class="item__price">$${item.price.toFixed(2)}</div>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.add-to').forEach(button => {
                button.addEventListener('click', addToCart);
            });
        });

    function addToCart(event) {
        let button = event.target.closest('.add-to');
        if (!button) return;

        let name = button.parentElement.getAttribute('data-name');
        let price = parseFloat(button.parentElement.getAttribute('data-price'));
        let image = button.parentElement.getAttribute('data-image');

        if (!image) {
            console.error('Error: data-image attribute is null');
            return;
        }

        if (!orderItems) {
            console.error('Error: orderItems is null');
            return;
        }

        let existingItem = Array.from(orderItems.children).find(item => item.querySelector('.order__name').textContent === name);

        if (existingItem) {
            let countElement = existingItem.querySelector('.order__count');
            if (countElement) {
                let currentCount = parseInt(countElement.textContent.replace('x', ''), 10);
                currentCount++;
                countElement.textContent = `${currentCount}x`;

                let totalPriceElement = existingItem.querySelector('.total__price');
                if (totalPriceElement) {
                    totalPriceElement.textContent = `$${(price * currentCount).toFixed(2)}`;
                }
            }
        } else {
            let orderItem = document.createElement('div');
            orderItem.classList.add('order__item');
            orderItem.innerHTML = `
                <div class="order__img" style="display:none"><img src="${image}" alt="${name}"></div>
                <div class="order__name">${name}</div>
                <div class="order__details">
                    <div class="order__count">1x</div>
                    <div class="order__price">@$${price.toFixed(2)}</div>
                    <div class="total__price">$${price.toFixed(2)}</div>
                    <div class="order__del">
                        <img src="./assets/images/icon-remove-item.svg" alt="remove-item">
                    </div>
                </div>
            `;
            orderItem.querySelector('.order__del').addEventListener('click', () => removeFromCart(orderItem, name));
            orderItems.appendChild(orderItem);
        }

        let parentDiv = button.closest('.cart__add');
        parentDiv.innerHTML = `
            <div class="quantity-controls">
                <div class="decrease-quantity">-</div>
                <span class="item-quantity">1</span>
                <div class="increase-quantity">+</div>
            </div>
        `;

        parentDiv.querySelector('.increase-quantity').addEventListener('click', () => increaseQuantityFromCart(parentDiv, name, price));
        parentDiv.querySelector('.decrease-quantity').addEventListener('click', () => decreaseQuantityFromCart(parentDiv, name, price));

        let cartItem = parentDiv.closest('.items__cart');
        cartItem.classList.add('has-quantity-controls');

        updateOrderCount();
        updateOrderDescription();
        updateTotalPrice();
    }

    function removeFromCart(orderItem, name) {
        if (!orderItems) {
            console.error('Error: orderItems is null');
            return;
        }
        orderItems.removeChild(orderItem);

        let addToCartButton = document.querySelector(`.cart__add[data-name="${name}"]`);
        if (addToCartButton) {
            addToCartButton.innerHTML = `
                <img src="./assets/images/icon-add-to-cart.svg" class="add-to" alt="add-to-cart">
                <span class="add-to-des">Add to Cart</span>
            `;
            addToCartButton.querySelector('.add-to').addEventListener('click', addToCart);
        }

        let cartItem = addToCartButton ? addToCartButton.closest('.items__cart') : null;
        if (cartItem) {
            cartItem.classList.remove('has-quantity-controls');
        }

        updateOrderCount();
        updateOrderDescription();
        updateTotalPrice();
    }

    function increaseQuantityFromCart(parentDiv, name, price) {
        let quantityElement = parentDiv.querySelector('.item-quantity');
        if (!quantityElement) {
            console.error('Quantity element not found in parentDiv:', parentDiv);
            return;
        }
        let currentQuantity = parseInt(quantityElement.textContent, 10);
        currentQuantity++;
        quantityElement.textContent = currentQuantity;

        let existingItem = Array.from(orderItems.children).find(item => item.querySelector('.order__name').textContent === name);
        if (existingItem) {
            let countElement = existingItem.querySelector('.order__count');
            let totalPriceElement = existingItem.querySelector('.total__price');

            if (countElement && totalPriceElement) {
                countElement.textContent = `${currentQuantity}x`;
                totalPriceElement.textContent = `$${(price * currentQuantity).toFixed(2)}`;
            }
        } else {
            console.error('Order item not found for name:', name);
        }

        updateOrderCount();
        updateTotalPrice();
    }

    function decreaseQuantityFromCart(parentDiv, name, price) {
        let quantityElement = parentDiv.querySelector('.item-quantity');
        if (!quantityElement) {
            console.error('Quantity element not found in parentDiv:', parentDiv);
            return;
        }
        let currentQuantity = parseInt(quantityElement.textContent, 10);

        if (currentQuantity > 1) {
            currentQuantity--;
            quantityElement.textContent = currentQuantity;

            let existingItem = Array.from(orderItems.children).find(item => item.querySelector('.order__name').textContent === name);
            if (existingItem) {
                let countElement = existingItem.querySelector('.order__count');
                let totalPriceElement = existingItem.querySelector('.total__price');

                if (countElement && totalPriceElement) {
                    countElement.textContent = `${currentQuantity}x`;
                    totalPriceElement.textContent = `$${(price * currentQuantity).toFixed(2)}`;
                }
            } else {
                console.error('Order item not found for name:', name);
            }

            updateOrderCount();
            updateTotalPrice();
        }
    }

    function updateOrderCount() {
        if (!orderItems) {
            console.error('Error: orderItems is null');
            return;
        }
        let itemCount = Array.from(orderItems.children).reduce((total, item) => {
            let count = parseInt(item.querySelector('.order__count').textContent.replace('x', ''), 10);
            return total + count;
        }, 0);
        orderCount.textContent = itemCount;

        if (itemCount > 0) {
            orderTotalSection.style.display = 'flex';
        } else {
            orderTotalSection.style.display = 'none';
        }
    }

    function updateOrderDescription() {
        if (!orderItems || !orderDescription) {
            console.error('Error: orderItems or orderDescription is null');
            return;
        }
        let itemCount = orderItems.children.length;
        orderDescription.textContent = itemCount > 0 ? '' : 'Your added items will appear here';
        orderImage.style.display = itemCount > 0 ? 'none' : 'block';
    }

    function updateTotalPrice() {
        if (!orderItems || !totalPriceElement || !orderTotalElement) {
            console.error('Error: orderItems or totalPriceElement is null');
            return;
        }
        let total = Array.from(orderItems.children).reduce((sum, item) => {
            let priceText = item.querySelector('.total__price').textContent.replace('$', '');
            return sum + parseFloat(priceText);
        }, 0);
        totalPriceElement.textContent = `$${total.toFixed(2)}`;
        orderTotalElement.textContent = `$${total.toFixed(2)}`;
    }

    if (confirmOrderButton) {
        confirmOrderButton.addEventListener('click', () => {
            if (!orderItems || !orderDetails || !orderTotalElement) {
                console.error('Error: orderItems or orderDetails is null');
                return;
            }

            // Clear previous order details
            orderDetails.innerHTML = '';

            // Populate order details
            Array.from(orderItems.children).forEach(item => {
                let name = item.querySelector('.order__name').textContent;
                let count = item.querySelector('.order__count').textContent;
                let price = item.querySelector('.order__price').textContent;
                let totalPrice = item.querySelector('.total__price').textContent;
                let imageElement = item.querySelector('.order__img img');
                let image = imageElement ? imageElement.src : '';

                orderDetails.innerHTML += `
                    <div class="order-detail-item">
                        <div class="order-detail-image"><img src="${image}" alt="${name}"></div>
                        <div class="order-detail-name">${name}</div>
                        <div class="order-detail-quantity">${count}</div>
                        <div class="order-detail-price">${price}</div>
                        <div class="order-detail-total-price">${totalPrice}</div>
                    </div>
                `;
            });

            // Show the modal
            modal.style.display = 'flex';
        });
    }

    if (startNewOrderButton) {
        startNewOrderButton.addEventListener('click', () => {
            // Clear cart items
            if (orderItems) {
                while (orderItems.firstChild) {
                    orderItems.removeChild(orderItems.firstChild);
                }
            }
            // Clear order details
            if (orderDetails) {
                orderDetails.innerHTML = '';
            }
            // Reset total price
            if (totalPriceElement) {
                totalPriceElement.textContent = '$0.00';
            }
            // Hide the modal
            if (modal) {
                modal.style.display = 'none';
            }
            // Reset cart UI
            updateOrderCount();
            updateOrderDescription();
            updateTotalPrice();
            // Reset cart items' quantity controls
            document.querySelectorAll('.items__cart.has-quantity-controls .cart__add').forEach(cartItem => {
                cartItem.innerHTML = `
                    <img src="./assets/images/icon-add-to-cart.svg" class="add-to" alt="add-to-cart">
                    <span class="add-to-des">Add to Cart</span>
                `;
                cartItem.querySelector('.add-to').addEventListener('click', addToCart);
                cartItem.closest('.items__cart').classList.remove('has-quantity-controls');
            });
        });
    }
});
