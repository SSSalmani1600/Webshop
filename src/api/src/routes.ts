import { Router, Request, Response } from "express";
import { WelcomeController } from "./controllers/WelcomeController";
import { OrderController } from "./controllers/OrderContoller";
import { requireValidSessionMiddleware, sessionMiddleware } from "./middleware/sessionMiddleware";
import { CartController } from "./controllers/CartController";
import { ProductController } from "./controllers/ProductController";
import { LoginController } from "./controllers/LoginController";
import { AddressController } from "./controllers/AddressController"; 

export const router: Router = Router();

router.get("/", (_: Request, res: Response) => {
    res.send("Welcome to the API!");
});

const welcomeController: WelcomeController = new WelcomeController();
const orderController: OrderController = new OrderController();
const cartController: CartController = new CartController();
const productController: ProductController = new ProductController();
const loginController: LoginController = new LoginController();

// Authentication endpoints (no session required)
router.post("/auth/login", (req: Request, res: Response) => loginController.login(req, res));

router.use(sessionMiddleware);

router.get("/session", (req: Request, res: Response) => welcomeController.getSession(req, res));
router.delete("/session", (req: Request, res: Response) => welcomeController.deleteSession(req, res));
router.delete("/session/expired", (req: Request, res: Response) => welcomeController.deleteExpiredSessions(req, res));
router.get("/welcome", (req: Request, res: Response) => welcomeController.getWelcome(req, res));
router.get("/cart", (req: Request, res: Response) => cartController.getCart(req, res));

// ✅ Adres opslaan - alleen voor ingelogde gebruikers
router.use(requireValidSessionMiddleware);
router.post("/address", (req: Request, res: Response) => AddressController.postAddress(req, res));

router.get("/secret", (req: Request, res: Response) => welcomeController.getSecret(req, res));

router.post("/order/complete", (req: Request, res: Response) => orderController.createOrder(req, res));

router.get("/products", (_req, _res) => productController.getAllGames(_req, _res));
router.get("/product-prices/:id", (req, res) => productController.getGamePrice(req, res));

// TODO: The following endpoints have to be implemented in their own respective controller
router.get("/products", (req: Request, res: Response) => productController.getAllGames(req, res));
router.get("/product-prices/:id", (req: Request, res: Response) => productController.getGamePrice(req, res));

router.get("/products/:id", (_req: Request, _res: Response) => {
    throw new Error("Return a specific product");
});

router.post("/cart/add", (_req, _res) => {
    throw new Error("Add a product to the cart");
});
