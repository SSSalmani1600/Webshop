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
    id?: number; // ✅ toegevoegd zodat frontend weet welk review bewerkt wordt
}

// ✅ optioneel: aparte body voor PUT-request
export interface ReviewUpdateBody {
    comment: string;
}
