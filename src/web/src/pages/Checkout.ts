// Import van benodigde modules, services of types
import { CartService } from "../services/CartService";
import { PaymentService } from "../services/PaymentService";

// Klasse die de afhandeling van de checkout regelt
export class Checkout {
    private cartService: CartService;
    private paymentService: PaymentService;

    // Constructor die de benodigde dependencies initialiseert
    constructor(cartService: CartService, paymentService: PaymentService) {
        this.cartService = cartService;
        this.paymentService = paymentService;
    }

    // Methode die de checkout verwerkt, zoals betaling en bevestiging
    public async processCheckout(userId: string): Promise<boolean> {
        const cart = await this.cartService.getCartByUserId(userId);

        // Controle of de winkelwagen geldig is of betaling geslaagd is
        if (!cart) {
            return false;
        }

        const total = cart.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        const paymentSuccess = await this.paymentService.charge(userId, total);

        // Controle of de winkelwagen geldig is of betaling geslaagd is
        if (paymentSuccess) {
            await this.cartService.clearCart(userId);
            return true;
        }

        return false;
    }
}
