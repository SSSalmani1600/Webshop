import { describe, it, expect, beforeEach, vi } from "vitest";
import { DiscountController } from "../controllers/DiscountController";
import { DiscountService } from "../services/DiscountService";
import { Request, Response } from "express";
import { DiscountCodeRequestBody } from "../interfaces/IDiscountService";

// Dit test of de kortingscode werkt

describe("DiscountController Tests", () => {
    let discountController: DiscountController;
    let discountService: DiscountService;
    let mockRequest: Request<object, object, DiscountCodeRequestBody>;
    let mockResponse: Response;

    beforeEach(() => {
        // Maak nieuwe controller en service voor elke test
        discountController = new DiscountController();
        discountService = new DiscountService();
        // Maak een nep request en response
        mockRequest = {
            body: { code: "TEST123" },
        } as Request<object, object, DiscountCodeRequestBody>;
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;
        // Vervang de echte service door de mock
        Object.defineProperty(discountController, "discountService", {
            value: discountService,
        });
    });

    it("geeft korting als code geldig is", async () => {
        // Mock de service zodat hij altijd een geldige code teruggeeft
        vi.spyOn(discountService, "validateDiscountCode").mockResolvedValue({
            valid: true,
            discountPercentage: 15,
            code: "TEST123",
        });
        // Probeer korting toe te passen
        await discountController.applyDiscount(mockRequest, mockResponse);
        // Kijk of er korting wordt gegeven
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: true,
            valid: true,
            discountPercentage: 15,
            code: "TEST123",
        });
    });

    it("geeft geen korting als code ongeldig is", async () => {
        // Mock de service zodat hij altijd ongeldig teruggeeft
        vi.spyOn(discountService, "validateDiscountCode").mockResolvedValue({
            valid: false,
        });
        // Probeer korting toe te passen
        await discountController.applyDiscount(mockRequest, mockResponse);
        // Kijk of er geen korting wordt gegeven
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            valid: false,
            discountPercentage: 0,
            code: "TEST123",
        });
    });
});
