// data die je meestuurt als je review post
export interface ReviewRequestBody {
    userId: number;     // wie schrijft review
    rating: number;     // aantal sterren
    comment: string;    // wat je zegt
    username?: string;  // optioneel: naam
}

// antwoord dat backend terugstuurt
export interface ReviewResponse {
    message: string;    // bv "Review geplaatst"
}

// hoe review eruitziet bij ophalen
export interface ReviewItem {
    rating: number;     // sterren
    comment: string;    // tekst
    username: string;   // wie zei het
}
