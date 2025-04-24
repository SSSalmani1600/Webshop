import { Router } from ".express";
import { WelcomeController } from "./controllers/WelcomeController";
import { requireValidSessionMiddleware, sessionMiddleware } from "./middleware/sessionMiddleware";

// Create a router
export const router: Router = Router();

// Setup endpoints
router.get("/", (_: any, res: { send: (arg0: string) => void; }) => {
    res.send("Welcome to the API!");
});

// Forward endpoints to other routers
const welcomeController: WelcomeController = new WelcomeController();

// NOTE: After this line, all endpoints will check for a session.
router.use(sessionMiddleware);

router.get("/session", (req: any, res: any) => welcomeController.getSession(req, res));
router.delete("/session", (req: any, res: any) => welcomeController.deleteSession(req, res));
router.delete("/session/expired", (req: any, res: any) => welcomeController.deleteExpiredSessions(req, res));
router.get("/welcome", (req: any, res: any) => welcomeController.getWelcome(req, res));

// NOTE: After this line, all endpoints will require a valid session.
router.use(requireValidSessionMiddleware);

router.get("/secret", (req: any, res: any) => welcomeController.getSecret(req, res));

// TODO: The following endpoints have to be implemented in their own respective controller
router.get("/products", (_req: any, _res: any) => {
    throw new Error("Return a list of products");
});

router.get("/products/:id", (_req: any, _res: any) => {
    throw new Error("Return a specific product");
});

router.post("/cart/add", (_req: any, _res: any) => {
    throw new Error("Add a product to the cart");
});

router.get("/cart", (_req: any, _res: any) => {
    throw new Error("Return a list of products in the cart and the total price");
});
