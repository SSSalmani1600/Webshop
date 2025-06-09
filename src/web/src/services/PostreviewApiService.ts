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

    // ✅ NIEUW: review bijwerken
    public async updateReview(reviewId: number, comment: string): Promise<ReviewResponse> {
        try {
            const response: Response = await fetch(`${VITE_API_URL}api/reviews/${reviewId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ comment }),
            });

            return await response.json();
        } catch (error) {
            console.error("Fout bij review bijwerken:", error);
            return { message: "Er ging iets mis met het bijwerken van je review." };
        }
    }
}
