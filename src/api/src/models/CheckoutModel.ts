
// Definieer de structuur van een item in de winkelwagen
export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }
  
  // Definieer de structuur van de volledige checkout-data
  export interface CheckoutData {
    items: CartItem[];
    subtotal: number;
    shipping: number;
    total: number;
  }
  