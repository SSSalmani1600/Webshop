import { Router } from "express";
import { WelcomeController } from "./controllers/WelcomeController";
import { OrderController } from "./controllers/OrderContoller";
import { requireValidSessionMiddleware, sessionMiddleware } from "./middleware/sessionMiddleware";
import { CartController } from "./controllers/CartController";
import { ProductController } from "./controllers/ProductController";
import { GameDetailController } from "./controllers/ProductDetailController";

// Create a router
export const router: Router = Router();

// Setup endpoints
router.get("/", (_, res) => {
    res.send("Welcome to the API!");
});

// Forward endpoints to other routers
const welcomeController: WelcomeController = new WelcomeController();
const orderController: OrderController = new OrderController();
const gameDetailController: GameDetailController = new GameDetailController();
const cartController: CartController = new CartController();
const productController: ProductController = new ProductController();

// NOTE: After this line, all endpoints will check for a session.
router.use(sessionMiddleware);

router.get("/session", (req, res) => welcomeController.getSession(req, res));
router.delete("/session", (req, res) => welcomeController.deleteSession(req, res));
router.delete("/session/expired", (req, res) => welcomeController.deleteExpiredSessions(req, res));
router.get("/welcome", (req, res) => welcomeController.getWelcome(req, res));
router.get("/cart", (_req, _res) => cartController.getCart(_req, _res));

// NOTE: After this line, all endpoints will require a valid session.
router.use(requireValidSessionMiddleware);

router.get("/secret", (req, res) => welcomeController.getSecret(req, res));

router.post("/order/complete", (req, res) => orderController.createOrder(req, res));
router.get("/order/complete", (req, res) => orderController.getBoughtGames(req, res));

router.get("/game", (req, res) => gameDetailController.getGameById(req, res));

// TODO: The following endpoints have to be implemented in their own respective controller
router.get("/products", (_req, _res) => productController.getAllGames(_req, _res));
router.get("/product-prices/:id", (req, res) => productController.getGamePrice(req, res));

router.get("/products/:id", (_req, _res) => {
    throw new Error("Return a specific product");
});

router.post("/cart/add", (_req, _res) => {
    throw new Error("Add a product to the cart");
});
