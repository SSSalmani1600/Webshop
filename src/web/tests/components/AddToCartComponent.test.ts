import { describe, test, expect, vi } from "vitest";
import { waitFor } from "@testing-library/dom";
import { AddToCartComponent } from "@web/components/Add_to_cartcomponent";

describe("AddToCartComponent", () => {
    test("should add item to cart", async (): Promise<void> => {
        const dummyGame: { id: number; price: number } = {
            id: 1,
            price: 29.99,
        };

        // Mock fetch for API call
        global.fetch = vi.fn((): Promise<Response> => {
            return Promise.resolve({
                ok: true,
                json: (): Promise<{ success: boolean; message: string }> => Promise.resolve({
                    success: true,
                    message: "Product toegevoegd aan winkelmandje",
                }),
            } as Response);
        });

        const addToCartComponent: AddToCartComponent = new AddToCartComponent();
        addToCartComponent.setAttribute("game-id", dummyGame.id.toString());
        addToCartComponent.setAttribute("price", dummyGame.price.toString());
        document.body.appendChild(addToCartComponent);

        const button: HTMLButtonElement | null = addToCartComponent.querySelector("button");
        expect(button).not.toBeNull();

        button!.click();

        await waitFor(() => {
            const notification: Element | null = document.querySelector(".cart-notification");
            expect(notification).not.toBeNull();
            expect(notification?.textContent).toBe("✅ Toegevoegd aan winkelmandje");
        });
    });
});
