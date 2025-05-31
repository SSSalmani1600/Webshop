import { describe, it, expect, beforeEach } from "vitest";
import { WishlistItemComponent } from "../../components/WishlistItemComponent";

// Dit test of de wishlist item component goed werkt

interface MockWishlistItem {
    id: number;
    game_id: number;
    price: number;
    title: string;
    thumbnail: string;
}

describe("WishlistItemComponent Tests", () => {
    let wishlistItem: WishlistItemComponent;
    const mockItem: MockWishlistItem = {
        id: 1,
        game_id: 123,
        price: 29.99,
        title: "Test Game",
        thumbnail: "test.jpg",
    };

    beforeEach(() => {
        // Maak een nieuwe component voor elke test
        wishlistItem = new WishlistItemComponent(mockItem);
        document.body.appendChild(wishlistItem);
    });

    it("rendert de component correct", () => {
        // Kijk of de component de juiste HTML heeft
        expect(wishlistItem.innerHTML).toContain(`data-id="${mockItem.id}"`);
        expect(wishlistItem.innerHTML).toContain(mockItem.title);
        expect(wishlistItem.innerHTML).toContain(mockItem.thumbnail);
        expect(wishlistItem.innerHTML).toContain(`€${mockItem.price.toFixed(2)}`);
    });

    it("gaat naar game detail pagina bij klik", () => {
        // Mock de window.location
        const originalLocation: Location = window.location;
        Object.defineProperty(window, "location", {
            value: { href: "" },
            writable: true,
        });

        // Klik op de component
        const wishlistItemElement: HTMLElement | null = wishlistItem.querySelector(".wishlist-item");
        if (wishlistItemElement) {
            wishlistItemElement.click();
        }

        // Kijk of de juiste URL is ingesteld
        expect(window.location.href).toBe(`gameDetail.html?id=${mockItem.game_id}`);

        // Herstel window.location
        Object.defineProperty(window, "location", {
            value: originalLocation,
            writable: true,
        });
    });

    it("geeft een error bij ongeldige data", () => {
        // Test met ongeldige data
        expect(() => new WishlistItemComponent(null)).toThrow("Invalid item passed to WishlistItemComponent");
        expect(() => new WishlistItemComponent({})).toThrow("Invalid WishlistItem structure");
    });
});
