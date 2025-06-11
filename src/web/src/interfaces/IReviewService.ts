export interface ReviewRequestBody {
    userId: number;
    rating: number;
    comment: string;
    username?: string; 
}

export interface ReviewResponse {
    message: string;
}

export interface ReviewItem {
    rating: number;
    comment: string;
    username: string;
}
