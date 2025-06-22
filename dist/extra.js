// import WebDataRocks from "@webdatarocks/webdatarocks";
// import "@webdatarocks/webdatarocks/webdatarocks.min.css";
import { getPizzaList } from "./pizza-manager.js";
let cachedPizzas = [];
cachedPizzas = await getPizzaList();
// let orders: OrderItem = await getOrders();
// const pivot = new WebDataRocks({
//   container: "#pivotContainer",
//   toolbar: true,
// });
let orders = await getOrders(); // Ensure OrderItem is an array
// Map pizzas for easy lookup by name
const pizzaMap = new Map();
cachedPizzas.forEach(pizza => {
    pizzaMap.set(pizza.name, pizza);
});
const consolidatedPizzaData = new Map();
orders.forEach(order => {
    const pizza = pizzaMap.get(order.pizzaName);
    if (pizza) {
        let price = 0;
        let sizeCategory = "";
        if (order.isSmall) {
            price = pizza.smallerSize.price;
            sizeCategory = "Мала";
        }
        else {
            price = pizza.biggerSize.price;
            sizeCategory = "Велика";
        }
        // Create a unique key for each pizza + size combination
        const key = `${order.pizzaName}-${sizeCategory}`;
        if (consolidatedPizzaData.has(key)) {
            // If the key exists, update the existing entry
            const existingEntry = consolidatedPizzaData.get(key);
            existingEntry["Quantity"] += order.quantity;
            existingEntry["Worth"] += price * order.quantity;
        }
        else {
            // If the key doesn't exist, create a new entry
            consolidatedPizzaData.set(key, {
                "Pizza Name": order.pizzaName,
                "Category": pizza.category,
                "Size": sizeCategory,
                "Quantity": order.quantity,
                "Price Per Unit": price, // This will be the price for the specific size
                "Worth": price * order.quantity,
            });
        }
    }
});
const pivotData = Array.from(consolidatedPizzaData.values());
pivotData.sort((a, b) => {
    // Primary sort by "Pizza Name"
    const pizzaNameCompare = a["Pizza Name"].localeCompare(b["Pizza Name"]);
    if (pizzaNameCompare !== 0) {
        return pizzaNameCompare;
    }
    // Secondary sort by "Size" (Small before Big)
    if (a["Size"] === "Мала" && b["Size"] === "Велика") {
        return -1; // 'Small' comes before 'Big'
    }
    if (a["Size"] === "Велика" && b["Size"] === "Мала") {
        return 1; // 'Big' comes after 'Small'
    }
    return 0; // Sizes are the same or other cases
});
console.log(pivotData);
const pivot = new WebDataRocks({
    container: "#pivotContainer",
    toolbar: true,
    data: {
        dataSource: pivotData
    },
    report: {
        "dataSource": {
            "data": pivotData
        },
        "slice": {
            "rows": [
                {
                    "uniqueName": "Category", // Moved "Category" to the top
                },
                {
                    "uniqueName": "Pizza Name", // "Pizza Name" is now a subcategory of "Category"
                },
                {
                    "uniqueName": "Size", // "Size" is a subcategory of "Pizza Name"
                }
            ],
            "columns": [
                {
                    "uniqueName": "Measures"
                }
            ],
            "measures": [
                {
                    "uniqueName": "Quantity",
                    "aggregation": "sum",
                    "caption": "Amount Bought"
                },
                {
                    "uniqueName": "Price Per Unit", // <-- New measure added here
                    "aggregation": "average", // Or "average". "sum" works for displaying single value per consolidated row.
                    "caption": "Price Per Unit"
                },
                {
                    "uniqueName": "Worth",
                    "aggregation": "sum",
                    "caption": "Total Worth"
                },
            ],
            // --- NEW: Ensure Grand Totals are shown ---
            "showGrandTotals": true,
            "showRowGrandTotals": true,
            "showColumnGrandTotals": true
        }
    }
});
async function getOrder() {
    try {
        const response = await fetch('orders.json'); // Fetch data from the external JSON file
        if (!response.ok) {
            // Throw an error if the HTTP response status is not OK (e.g., 404, 500)
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Parse the JSON data
        // Optionally, you could merge this with `pizzaList` if `pizzaList`
        // were intended as a runtime cache for both loaded and newly added pizzas.
        // For now, it directly returns the fetched data.
        return data;
    }
    catch (error) {
        console.error("Failed to load pizza data:", error);
        // Return an empty array or handle the error as appropriate for your application
        return {
            //Example data
            pizzaName: "Прошутто", quantity: 1, isSmall: true
        };
    }
}
async function getOrders() {
    try {
        const response = await fetch('orders.json'); // Fetch data from the external JSON file
        if (!response.ok) {
            // Throw an error if the HTTP response status is not OK (e.g., 404, 500)
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Parse the JSON data
        // Optionally, you could merge this with `pizzaList` if `pizzaList`
        // were intended as a runtime cache for both loaded and newly added pizzas.
        // For now, it directly returns the fetched data.
        return data;
    }
    catch (error) {
        console.error("Failed to load orders data:", error);
        // Return an empty array or handle the error as appropriate for your application
        return [{
                //Example data
                pizzaName: "Прошутто", quantity: 1, isSmall: true
            }];
    }
}
