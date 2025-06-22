/**
 * Defines the structure for a pizza size, including its weight, price, and radius.
 */
export interface PizzaSize {
  radius: string; // e.g., "30cm", "40cm"
  weight: string; // e.g., "300g", "500g"
  price: number;  // e.g., 9.99, 12.50
}

/**
 * Defines the structure for a Pizza object.
 *
 * @property {string} name - The name of the pizza (e.g., "Margherita", "Pepperoni").
 * @property {string} category - The category of the pizza (e.g., "Classic", "Vegetarian", "Meat Lovers").
 * @property {string} description - A brief description of the pizza's ingredients or characteristics.
 * @property {string} pictureName - The filename of the pizza's image (e.g., "pizza_margherita.jpeg").
 * @property {PizzaSize} smallerSize - Details for the smaller size of the pizza.
 * @property {PizzaSize} biggerSize - Details for the bigger size of the pizza.
 */
export interface Pizza {
  name: string;
  category: string;
  description: string;
  pictureName: string;
  smallerSize: PizzaSize;
  biggerSize: PizzaSize;
}
export interface OrderItem {
  pizzaName: string;
  quantity: number;
  isSmall: boolean;
}