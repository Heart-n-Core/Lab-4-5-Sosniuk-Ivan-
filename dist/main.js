import { getPizzaList } from './pizza-manager.js'; // Assuming pizza-manager.ts is in the same directory
const orderList = [];
let cachedPizzas = [];
const backend = `http://${window.location.host}`;
/**
 * Generates the HTML string for a single pizza size option.
 *
 * @param {PizzaSize} size - The pizza size object (e.g., smallerSize or biggerSize).
 * @returns {string} The HTML string for the pizza size option.
 */
function createPizzaSizeOptionHTML(size) {
    return `
    <div class="pizza-size-option">
        <div class="pizza-stats">
            <span>Ø ${size.radius}</span>
					  <img src = images\\weight.svg>
            <span>${size.weight}</span>
        </div>
        <div class="pizza-price" id="impreza-price">${size.price.toFixed(2)}<div>грн.</div> </div>
        <div class="pizza-actions">
            <button class="add-pizza-button">Купити</button>
        </div>
    </div>
  `;
}
/**
 * Renders the list of pizzas into the specified HTML element.
 * This function is now asynchronous because it awaits the pizza data.
 *
 * @param {string} pizzaItemsSectionId - The ID of the HTML element where pizzas should be rendered.
 */
export async function renderPizzas() {
    const pizzaItemsSection = document.getElementById('pizza-items-section');
    if (!pizzaItemsSection) {
        console.error(`Element with ID 'pizza-items-section' not found. Cannot render pizzas.`);
        return;
    }
    // Get pizza data from the manager, awaiting the promise to resolve
    // const pizzaData = await getPizzaList(); 
    // cachedPizzas = pizzaData;
    pizzaItemsSection.innerHTML = ''; // Clear existing content before rendering
    if (cachedPizzas.length === 0) {
        cachedPizzas = await getPizzaList();
    }
    // let filterList:Pizza[] = structuredClone(pizzaData); 
    let filterList = structuredClone(cachedPizzas);
    const activeBtn = document.querySelector(".nav-menu .active");
    const filterMap = {
        meat: "М'ясна",
        pineapple: "З ананасами",
        mushrooms: "З грибами",
        seafood: "З морепродуктами",
        vegan: "Веганська",
        all: ""
    };
    // let filterList = structuredClone(pizzaData);
    if (activeBtn && activeBtn.id !== "all") {
        const filter = filterMap[activeBtn.id] ?? "";
        filterList = filterList.filter(pizza => pizza.category === filter);
    }
    filterList.forEach((pizza) => {
        const pizzaItemDiv = document.createElement('div');
        pizzaItemDiv.className = 'pizza-item';
        // Using a more robust ID, replacing spaces and special characters with hyphens
        pizzaItemDiv.id = `pizza-${pizza.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        pizzaItemDiv.innerHTML = `
      <img src="images/${pizza.pictureName}" alt="${pizza.name}"
           onerror="this.onerror=null; this.src='https://placehold.co/400x200/888/FFF?text=${pizza.name.replace(/\s/g, '+')}';">
      <div class="pizza-details">
          <h3>${pizza.name}</h3>
          <div class="pizza-category">${pizza.category}</div>
          <p>${pizza.description}</p>
          <div class="pizza-sizes">
              ${createPizzaSizeOptionHTML(pizza.smallerSize)}
              ${createPizzaSizeOptionHTML(pizza.biggerSize)}
          </div>
      </div>
    `;
        pizzaItemsSection.appendChild(pizzaItemDiv);
        const smallerSizeButton = pizzaItemDiv.querySelector('.pizza-sizes > .pizza-size-option:nth-child(1) .add-pizza-button');
        const biggerSizeButton = pizzaItemDiv.querySelector('.pizza-sizes > .pizza-size-option:nth-child(2) .add-pizza-button');
        if (smallerSizeButton) {
            smallerSizeButton.addEventListener('click', () => addToOrder(pizza.name, true));
        }
        if (biggerSizeButton) {
            biggerSizeButton.addEventListener('click', () => addToOrder(pizza.name, false));
        }
    });
}
function saveOrderListToLocalStorage() {
    try {
        localStorage.setItem('pizzaOrderList', JSON.stringify(orderList));
        console.log('Order list saved to localStorage.');
    }
    catch (error) {
        console.error('Failed to save order list to localStorage:', error);
    }
}
/**
 * Loads the orderList from localStorage.
 */
function loadOrderListFromLocalStorage() {
    try {
        const storedOrderList = localStorage.getItem('pizzaOrderList');
        if (storedOrderList) {
            // Clear current list and populate with loaded data
            orderList.length = 0; // Clear the array while maintaining its reference
            const parsedList = JSON.parse(storedOrderList);
            parsedList.forEach(item => {
                if (!cachedPizzas.find(p => p.name === item.pizzaName)) {
                    console.error('Missing pizza with name ' + item.pizzaName + 'from local storage, removing it from local storage.');
                    orderList.push();
                }
                else {
                    orderList.push(item);
                }
            });
            console.log('Order list loaded from localStorage.');
        }
    }
    catch (error) {
        console.error('Failed to load order list from localStorage:', error);
        // Potentially clear corrupted data if parsing fails
        localStorage.removeItem('pizzaOrderList');
    }
}
async function addToOrder(pizzaName, isSmallerSize) {
    // Find the actual Pizza object from the cached data
    const pizza = cachedPizzas.find(p => p.name === pizzaName);
    if (!pizza) {
        console.error(`Pizza with name "${pizzaName}" not found in loaded data.`);
        // alert(`Error: Pizza "${pizzaName}" not found.`);
        return;
    }
    const selectedSizeDetails = isSmallerSize ? pizza.smallerSize : pizza.biggerSize;
    // Check if an order item for this pizza (by name and size) already exists
    const existingOrderItem = orderList.find(item => item.pizzaName === pizza.name && item.isSmall === isSmallerSize);
    if (existingOrderItem) {
        // If it exists, increment the quantity
        existingOrderItem.quantity++;
        console.log(`Incremented quantity for: ${pizza.name} (${selectedSizeDetails.radius}). New quantity: ${existingOrderItem.quantity}`);
        // alert(`"${pizza.name}" (${selectedSizeDetails.radius}) quantity updated to ${existingOrderItem.quantity}!`);
    }
    else {
        // If it doesn't exist, create a new order item and add it to the list
        const newOrderItem = {
            pizzaName: pizza.name, // Store pizza name (string)
            quantity: 1,
            isSmall: isSmallerSize,
        };
        orderList.push(newOrderItem);
        console.log(`Added new item to order: ${pizza.name} (${selectedSizeDetails.radius}).`);
        // alert(`"${pizza.name}" (${selectedSizeDetails.radius}) added to order!`);
    }
    console.log("Current Order List:", orderList);
    await renderOrderList();
}
function changeQuantity(pizzaName, isSmall, delta) {
    const itemIndex = orderList.findIndex(item => item.pizzaName === pizzaName && item.isSmall === isSmall);
    if (itemIndex > -1) {
        orderList[itemIndex].quantity += delta;
        if (orderList[itemIndex].quantity <= 0) {
            // If quantity is 0 or less, remove the item
            orderList.splice(itemIndex, 1);
            console.log(`Removed ${pizzaName} from order due to quantity reaching zero.`);
        }
        else {
            console.log(`Quantity for ${pizzaName} changed by ${delta}. New quantity: ${orderList[itemIndex].quantity}`);
        }
        renderOrderList(); // Re-render the order list after change
    }
}
/**
 * Removes a specific order item from the order list.
 * This is typically used by a dedicated "remove" button (e.g., 'X').
 *
 * @param {string} pizzaName - The name of the pizza.
 * @param {boolean} isSmall - True if the small size, false if big.
 */
function removeItem(pizzaName, isSmall) {
    const itemIndex = orderList.findIndex(item => item.pizzaName === pizzaName && item.isSmall === isSmall);
    if (itemIndex > -1) {
        orderList.splice(itemIndex, 1);
        console.log(`Removed ${pizzaName} from order.`);
        renderOrderList(); // Re-render the order list after change
    }
}
async function renderOrderList(orderListSectionId = 'current-order-list') {
    const orderListSection = document.getElementById(orderListSectionId);
    if (!orderListSection) {
        console.error(`Element with ID '${orderListSectionId}' not found. Cannot render order list.`);
        return;
    }
    orderListSection.innerHTML = ''; // Clear existing content
    if (orderList.length === 0) {
        orderListSection.innerHTML = '<p class="text-center text-gray-500 py-4"></p>';
        const orderItemCount = document.getElementById("order-item-count");
        if (orderItemCount)
            orderItemCount.innerHTML = orderList.length.toFixed(0);
        const total = document.getElementById("total-order-price");
        if (total)
            total.innerHTML = "0 грн";
        saveOrderListToLocalStorage();
        return;
    }
    // Ensure cachedPizzas is available if not already loaded by renderPizzas
    if (cachedPizzas.length === 0) {
        cachedPizzas = await getPizzaList();
    }
    const total = document.getElementById("total-order-price");
    let totalNumber = 0;
    orderList.forEach((orderItem) => {
        const pizza = cachedPizzas.find(p => p.name === orderItem.pizzaName);
        if (!pizza) {
            console.warn(`Pizza "${orderItem.pizzaName}" not found for order item. Skipping render.`);
            return;
        }
        const selectedSize = orderItem.isSmall ? pizza.smallerSize : pizza.biggerSize;
        const displayName = pizza.name;
        const displaySize = orderItem.isSmall ? 'Мала' : 'Велика';
        const displayPrice = selectedSize.price * orderItem.quantity; // Total price for this item
        const orderItemDiv = document.createElement('div');
        orderItemDiv.className = 'order-item';
        // orderItemDiv.id = `order-item-${pizza.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${orderItem.isSmall ? 'small' : 'big'}`;
        orderItemDiv.innerHTML = `
          <div class="order-item-details">
            <h4>${displayName} (${displaySize})</h4>
            <p>Ø ${selectedSize.radius}  | <img src = images\\weight.svg> ${selectedSize.weight}</p>
          </div>
          <div class="order-item-quantity">
            <span class="order-item-price">${displayPrice.toFixed(2)} грн</span>
            <div>
              <button id="decrease" class="decrement">-</button>
              <span class="quantity" id="quantity">${orderItem.quantity}</span>
              <button id="increase" class="increment">+</button>
            </div>
            <button class="order-item-remove" id="remove">X</button>
          </div>
          <img src="images/${pizza.pictureName}" alt="${pizza.name}">
        `;
        orderListSection.appendChild(orderItemDiv);
        totalNumber += displayPrice;
        // Attach event listeners for the new buttons
        const decrementButton = orderItemDiv.querySelector('.decrement');
        const incrementButton = orderItemDiv.querySelector('.increment');
        const removeButton = orderItemDiv.querySelector('.order-item-remove');
        if (decrementButton) {
            decrementButton.addEventListener('click', () => changeQuantity(orderItem.pizzaName, orderItem.isSmall, -1));
        }
        if (incrementButton) {
            incrementButton.addEventListener('click', () => changeQuantity(orderItem.pizzaName, orderItem.isSmall, 1));
        }
        if (removeButton) {
            removeButton.addEventListener('click', () => removeItem(orderItem.pizzaName, orderItem.isSmall));
        }
    });
    if (total)
        total.innerHTML = totalNumber.toFixed(2) + " грн";
    const orderItemCount = document.getElementById("order-item-count");
    if (orderItemCount)
        orderItemCount.innerHTML = orderList.length.toFixed(0);
    saveOrderListToLocalStorage();
}
// Ensure the render function is called when the DOM is fully loaded
// This pattern allows you to import and call renderPizzas from your HTML.
// Alternatively, if this file is bundled, you might call it directly at the end of the file.
// For modular JavaScript, the call happens in the HTML <script type="module">
document.addEventListener('DOMContentLoaded', async () => {
    // Call renderPizzas to populate the pizza menu section
    await renderPizzas();
    loadOrderListFromLocalStorage();
    await renderOrderList();
    setupButtons();
});
// typeButtons.forEach(button => {
//   console.log("button with id "+button.id)
//   button.addEventListener('click', ()=>{
//     typeButtons.forEach(button => {button.classList.remove("active")});
//     button.classList.add("active");
//   });
// });
function setupButtons() {
    const typeButtons = document.querySelector('.nav-menu');
    if (typeButtons) {
        const clearOrderButton = document.getElementById("clear-order-button");
        if (clearOrderButton)
            clearOrderButton.addEventListener('click', () => {
                orderList.length = 0;
                renderOrderList();
            });
        const children = typeButtons.children; // gets HTMLCollection of direct child elements
        for (let i = 0; i < children.length; i++) {
            children[i].addEventListener('click', () => {
                for (let j = 0; j < children.length; j++) {
                    children[j].classList.remove("active");
                }
                ;
                children[i].classList.add("active");
                renderPizzas();
            });
        }
        const buyButton = document.getElementById("checkout-button");
        if (buyButton)
            buyButton.addEventListener('click', () => {
                fetch(backend + "/order", {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Tell server we send JSON
                    },
                    body: JSON.stringify(orderList), // Convert JS object to JSON string
                })
                    .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); // Parse JSON response
                })
                    .then(data => {
                    console.log('Success:', data);
                })
                    .catch(error => {
                    console.error('Error:', error);
                });
            });
    }
}
