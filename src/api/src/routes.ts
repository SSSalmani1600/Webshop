import { Router, Request, Response } from "express";
import { WelcomeController } from "./controllers/WelcomeController";
import { OrderController } from "./controllers/OrderContoller";
import { requireValidSessionMiddleware, sessionMiddleware } from "./middleware/sessionMiddleware";
import { CartController } from "./controllers/CartController";
import { ProductController } from "./controllers/ProductController";
import { LoginController } from "./controllers/LoginController";
import { AddToCartController } from "./controllers/add_to_cart_controller";
import { RegisterController } from "./controllers/RegisterController";
import { GameDetailController } from "./controllers/ProductDetailController";

// Create a router
export const router: Router = Router();

// Setup endpoints
router.get("/", (_: Request, res: Response) => {
    res.send("Welcome to the API!");
});

// Forward endpoints to other routers
const welcomeController: WelcomeController = new WelcomeController();
const orderController: OrderController = new OrderController();
const gameDetailController: GameDetailController = new GameDetailController();
const cartController: CartController = new CartController();
const productController: ProductController = new ProductController();
const loginController: LoginController = new LoginController();
const addToCartController: AddToCartController = new AddToCartController();
const registerController: RegisterController = new RegisterController();

// Authentication endpoints (no session required)
router.post("/auth/login", (req: Request, res: Response) => loginController.login(req, res));
router.post("/register", (req: Request, res: Response) => {
    console.log("POST /register ontvangen", req.body);
    return registerController.addNewUser(req, res);
});

// NOTE: After this line, all endpoints will check for a session.
router.use(sessionMiddleware);

router.get("/session", (req: Request, res: Response) => welcomeController.getSession(req, res));
router.delete("/session", (req: Request, res: Response) => welcomeController.deleteSession(req, res));
router.delete("/session/expired", (req: Request, res: Response) => welcomeController.deleteExpiredSessions(req, res));
router.get("/welcome", (req: Request, res: Response) => welcomeController.getWelcome(req, res));
router.get("/cart", (req: Request, res: Response) => cartController.getCart(req, res));

// Add to cart endpoint
router.post("/api/cart/add", (req: Request, res: Response) => addToCartController.addToCart(req, res));

// NOTE: After this line, all endpoints will require a valid session.
router.use(requireValidSessionMiddleware);

router.get("/secret", (req: Request, res: Response) => welcomeController.getSecret(req, res));

router.post("/order/complete", (req, res) => orderController.createOrder(req, res));
router.get("/order/complete", (req, res) => orderController.getBoughtGames(req, res));

router.get("/game", (req, res) => gameDetailController.getGameById(req, res));

// TODO: The following endpoints have to be implemented in their own respective controller
router.get("/products", (req: Request, res: Response) => productController.getAllGames(req, res));
router.get("/product-prices/:id", (req: Request, res: Response) => productController.getGamePrice(req, res));

router.get("/products/:id", (_req: Request, _res: Response) => {
    throw new Error("Return a specific product");
});
