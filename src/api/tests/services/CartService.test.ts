import { describe, it, expect, vi, beforeEach } from "vitest";
import { CartService } from "@api/services/CartService";
import { CartItem } from "@api/types/CartItem";

interface CartTotals {
    subtotal: number;
    total: number;
    discountPercentage: number;
}

describe("CartService", () => {
    let service: CartService;

    beforeEach(() => {
        service = new CartService();
        vi.clearAllMocks();
    });

    it("should calculate total price correctly with multiple items", async () => {
        const mockCartItems: CartItem[] = [
            {
                id: 1,
                user_id: 1,
                game_id: 1,
                title: "Game 1",
                price: 29.99,
                quantity: 2,
                thumbnail: "game1.jpg",
            },
            {
                id: 2,
                user_id: 1,
                game_id: 2,
                title: "Game 2",
                price: 19.99,
                quantity: 1,
                thumbnail: "game2.jpg",
            },
        ];

        const expectedResult: CartTotals = {
            subtotal: 79.97, // (29.99 * 2) + 19.99
            total: 79.97,
            discountPercentage: 0,
        };

        const result: CartTotals = await service.calculateCartTotals(mockCartItems, undefined, 1);

        expect(result).toEqual(expectedResult);
        expect(result.subtotal).toBe(79.97);
        expect(result.total).toBe(79.97);
    });
});
