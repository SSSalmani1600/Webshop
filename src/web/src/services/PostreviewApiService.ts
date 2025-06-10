import type { ReviewRequestBody, ReviewResponse } from "@web/interfaces/IReviewService";

// service die review naar backend stuurt
export class PostreviewApiService {
    // stuurt review naar backend
    public async postReview(gameId: number, review: ReviewRequestBody): Promise<ReviewResponse> {
        try {
            // haal sterren + comment uit review-object
            const { rating, comment } = review;

            // stuur POST-verzoek naar backend
            const response: Response = await fetch(`${VITE_API_URL}api/games/${gameId}/reviews`, {
                method: "POST", // dit is een POST (dus iets sturen)
                headers: {
                    "Content-Type": "application/json", // zeg dat je JSON stuurt
                },
                credentials: "include", // stuur ook cookies mee (voor user info)
                body: JSON.stringify({ rating, comment }), // zet sterren + comment in body
            });

            // wacht op antwoord en geef terug
            return await response.json();
        } catch (error) {
            // als fout gebeurt, toon melding
            console.error("Fout bij review plaatsen:", error);
            return { message: "Er ging iets mis met je review." };
        }
    }
}
