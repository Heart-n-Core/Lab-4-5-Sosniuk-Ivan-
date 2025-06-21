import { Pizza } from './pizza-interfaces'; // Assuming pizza-interfaces.ts is in the same directory

/**
 * An in-memory list for pizzas added dynamically after initial load.
 * Note: Additions to this list are not persisted to the external JSON file.
 * Persistence would require a server-side component.
 */
const pizzaList: Pizza[] = [];

/**
 * Adds a new pizza object to the in-memory pizza list.
 * This does NOT persist the pizza to the external JSON file.
 *
 * @param {Pizza} newPizza - The pizza object to be added.
 */
export function addPizza(newPizza: Pizza): void {
  // Add validation for duplicates: check if a pizza with the same name already exists
  const isDuplicate = pizzaList.some(pizza => pizza.name.toLowerCase() === newPizza.name.toLowerCase());

  if (isDuplicate) {
    console.warn(`Pizza "${newPizza.name}" already exists in the in-memory list. Not adding duplicate.`);
    // Optionally, you could throw an error or return a boolean indicating failure
    return;
  }

  pizzaList.push(newPizza);
  console.log(`Pizza "${newPizza.name}" added to in-memory list.`);
}

/**
 * Loads and returns the list of pizzas from an external JSON file.
 * This function is asynchronous as it uses `fetch`.
 *
 * @returns {Promise<Pizza[]>} A promise that resolves to an array of Pizza objects.
 * Returns an empty array if loading fails.
 */
export async function getPizzaList(): Promise<Pizza[]> {
  try {
    const response = await fetch('pizzas.json'); // Fetch data from the external JSON file

    if (!response.ok) {
      // Throw an error if the HTTP response status is not OK (e.g., 404, 500)
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Pizza[] = await response.json(); // Parse the JSON data
    // Optionally, you could merge this with `pizzaList` if `pizzaList`
    // were intended as a runtime cache for both loaded and newly added pizzas.
    // For now, it directly returns the fetched data.
    return data;
  } catch (error) {
    console.error("Failed to load pizza data:", error);
    // Return an empty array or handle the error as appropriate for your application
    return [];
  }
}

// --- Example Usage (for demonstration only, not executed on load) ---
// This part is for illustrating how to use the functions.
// It should not be actively called at the top level in a production module.

// Example of adding a pizza (it will only be in memory)
const hawaiianPizza: Pizza = {
  name: "Hawaiian",
  category: "Exotic",
  description: "Sweet pineapple chunks, savory ham, and melted mozzarella.",
  pictureName: "pizza_hawaiian.jpeg",
  smallerSize: {
    radius: "30cm",
    weight: "370g",
    price: 10.25,
  },
  biggerSize: {
    radius: "40cm",
    weight: "580g",
    price: 14.25,
  },
};

// addPizza(hawaiianPizza); // Uncomment to add this pizza to in-memory list

// Example of getting and logging pizzas after a delay to simulate fetch
/*
async function logPizzasAfterLoad() {
  console.log("Attempting to load pizzas from file...");
  const loadedPizzas = await getPizzaList();
  console.log("Pizzas loaded from file:");
  loadedPizzas.forEach(pizza => console.log(`- ${pizza.name}`));

  // If you added hawaiianPizza, it would be in `pizzaList` but not `loadedPizzas`
  // unless you merge them or save hawaiianPizza to the file.
  if (pizzaList.length > 0) {
    console.log("\nPizzas added to in-memory list (not from file):");
    pizzaList.forEach(pizza => console.log(`- ${pizza.name}`));
  }
}

logPizzasAfterLoad();
*/
