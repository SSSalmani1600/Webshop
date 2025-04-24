import { describe, test, expect, beforeEach, vi } from "vitest";
import { waitFor } from "@testing-library/dom";
import { GameList } from "@web/components/ProductComponent";
import type { Game } from "../../../api/src/types/Game";
import type { GamePrices } from "../../../api/src/types/GamePrices";

interface MockSession {
    sessionId: string;
}

// Mock response data
const mockGames: Game[] = [
    {
        id: 1,
        title: "Test Game",
        images: "https://example.com/image.jpg",
        thumbnail: "Test Thumbnail",
        descriptionMarkdown: "Test descriptionMarkdown",
        descriptionHtml: "Test descriptionHtml",
        url: "Test url",
        authors: "Test authors",
        tags: "Test tags",
        price: null,
    },
];

const mockPrices: GamePrices[] = [
    {
        productId: 1,
        price: 29.99,
        currency: "Euro",
    },
];

const mockSession: MockSession = { sessionId: "abc123" };

beforeEach(() => {
    vi.resetAllMocks();

    global.fetch = vi.fn((url: RequestInfo | URL): Promise<Response> => {
        if (url === "http://localhost:3001/session") {
            return Promise.resolve({
                ok: true,
                json: (): Promise<MockSession> => Promise.resolve(mockSession),
            } as Response);
        }

        if (url === "http://localhost:3001/products") {
            return Promise.resolve({
                ok: true,
                json: (): Promise<Game[]> => Promise.resolve(mockGames),
            } as Response);
        }

        if (url === "http://localhost:3001/product-prices/1") {
            return Promise.resolve({
                ok: true,
                json: (): Promise<GamePrices[]> => Promise.resolve(mockPrices),
            } as Response);
        }

        return Promise.reject(new Error("Unknown URL"));
    });
});

describe("GameList Component", () => {
    test("shows games and their prices", async (): Promise<void> => {
        const gameList: GameList = new GameList();
        document.body.appendChild(gameList);

        await waitFor(() => {
            const shadow: ShadowRoot = gameList.shadowRoot!;
            const gameEl: Element | null = shadow.querySelector(".game");
            const titleEl: Element | null = shadow.querySelector("strong");
            const priceEl: Element | null = shadow.querySelector(".price");

            expect(gameEl).not.toBeNull();
            expect(titleEl?.textContent).toBe("Test Game");
            expect(priceEl?.textContent).toContain("€ 29.99");
        });
    });
});
