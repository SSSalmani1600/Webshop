import { describe, test, expect, beforeEach } from "vitest";
import { addProduct, hideProduct } from "../../src/pages/admin";
import type { NewProduct } from "@api/types/NewProduct";

beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.doMock();

    globalThis.fetch = (input, init) => {
        if (typeof input === "string" && input.startsWith("/")) {
            input = `http://localhost:3000${input}`;
        }
        return fetchMock(input, init);
    };

    fetchMock.mockIf(/^http:\/\/localhost:3000\/.*/, async req => {
        if (req.url.endsWith("/add-product") && req.method === "POST") {
            const body: Partial<NewProduct> = (await req.json()) as Partial<NewProduct>;

            if (body.title === "Broken Game") {
                return {
                    status: 500,
                    body: "Server error",
                };
            }

            return { status: 200 };
        }

        if (
            req.url.includes("/products/") &&
            req.url.endsWith("/hidden") &&
            req.method === "PATCH"
        ) {
            const body: { hidden?: boolean } = (await req.json()) as { hidden?: boolean };

            if (body.hidden === true && req.url.includes("123")) {
                return {
                    status: 500,
                    body: "Server error",
                };
            }

            return { status: 200 };
        }

        return { status: 404, body: "Not Found" };
    });
});

describe("Admin functions", () => {
    test("should add a new product successfully", async () => {
        const newGame: NewProduct = {
            title: "Test Game",
            descriptionHtml: "Test Description",
            images: "test.jpg",
        };

        await addProduct(newGame);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];

        expect(url).toContain("http://localhost:3000/add-product");
        expect(options?.method).toBe("POST");
        expect(JSON.parse(options!.body as string)).toEqual(newGame);
    });

    test("should throw an error if adding product fails", async () => {
        const newGame: NewProduct = {
            title: "Broken Game",
            descriptionHtml: "Fail",
            images: "fail.jpg",
        };

        await expect(addProduct(newGame)).rejects.toThrow("Server error: 500");
    });

    test("should hide a product (set inactive)", async () => {
        const productId: number = 42;
        const hide: boolean = true;

        await hideProduct(productId, hide);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];

        expect(url).toContain(`http://localhost:3000/products/${productId}/hidden`);
        expect(options?.method).toBe("PATCH");
        expect(JSON.parse(options!.body as string)).toEqual({ hidden: true });
    });

    test("should throw an error if hiding product fails", async () => {
        await expect(hideProduct(123, true)).rejects.toThrow("Server error: 500");
    });
});
