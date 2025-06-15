import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { DiscountController } from "@api/controllers/DiscountController";
import { DiscountService } from "@api/services/DiscountService";
import { DiscountValidationResult } from "@api/interfaces/IDiscountService";
import { Request, Response } from "express";

vi.mock("@api/services/DiscountService");

interface DiscountRequest extends Request {
    userId?: number;
    body: {
        code: string;
    };
}

describe("DiscountController", () => {
    let controller: DiscountController;
    let mockService: Partial<DiscountService>;
    let res: Partial<Response>;

    beforeEach(() => {
        mockService = {
            validateDiscountCode: vi.fn(),
        };

        (DiscountService as Mock).mockImplementation(() => mockService);
        controller = new DiscountController();

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    });

    it("should apply valid discount code", async () => {
        const mockDiscountResult: DiscountValidationResult = {
            valid: true,
            discountPercentage: 20,
        };

        (mockService.validateDiscountCode as Mock).mockResolvedValue(mockDiscountResult);

        const req: DiscountRequest = { userId: 1, body: { code: "SUMMER2024" } } as DiscountRequest;
        await controller.applyDiscount(req, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockDiscountResult);
    });

    it("should reject invalid discount code", async () => {
        const mockDiscountResult: DiscountValidationResult = {
            valid: false,
            discountPercentage: 0,
        };

        (mockService.validateDiscountCode as Mock).mockResolvedValue(mockDiscountResult);

        const req: DiscountRequest = { userId: 1, body: { code: "INVALID" } } as DiscountRequest;
        await controller.applyDiscount(req, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(mockDiscountResult);
    });

    it("should return 401 if user not logged in", async () => {
        const req: DiscountRequest = { userId: undefined, body: { code: "SUMMER2024" } } as DiscountRequest;
        await controller.applyDiscount(req, res as Response);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Gebruiker is niet ingelogd" });
    });
});
