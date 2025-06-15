import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { CartController } from "@api/controllers/CartController";
import { CartService } from "@api/services/CartService";
import { CartItem } from "@api/types/CartItem";
import { Request, Response } from "express";

vi.mock("@api/services/CartService");

interface CartWithTotals {
    cart: CartItem[];
    subtotal: number;
    total: number;
    discountPercentage: number;
}

interface CartRequest extends Request {
    userId?: number;
    params: {
        id?: string;
    };
    body: {
        quantity?: number;
    };
}

describe("CartController", () => {
    let controller: CartController;
    let mockService: Partial<CartService>;
    let res: Partial<Response>;

    beforeEach(() => {
        mockService = {
            getCartItemsByUser: vi.fn(),
            deleteCartItemById: vi.fn(),
            updateCartItemQuantity: vi.fn(),
        };

        (CartService as Mock).mockImplementation(() => mockService);
        controller = new CartController();

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    });

    it("should return cart items", async () => {
        const mockCartItems: CartItem[] = [{
            id: 1,
            user_id: 1,
            game_id: 1,
            title: "Test Game",
            price: 29.99,
            quantity: 1,
            thumbnail: "test.jpg",
        }];

        (mockService.getCartItemsByUser as Mock).mockResolvedValue(mockCartItems);

        const req: CartRequest = { userId: 1 } as CartRequest;
        await controller.getCart(req, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockCartItems);
    });

    it("should remove item from cart", async () => {
        (mockService.deleteCartItemById as Mock).mockResolvedValue(undefined);

        const req: CartRequest = { userId: 1, params: { id: "1" } } as CartRequest;
        await controller.deleteCartItem(req, res as Response);

        expect(res.status).toHaveBeenCalledWith(204);
    });

    it("should update item quantity", async () => {
        const mockUpdatedCart: CartWithTotals = {
            cart: [{
                id: 1,
                user_id: 1,
                game_id: 1,
                title: "Test Game",
                price: 29.99,
                quantity: 2,
                thumbnail: "test.jpg",
            }],
            subtotal: 59.98,
            total: 59.98,
            discountPercentage: 0,
        };

        (mockService.updateCartItemQuantity as Mock).mockResolvedValue(mockUpdatedCart);

        const req: CartRequest = { userId: 1, params: { id: "1" }, body: { quantity: 2 } } as CartRequest;
        await controller.updateCartItemQuantity(req, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUpdatedCart);
    });
});
