import type { ReviewRequestBody, ReviewResponse } from "@web/interfaces/IReviewService";

export class PostreviewApiService {
    public async postReview(gameId: number, review: ReviewRequestBody): Promise<ReviewResponse> {
        try {
            const { rating, comment } = review;

            const response: Response = await fetch(`${VITE_API_URL}api/games/${gameId}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ rating, comment }),
            });

            return await response.json();
        } catch (error) {
            console.error("Fout bij review plaatsen:", error);
            return { message: "Er ging iets mis met je review." };
        }
    }
}
