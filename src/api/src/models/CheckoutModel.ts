export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }
  
  export interface CheckoutData {
    items: CartItem[];
    subtotal: number;
    shipping: number;
    total: number;
  }
  