import { Router, Request, Response } from "express";
import { WelcomeController } from "./controllers/WelcomeController";
import { OrderController } from "./controllers/OrderContoller";
import { sessionMiddleware } from "./middleware/sessionMiddleware";
import { CartController } from "./controllers/CartController";
import { ProductController } from "./controllers/ProductController";
import { LoginController } from "./controllers/LoginController";
import { CheckoutController } from "./controllers/CheckoutController";
import { AddToCartController } from "./controllers/add_to_cart_controller";
import { RegisterController } from "./controllers/RegisterController";
import { DiscountController } from "./controllers/DiscountController";
import { DiscountCodeRequestBody } from "./interfaces/IDiscountService";
import { GameDetailController } from "./controllers/ProductDetailController";
import { WishlistController } from "./controllers/WishlistController";

export const router: Router = Router();

router.get("/", (_: Request, res: Response) => {
    res.send("Welcome to the API!");
});

const welcomeController: WelcomeController = new WelcomeController();
const orderController: OrderController = new OrderController();
const gameDetailController: GameDetailController = new GameDetailController();
const cartController: CartController = new CartController();
const productController: ProductController = new ProductController();
const loginController: LoginController = new LoginController();
const checkoutController: CheckoutController = new CheckoutController();
const addToCartController: AddToCartController = new AddToCartController();
const registerController: RegisterController = new RegisterController();
const discountController: DiscountController = new DiscountController();
const wishlistController: WishlistController = new WishlistController();

// Authentication endpoints (no session required)
router.post("/auth/login", (req: Request, res: Response) => loginController.login(req, res));
router.post("/register", (req: Request, res: Response) => {
    console.log("POST /register ontvangen", req.body);
    return registerController.addNewUser(req, res);
});

router.use(sessionMiddleware);

router.get("/session", (req: Request, res: Response) => welcomeController.getSession(req, res));
router.delete("/session", (req: Request, res: Response) => welcomeController.deleteSession(req, res));
router.delete("/session/expired", (req: Request, res: Response) => welcomeController.deleteExpiredSessions(req, res));
router.get("/welcome", (req: Request, res: Response) => welcomeController.getWelcome(req, res));

// Cart endpoints
router.get("/cart", (req: Request, res: Response) => cartController.getCart(req, res));
router.delete("/cart/item/:id", (req: Request, res: Response) => cartController.deleteCartItem(req, res));
router.post("/cart/add", (req: Request, res: Response) => addToCartController.addToCart(req, res));

// Discount code endpoints
router.post("/discount/apply", (req: Request<object, object, DiscountCodeRequestBody>, res: Response) => discountController.applyDiscount(req, res));
router.get("/discount/codes", (req: Request, res: Response) => discountController.getAvailableDiscountCodes(req, res));

// Checkout endpoint
router.post("/checkout", (req: Request, res: Response) => checkoutController.createAddress(req, res));

// Secret endpoint
router.get("/secret", (req: Request, res: Response) => welcomeController.getSecret(req, res));

// Order endpoint
router.post("/order/complete", (req: Request, res: Response) => orderController.createOrder(req, res));
router.post("/order/complete", (req, res) => orderController.createOrder(req, res));
router.get("/order/complete", (req, res) => orderController.getBoughtGames(req, res));

router.get("/game", (req, res) => gameDetailController.getGameById(req, res));

// Product endpoints
router.get("/products", (req: Request, res: Response) => productController.getAllGames(req, res));
router.get("/product-prices/:id", (req: Request, res: Response) => productController.getGamePrice(req, res));
router.get("/products/:id", (_req: Request, _res: Response) => {
    throw new Error("Return a specific product");
});
router.post("/add-product", (req: Request, res: Response) => productController.addProduct(req, res));
router.post("/add-product", (req: Request, res: Response) => productController.addProduct(req, res));
router.patch("/products/:id/hidden", (req: Request, res: Response) =>
    productController.hideProduct(req, res)
);

// Wishlist endpoints
router.get("/wishlist", (req: Request, res: Response) => wishlistController.getWishlist(req, res));
