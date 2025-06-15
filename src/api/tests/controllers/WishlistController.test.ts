import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { WishlistController } from "@api/controllers/WishlistController";
import { WishlistService } from "@api/services/WishlistService";
import { WishlistItem } from "@api/types/WishlistItem";
import { Request, Response } from "express";

vi.mock("@api/services/WishlistService");

interface WishlistRequest extends Request {
    userId?: number;
    params: {
        id?: string;
    };
}

describe("WishlistController", () => {
    let controller: WishlistController;
    let mockService: Partial<WishlistService>;
    let res: Partial<Response>;

    beforeEach(() => {
        mockService = {
            getWishlistItemsByUser: vi.fn(),
            deleteWishlistItemById: vi.fn(),
        };

        (WishlistService as Mock).mockImplementation(() => mockService);
        controller = new WishlistController();

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    });

    it("should return wishlist items", async () => {
        const mockWishlistItems: WishlistItem[] = [{
            id: 1,
            game_id: 1,
            user_id: 1,
            title: "Test Game",
            thumbnail: "test.jpg",
            created_at: "2024-03-20",
        }];

        (mockService.getWishlistItemsByUser as Mock).mockResolvedValue(mockWishlistItems);

        const req: WishlistRequest = { userId: 1 } as WishlistRequest;
        await controller.getWishlist(req, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockWishlistItems);
    });

    it("should remove item from wishlist", async () => {
        (mockService.deleteWishlistItemById as Mock).mockResolvedValue(undefined);

        const req: WishlistRequest = { userId: 1, params: { id: "1" } } as WishlistRequest;
        await controller.deleteWishlistItem(req, res as Response);

        expect(res.status).toHaveBeenCalledWith(204);
    });

    it("should return 401 if user not logged in", async () => {
        const req: WishlistRequest = { userId: undefined } as WishlistRequest;
        await controller.getWishlist(req, res as Response);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Gebruiker is niet ingelogd" });
    });
});
