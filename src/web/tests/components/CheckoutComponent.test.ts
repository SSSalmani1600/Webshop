import { describe, test, expect, beforeEach, vi } from "vitest";
import { CartSummaryComponent } from "../../src/components/CheckoutproductComponent"; // pas pad aan indien nodig

interface CartItem {
  id: number;
  game_id: number;
  quantity: number;
  price: string;
  title: string;
  thumbnail: string;
}

describe("CartSummaryComponent", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `<div id="test-container"></div>`;
    container = document.getElementById("test-container")!;
  });

  test("render met cart items", async () => {
    const dummyItems: CartItem[] = [
      {
        id: 1,
        game_id: 101,
        quantity: 2,
        price: "10.00",
        title: "Product A",
        thumbnail: "https://example.com/img1.jpg",
      },
      {
        id: 2,
        game_id: 102,
        quantity: 1,
        price: "15.00",
        title: "Product B",
        thumbnail: "https://example.com/img2.jpg",
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ cart: dummyItems }),
    }) as any;

    const comp = new CartSummaryComponent("#test-container");
    await comp.render();

    expect(container.innerHTML).toContain("Product A");
    expect(container.innerHTML).toContain("Product B");
    expect(container.innerHTML).toContain("€35.00"); // 2x10 + 1x15
    expect(container.querySelectorAll("img").length).toBe(2);
    expect(container.querySelector("button")?.textContent).toBe("Bestelling plaatsen");
  });

  test("render met lege winkelwagen", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ cart: [] }),
    }) as any;

    const comp = new CartSummaryComponent("#test-container");
    await comp.render();

    expect(container.innerHTML).toContain("Je winkelwagen is leeg.");
  });

  test("fetch error wordt afgehandeld", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as any;

    const comp = new CartSummaryComponent("#test-container");

    await expect(comp.render()).rejects.toThrow("Kan cart items niet ophalen");
  });
});
