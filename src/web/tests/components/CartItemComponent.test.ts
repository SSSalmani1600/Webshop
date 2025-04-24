import { describe, test, expect } from "vitest";
import { CartItemComponent } from "../../src/components/CartItemComponent";
import type { CartItem } from "../../src/interfaces/CartItem";

describe("CartItemComponent", () => {
    test("should render cart item details", () => {
        const dummyProduct: CartItem = {
            id: 1,
            title: "Test Product",
            thumbnail: "https://via.placeholder.com/120",
            price: 19.99,
            quantity: 2,
        };

        console.log("Testing CartItemComponent with product:", dummyProduct);

        const component: CartItemComponent = new CartItemComponent(dummyProduct);
        document.body.appendChild(component);

        const titleElement: HTMLElement | null = component.querySelector(".item-title");
        console.log("dummy title:", titleElement?.textContent);
        expect(titleElement?.textContent).toBe("Test Product");

        const priceElement: HTMLElement | null = component.querySelector(".item-price");
        console.log("dummy price:", priceElement?.textContent);
        expect(priceElement?.textContent).toBe("€19.99");

        const quantityElement: HTMLElement | null = component.querySelector(".item-quantity");
        console.log("dummy quantity:", quantityElement?.textContent);
        expect(quantityElement?.textContent).toBe("Aantal: 2");

        const imgElement: HTMLImageElement | null = component.querySelector("img");
        console.log("dummy image src:", imgElement?.getAttribute("src"));
        console.log("dummy image alt:", imgElement?.getAttribute("alt"));
        expect(imgElement?.getAttribute("src")).toBe("https://via.placeholder.com/120");
        expect(imgElement?.getAttribute("alt")).toBe("Test Product");
    });
});
