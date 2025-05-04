// Controller voor de checkoutpagina. Verwerkt en toont winkelwagengegevens.
export default class CheckoutController {

    // Haalt gegevens op voor de checkoutpagina, inclusief producten uit de winkelwagen.
    public async index(req: Request, res: Response) {

        // Haalt de winkelwagen op aan de hand van het user ID.
        const cart = await CartService.getCartByUserId(req.user.id);

        // Als er geen winkelwagen is gevonden, toon een foutmelding.
        if (!cart) {
            return res.status(404).send("Winkelwagen niet gevonden");
        }

        // Rendert de checkoutpagina met de producten in de winkelwagen.
        return res.render("checkout", {
            products: cart.products
        });
    }
}
