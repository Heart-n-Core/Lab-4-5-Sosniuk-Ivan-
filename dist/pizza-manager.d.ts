import { Pizza } from './pizza-interfaces.js';
/**
 * Adds a new pizza object to the in-memory pizza list.
 * This does NOT persist the pizza to the external JSON file.
 *
 * @param {Pizza} newPizza - The pizza object to be added.
 */
export declare function addPizza(newPizza: Pizza): void;
/**
 * Loads and returns the list of pizzas from an external JSON file.
 * This function is asynchronous as it uses `fetch`.
 *
 * @returns {Promise<Pizza[]>} A promise that resolves to an array of Pizza objects.
 * Returns an empty array if loading fails.
 */
export declare function getPizzaList(): Promise<Pizza[]>;
