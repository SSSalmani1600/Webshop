import { Router, Request, Response } from "express";
import { PostreviewService } from "@api/services/PostreviewService";

interface ReviewRequestBody {
    rating: number;
    comment: string;
}

interface ReviewResponse {
    rating: number;
    comment: string;
    username: string;
}

export class ReviewController {
    public readonly router: Router;
    private readonly postReviewService: PostreviewService;

    public constructor() {
        this.router = Router();
        this.postReviewService = new PostreviewService();

        this.router.post("/games/:id/reviews", this.postReview.bind(this));
        this.router.get("/games/:id/reviews", this.getReviewsByGameId.bind(this));
    }

    public async postReview(req: Request<{ id: string }, unknown, ReviewRequestBody>, res: Response): Promise<void> {
        try {
            const gameId: number = parseInt(req.params.id);
            const userIdCookie: unknown = req.cookies.user;
            const userId: number = parseInt(String(userIdCookie));
            const { rating, comment }: ReviewRequestBody = req.body;

            if (!userId || isNaN(userId) || isNaN(gameId) || !rating || !comment) {
                res.status(401).json({ message: "Je moet ingelogd zijn om een review te plaatsen." });
                return;
            }

            await this.postReviewService.addReview(userId, gameId, rating, comment);

            res.status(201).json({ message: "Review succesvol toegevoegd." });
        }
        catch {
            res.status(500).json({ message: "Er ging iets mis bij het opslaan van de review." });
        }
    }

    public async getReviewsByGameId(req: Request<{ id: string }>, res: Response): Promise<void> {
        try {
            const gameId: number = parseInt(req.params.id);

            if (isNaN(gameId)) {
                res.status(400).json({ message: "Ongeldig game ID." });
                return;
            }

            const reviews: ReviewResponse[] = await this.postReviewService.getReviewsForGame(gameId);
            res.status(200).json(reviews);
        }
        catch {
            res.status(500).json({ message: "Kon reviews niet ophalen." });
        }
    }
}
