import { Game } from "@api/types/Game";
import "../components/AdminComponent";
import { GamePrices } from "@api/types/GamePrices";
import { NewProduct } from "@api/types/NewProduct";

export async function showProducts(): Promise<Game[]> {
    try {
        const res: Response = await fetch(`${VITE_API_URL}products`);

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const products: Game[] = (await res.json()) as Game[];
        return products;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Fout bij ophalen producten:", error.message);
        }
        else {
            console.error("Fout bij ophalen producten:", String(error));
        }
        throw error;
    }
}

export async function showPrices(gameId: number): Promise<GamePrices[]> {
    try {
        const res: Response = await fetch(`${VITE_API_URL}product-prices/${gameId}`);

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const prices: GamePrices[] = (await res.json()) as GamePrices[];
        return prices;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Fout bij ophalen prijzen:", error.message);
        }
        else {
            console.error("Fout bij ophalen prijzen:", String(error));
        }
        throw error;
    }
}

export async function getProductsWithPrices(): Promise<(Game & { price?: number | null })[]> {
    const products: Game[] = await showProducts();

    return Promise.all(products.map(async product => {
        const prices: GamePrices[] = await showPrices(product.id);
        const price: number | null = prices.length > 0 ? prices[0].price : null;
        return {
            ...product,
            price,
        };
    }));
}

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

        console.log("✅ Product succesvol toegevoegd");
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("❌ Fout bij toevoegen van product:", error.message);
        }
        else {
            console.error("❌ Onbekende fout bij toevoegen van product:", String(error));
        }
    }
}

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
        if (error instanceof Error) {
            console.error("❌ Fout bij verbergen product:", error.message);
        }
        else {
            console.error("❌ Onbekende fout bij verbergen product:", String(error));
        }
        throw error;
    }
}
