import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { AddToWishlistController } from "../../src/controllers/AddToWishlistController";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

// Type definities voor de test
interface WishlistRequestBody {
    game_id: string;
}

interface WishlistResponse {
    success: boolean;
    message: string;
}

type MockRequest = Partial<Request> & {
    body: WishlistRequestBody;
    userId?: number;
};

type MockResponse = Partial<Response> & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
};

// Setup van de test omgeving
const mockAddToWishlist: Mock = vi.fn();
vi.mock("../../src/services/AddToWishlistService", () => ({
    AddToWishlistService: vi.fn().mockImplementation(() => ({
        addToWishlist: mockAddToWishlist,
    })),
}));

describe("AddToWishlistController", () => {
    let controller: AddToWishlistController;

    // Reset voor elke test
    beforeEach(() => {
        vi.clearAllMocks();
        controller = new AddToWishlistController();
    });

    it("moet een game aan de wishlist toevoegen", async () => {
        // Test voor succesvol toevoegen van een game
        const req: MockRequest = {
            body: {
                game_id: "123",
            },
            userId: 456,
        };

        const res: MockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        // Simuleer succesvolle service response
        mockAddToWishlist.mockResolvedValueOnce({
            success: true,
            message: "Game toegevoegd aan favorieten",
        });

        await controller.addToWishlist(
            req as Request<ParamsDictionary, WishlistResponse, WishlistRequestBody>,
            res as Response
        );

        // Validatie van service aanroep en response
        expect(mockAddToWishlist).toHaveBeenCalledWith({
            gameId: 123,
            userId: 456,
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Game toegevoegd aan favorieten",
        });
    });

    it("moet een error geven als gebruiker niet is ingelogd", async () => {
        // Test voor niet-geautoriseerde gebruiker
        const req: MockRequest = {
            body: {
                game_id: "123",
            },
            // userId ontbreekt expres voor deze test
        };

        const res: MockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        await controller.addToWishlist(
            req as Request<ParamsDictionary, WishlistResponse, WishlistRequestBody>,
            res as Response
        );

        // Validatie van authenticatie error
        expect(mockAddToWishlist).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Gebruiker is niet ingelogd",
        });
    });

    it("moet een error geven bij ongeldige game_id", async () => {
        // Test voor ongeldige input validatie
        const req: MockRequest = {
            body: {
                game_id: "invalid",
            },
            userId: 456,
        };

        const res: MockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        await controller.addToWishlist(
            req as Request<ParamsDictionary, WishlistResponse, WishlistRequestBody>,
            res as Response
        );

        // Validatie van input error
        expect(mockAddToWishlist).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Ontbrekende game_id in verzoek",
        });
    });

    it("moet een error geven als de service faalt", async () => {
        // Test voor interne server error
        const req: MockRequest = {
            body: {
                game_id: "123",
            },
            userId: 456,
        };

        const res: MockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        // Simuleer service fout
        mockAddToWishlist.mockRejectedValueOnce(new Error("Service error"));

        await controller.addToWishlist(
            req as Request<ParamsDictionary, WishlistResponse, WishlistRequestBody>,
            res as Response
        );

        // Validatie van server error
        expect(mockAddToWishlist).toHaveBeenCalledWith({
            gameId: 123,
            userId: 456,
        });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Er is een fout opgetreden bij het toevoegen aan favorieten",
        });
    });

    it("moet een error geven als game niet bestaat", async () => {
        // Test voor niet-bestaande game
        const req: MockRequest = {
            body: {
                game_id: "123",
            },
            userId: 456,
        };

        const res: MockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        // Simuleer 'game niet gevonden' response
        mockAddToWishlist.mockResolvedValueOnce({
            success: false,
            message: "Game niet gevonden",
        });

        await controller.addToWishlist(
            req as Request<ParamsDictionary, WishlistResponse, WishlistRequestBody>,
            res as Response
        );

        // Validatie van niet-gevonden error
        expect(mockAddToWishlist).toHaveBeenCalledWith({
            gameId: 123,
            userId: 456,
        });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Game niet gevonden",
        });
    });
});
