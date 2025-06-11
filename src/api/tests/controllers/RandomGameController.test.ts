import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { RandomGameController } from "../../src/controllers/RandomGameController";
import { RandomGameService } from "../../src/services/RandomGameService";
import { Request, Response } from "express";

// Mock de RandomGameService voor testing
vi.mock("../../src/services/RandomGameService");

/**
 * Test suite voor de RandomGameController
 * Test de "Verras mij" functionaliteit van de webshop
 */
describe("RandomGameController", () => {
    let controller: RandomGameController;
    let mockService: Partial<RandomGameService>;
    let res: Partial<Response>;

    /**
     * Setup voor elke test
     * Creëert nieuwe mocks en controller instance
     */
    beforeEach(() => {
        mockService = {
            getRandomGame: vi.fn(),
            getTotalGamesCount: vi.fn(),
        };

        (RandomGameService as Mock).mockImplementation(() => mockService);
        controller = new RandomGameController();

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    });

    /**
     * Test of een willekeurige game succesvol teruggestuurd wordt
     * Valideert de response structuur en status code
     */
    it("geeft willekeurige game terug", async () => {
        const mockGame: { id: number; title: string } = { id: 1, title: "Test Game" };
        (mockService.getRandomGame as Mock).mockResolvedValue(mockGame);
        (mockService.getTotalGamesCount as Mock).mockResolvedValue(50);

        await controller.getRandomGame({} as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Willekeurige game succesvol opgehaald",
            game: mockGame,
            totalGames: 50,
        });
    });

    /**
     * Test of een 404 error correct teruggestuurd wordt
     * Wanneer er geen games in de database staan
     */
    it("geeft 404 als geen games gevonden", async () => {
        (mockService.getRandomGame as Mock).mockResolvedValue(null);

        await controller.getRandomGame({} as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Geen games gevonden in de database",
        });
    });
});
