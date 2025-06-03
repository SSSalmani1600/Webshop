import { describe, it, expect, beforeEach, vi } from "vitest";
import { LogoutController } from "../controllers/LogoutController";
import { LogoutService } from "../services/LogoutService";
import { Request, Response } from "express";

// Dit test of uitloggen werkt

describe("Logout Tests", () => {
    let logoutController: LogoutController;
    let logoutService: LogoutService;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let clearCookieMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        // Maak nieuwe controller en service voor elke test
        logoutController = new LogoutController();
        logoutService = new LogoutService();
        // Maak een nep clearCookie functie
        clearCookieMock = vi.fn();
        // Maak een nep request en response
        mockRequest = {
            sessionId: "test-session-123",
            res: {
                clearCookie: clearCookieMock,
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            } as unknown as Response,
        };
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    });

    it("should successfully logout user", async () => {
        // Probeer uit te loggen
        await logoutController.logout(mockRequest as Request, mockResponse as Response);
        // Kijk of status 200 terugkomt
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        // Kijk of de juiste boodschap terugkomt
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Successfully logged out" });
        // Kijk of cookies worden verwijderd
        expect(clearCookieMock).toHaveBeenCalledWith("session");
        expect(clearCookieMock).toHaveBeenCalledWith("user");
    });

    it("should handle logout error", async () => {
        // Simuleer een fout bij uitloggen
        vi.spyOn(logoutService, "logout").mockRejectedValue(new Error("Test error"));
        // Probeer uit te loggen
        await logoutController.logout(mockRequest as Request, mockResponse as Response);
        // Kijk of status 500 terugkomt
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        // Kijk of de juiste foutmelding terugkomt
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Logout failed" });
    });
});
