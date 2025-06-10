export interface Review {
  id: number;
  userId: number;
  username: string;
  gameId: number;
  rating: number;
  comment: string;
}

export interface IReviewService {
  addReview(userId: number, gameId: number, rating: number, comment: string): Promise<void>;
  getReviewsForGame(gameId: number): Promise<Review[]>;
  updateReview(reviewId: number, comment: string): Promise<void>;

  // ✅ Nieuw toegevoegd:
  getReviewById(reviewId: number): Promise<Review | null>;
}

export interface ReviewRequestBody {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  message: string;
}

