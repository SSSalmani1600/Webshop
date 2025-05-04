

// Model voor het verwerken van checkout-logica, zoals het berekenen van totaalprijzen.
export default class CheckoutModel {
    private products: Product[];

    constructor(products: Product[]) {
        this.products = products;
    }

    // Methode om het totaalbedrag van de producten te berekenen.
    public calculateTotal(): number {
        let total = 0;

        // Doorloop alle producten om het totaal te berekenen.
        for (const product of this.products) {
            total += product.price * product.quantity;
        }

        return total;
    }
}
