import { Router, Request, Response } from "express";
// import { ParamsDictionary } from "express-serve-static-core";
import { WelcomeController } from "./controllers/WelcomeController";
import { WelcomeUserController } from "./controllers/WelcomeUserController";
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
import { ShowHomepageGamesController } from "./controllers/ShowHomepageGamesController";
import { WishlistController } from "./controllers/WishlistController";
import { NavbarController } from "./controllers/NavbarController";
import { GameSearchController } from "./controllers/SearchbarController";
import { ReviewController } from "./controllers/ReviewController";
import { LogoutController } from "./controllers/LogoutController";
import { RandomGameController } from "./controllers/RandomGameController";
import { AddToWishlistController } from "./controllers/AddToWishlistController";
import { ActionController } from "./controllers/ActionController";

export const router: Router = Router();

router.get("/", (_: Request, res: Response) => {
    res.send("Welcome to the API!");
});

const welcomeController: WelcomeController = new WelcomeController();
const welcomeUserController: WelcomeUserController = new WelcomeUserController();
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
const navbarController: NavbarController = new NavbarController();
const gameSearchController: GameSearchController = new GameSearchController();
const logoutController: LogoutController = new LogoutController();
const showHomepageGamesController: ShowHomepageGamesController = new ShowHomepageGamesController();
const randomGameController: RandomGameController = new RandomGameController();
const reviewController: ReviewController = new ReviewController();
const addToWishlistController: AddToWishlistController = new AddToWishlistController();
const actionController: ActionController = new ActionController();

// Authentication endpoints (no session required)
router.post("/auth/login", (req: Request, res: Response) => loginController.login(req, res));
router.post("/auth/logout", (req: Request, res: Response) => logoutController.logout(req, res));
router.post("/register", (req: Request, res: Response) => {
    console.log("POST /register ontvangen", req.body);
    return registerController.addNewUser(req, res);
});

router.use(sessionMiddleware);

router.get("/session", (req: Request, res: Response) => welcomeController.getSession(req, res));
router.delete("/session", (req: Request, res: Response) => welcomeController.deleteSession(req, res));
router.delete("/session/expired", (req: Request, res: Response) => welcomeController.deleteExpiredSessions(req, res));
router.get("/welcome", (req: Request, res: Response) => welcomeController.getWelcome(req, res));
router.get("/welcome-user", (req: Request, res: Response) => welcomeUserController.getWelcomeMessage(req, res));

// Cart endpoints
router.get("/cart", (req: Request, res: Response) => cartController.getCart(req, res));
router.delete("/cart/item/:id", (req: Request, res: Response) => cartController.deleteCartItem(req, res));
router.post("/cart/add", (req: Request, res: Response) => addToCartController.addToCart(req, res));
router.get("/cart/count", (req: Request, res: Response) => navbarController.getCartCount(req, res));
router.patch("/cart/item/:id/quantity", (req: Request, res: Response) => cartController.updateCartItemQuantity(req, res));
router.get("/games/search", (req: Request, res: Response) => gameSearchController.searchGamesByTitle(req, res));

// Discount code endpoints
router.post("/discount/apply", (req: Request<object, object, DiscountCodeRequestBody>, res: Response) => discountController.applyDiscount(req, res));
router.get("/actie/:productId", (req, res) => actionController.getActieByProductA(req, res));

// Checkout endpoint
router.post("/checkout", (req: Request, res: Response) => checkoutController.createAddress(req, res));

// Review endpoints (aangepast pad)
router.use("/api", sessionMiddleware, reviewController.router);

// Secret endpoint
router.get("/secret", (req: Request, res: Response) => welcomeController.getSecret(req, res));

// Order endpoint
router.get("/order/:orderId/games", (req: Request, res: Response) => orderController.getGamesForOrder(req, res));
router.post("/order/complete", (req: Request, res: Response) => orderController.createOrder(req, res));
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

// Homepage games endpoint
router.get("/homepage-games", (req: Request, res: Response) => showHomepageGamesController.getHomepageGames(req, res));

// Random game endpoint voor "Verras mij" functionaliteit
router.get("/games/random", (req: Request, res: Response) => randomGameController.getRandomGame(req, res));

// Wishlist endpoints
router.post("/wishlist/add", (req: Request, res: Response) => addToWishlistController.addToWishlist(req, res));
router.delete("/wishlist/:id", (req: Request, res: Response) => wishlistController.deleteWishlistItem(req, res));
