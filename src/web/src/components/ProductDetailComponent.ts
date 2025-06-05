import type { Game } from "@api/types/Game";
import type { ReviewRequestBody } from "@web/interfaces/IReviewService";
import { PostreviewApiService } from "@web/services/PostreviewApiService";
import "@web/components/AddToWishlistComponent";

interface SessionData {
    sessionId: string;
    username: string;
}

interface ReviewResponse {
    message: string;
}

export class GameDetailComponent extends HTMLElement {
    private shadow: ShadowRoot;

    public constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    public connectedCallback(): void {
        this.renderLoading();
        void this.loadGame();
    }

    private renderLoading(): void {
        this.shadow.innerHTML = "<p style=\"color: white;\">Game wordt geladen...</p>";
    }

    private async loadGame(): Promise<void> {
        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        const gameId: string | null = urlParams.get("id");

        if (!gameId) {
            this.shadow.innerHTML = "<p style=\"color: red;\">Geen game ID opgegeven.</p>";
            return;
        }

        try {
            const { sessionId, username } = await this.getSession();

            const response: Response = await fetch(`${VITE_API_URL}game?id=${gameId}`, {
                headers: {
                    "x-session": sessionId,
                },
            });

            if (!response.ok) throw new Error("Kon game niet ophalen.");

            const game: Game = await response.json() as Game;
            this.renderGame(game, parseInt(gameId), username);
        }
        catch (error) {
            this.shadow.innerHTML = "<p style=\"color: red;\">Fout: " + (error as Error).message + "</p>";
        }
    }

    private async getSession(): Promise<SessionData> {
        const res: Response = await fetch(`${VITE_API_URL}session`, {
            credentials: "include", // cookies meesturen
        });
        const data: unknown = await res.json();

        if (
            typeof data === "object" &&
            data !== null &&
            "sessionId" in data &&
            "username" in data &&
            typeof (data as SessionData).sessionId === "string" &&
            typeof (data as SessionData).username === "string"
        ) {
            return data as SessionData;
        }

        throw new Error("Invalid session object");
    }

    private renderGame(
        game: {
            title: string;
            thumbnail: string;
            descriptionHtml: string;
            price?: number | null;
        },
        gameId: number,
        username: string
    ): void {
        this.shadow.innerHTML = `
            <div class="box" style="max-width: 1500px; margin: 0 auto 20px auto;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h2><br><strong>${game.title}</strong></h2>
                    <add-to-wishlist game-id="${gameId}"></add-to-wishlist>
                </div>
                <img src="${game.thumbnail}" alt="${game.title}" />
            </div>

            <div class="info-boxes">
                <div class="box">
                    <h3>Description</h3>
                    ${game.descriptionHtml}
                </div>
                <div class="box">
                    <h3>Reviews:</h3>
                    <div id="reviews-output"></div>

                    <textarea id="review-input" rows="4" placeholder="Schrijf hier je review..." 
                        style="width: 100%; padding: 10px; border-radius: 8px; resize: vertical; margin-bottom: 10px;"></textarea>

                    <div id="star-rating" style="margin-bottom: 10px; font-size: 24px; color: gray; cursor: pointer;">
                        <span data-value="1">☆</span>
                        <span data-value="2">☆</span>
                        <span data-value="3">☆</span>
                        <span data-value="4">☆</span>
                        <span data-value="5">☆</span>
                    </div>

                    <button id="submit-review" style="padding: 10px 20px; border-radius: 999px; background-color: #7f41f5; color: white; border: none; cursor: pointer;">Plaatsen</button>
                    <div id="review-status" style="margin-top: 10px; color: lightgreen;"></div>
                </div>
            </div>
        `;

        // service om review naar backend te sturen
        const reviewService: PostreviewApiService = new PostreviewApiService();

        // knop waarmee je review verstuurt
        const reviewButton: HTMLButtonElement | null = this.shadow.querySelector("#submit-review");

        // vak waar je de tekst van je review typt
        const reviewInput: HTMLTextAreaElement | null = this.shadow.querySelector("#review-input");

        // plek waar succes- of foutmelding getoond wordt
        const reviewStatus: HTMLDivElement | null = this.shadow.querySelector("#review-status");

        // naam van huidige gebruiker
        const currentUsername: string = username;

        // hoeveel sterren gekozen (default = 0)
        let selectedRating: number = 0;

        // alle sterren-elementen op de pagina
        const stars: NodeListOf<HTMLSpanElement> = this.shadow.querySelectorAll("#star-rating span");

        // klik op ster = waarde zetten en stijl aanpassen
        stars.forEach(star => {
            star.addEventListener("click", () => {
                selectedRating = parseInt(star.dataset.value || "0");

                // sterren inkleuren tot gekozen waarde
                stars.forEach((s, index) => {
                    s.textContent = index < selectedRating ? "★" : "☆";
                    s.style.color = index < selectedRating ? "gold" : "gray";
                });
            });
        });

        // als je op knop klikt
        reviewButton?.addEventListener("click", async () => {
            const comment: string | undefined = reviewInput?.value.trim(); // haal tekst op
            const rating: number = selectedRating;
            const userId: number = 1; // placeholder userId (moet uit sessie komen eigenlijk)

            // check of alle velden zijn ingevuld
            if (!comment || rating < 1) {
                reviewStatus!.textContent = "Vul een review én een waardering in.";
                reviewStatus!.style.color = "red";
                return;
            }

            // maak review body aan
            const body: ReviewRequestBody = {
                userId,
                rating,
                comment,
                username: currentUsername,
            };

            // stuur review naar backend
            const response: ReviewResponse = await reviewService.postReview(gameId, body);

            // toon reactie van backend
            reviewStatus!.textContent = response.message;
            reviewStatus!.style.color = "lightgreen";

            // reset tekst en sterren
            reviewInput!.value = "";
            selectedRating = 0;
            stars.forEach(s => {
                s.textContent = "☆";
                s.style.color = "gray";
            });

            // herlaad reviews onderaan
            await this.loadReviews(gameId);
        });

        // bij laden: haal meteen reviews op
        void this.loadReviews(gameId);
    }

    private async loadReviews(gameId: number): Promise<void> {
        const output: HTMLElement | null = this.shadow.querySelector("#reviews-output");
        if (!output) return;

        try {
            const res: Response = await fetch(`${VITE_API_URL}api/games/${gameId}/reviews`, {
                credentials: "include",
            });
            const reviews: unknown = await res.json();

            if (!Array.isArray(reviews)) return;

            output.innerHTML = reviews
                .map((r: { rating: number; comment: string; username?: string }) => `
                    <div style="margin-bottom: 10px;">
                        <strong style="color: #fff;">${r.username || "Anoniem"}</strong><br/>
                        <span style="color: gold; font-size: 16px;">
                            ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}
                        </span><br/>
                        <span style="color: #ccc; font-size: 14px;">${r.comment}</span>
                    </div>
                `)
                .join("");
        }
        catch {
            output.innerHTML = "<p style='color:red;'>Kon reviews niet ophalen.</p>";
        }
    }
}

customElements.define("game-detail-page", GameDetailComponent);
