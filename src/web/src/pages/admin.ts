import { Game } from "@api/types/Game";
import "../components/AdminComponent";
import { GamePrices } from "@api/types/GamePrices";
import { NewProduct } from "@api/types/NewProduct";

/**
 * Fetches a list of all products (games) from the API.
 * @returns Promise containing an array of Game objects.
 */
export async function showProducts(): Promise<Game[]> {
    try {
        const res: Response = await fetch(`${VITE_API_URL}products`);

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        return (await res.json()) as Game[];
    }
    catch (error) {
        console.error("Error fetching products:", error instanceof Error ? error.message : String(error));
        throw error;
    }
}

/**
 * Fetches prices for a specific product (game) by its ID.
 * @param gameId - The ID of the game to fetch prices for.
 * @returns Promise containing an array of GamePrices.
 */
export async function showPrices(gameId: number): Promise<GamePrices[]> {
    try {
        const res: Response = await fetch(`${VITE_API_URL}product-prices/${gameId}`);

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        return (await res.json()) as GamePrices[];
    }
    catch (error) {
        console.error("Error fetching prices:", error instanceof Error ? error.message : String(error));
        throw error;
    }
}

/**
 * Combines product data with the first available price for each product.
 * @returns Promise containing an array of Game objects with an optional price property.
 */
export async function getProductsWithPrices(): Promise<(Game & { price?: number | null })[]> {
    const products: Game[] = await showProducts();

    return Promise.all(
        products.map(async product => {
            const prices: GamePrices[] = await showPrices(product.id);
            const price: number | null = prices.length > 0 ? prices[0].price : null;
            return { ...product, price };
        })
    );
}

/**
 * Sends a new product to the API to be added to the database.
 * @param game - The new product data to add.
 * @returns Promise resolving when the product is added.
 */
export async function addProduct(game: NewProduct): Promise<void> {
    try {
        const response: Response = await fetch(`${VITE_API_URL}add-product`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(game),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
    }
    catch (error) {
        console.error("Error adding product:", error instanceof Error ? error.message : String(error));
        throw error;
    }
}

/**
 * Updates the hidden status of a product (used to hide or show products).
 * @param id - The ID of the product to update.
 * @param hide - Boolean value indicating whether to hide (true) or unhide (false) the product.
 * @returns Promise resolving when the hidden status is updated.
 */
export async function hideProduct(id: number, hide: boolean): Promise<void> {
    try {
        const res: Response = await fetch(`${VITE_API_URL}products/${id}/hidden`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ hidden: hide }),
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }
    }
    catch (error) {
        console.error("Error hiding product:", error instanceof Error ? error.message : String(error));
        throw error;
    }
}
