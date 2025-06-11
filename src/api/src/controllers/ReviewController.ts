import { Router, Request, Response } from "express";
import { PostreviewService } from "@api/services/PostreviewService";

interface User {
    username: string;
}

interface Review {
    id?: number;
    username: string;
    rating: number;
    comment: string;
}

interface ReviewRequestBody {
    rating: number;
    comment: string;
}

interface UpdateReviewRequestBody {
    comment: string;
}

export class ReviewController {
    public readonly router: Router;
    private readonly postReviewService: PostreviewService;

    public constructor() {
        this.router = Router();
        this.postReviewService = new PostreviewService();

        this.router.post("/games/:id/reviews", this.postReview.bind(this));
        this.router.get("/games/:id/reviews", this.getReviewsByGameId.bind(this));
        this.router.put("/reviews/:id", this.updateReview.bind(this));
        this.router.delete("/reviews/:id", this.deleteReview.bind(this));
    }

    public async postReview(req: Request, res: Response): Promise<void> {
        try {
            const gameId: number = parseInt(req.params.id, 10);
            const userIdCookie: unknown = req.cookies.user;
            const userId: number = typeof userIdCookie === "string" ? parseInt(userIdCookie, 10) : NaN;
            const { rating, comment }: ReviewRequestBody = req.body as ReviewRequestBody;

            if (!userId || isNaN(userId) || isNaN(gameId) || !rating || !comment) {
                res.status(401).json({ message: "Je moet ingelogd zijn om een review te plaatsen." });
                return;
            }

            await this.postReviewService.addReview(userId, gameId, rating, comment);

            res.status(201).json({ message: "Review succesvol toegevoegd." });
        }
        catch (error) {
            console.error("Fout bij postReview:", error);
            res.status(500).json({ message: "Er ging iets mis bij het opslaan van de review." });
        }
    }

    public async getReviewsByGameId(req: Request, res: Response): Promise<void> {
        try {
            const gameId: number = parseInt(req.params.id, 10);

            if (isNaN(gameId)) {
                res.status(400).json({ message: "Ongeldig game ID." });
                return;
            }

            const reviews: Review[] = await this.postReviewService.getReviewsForGame(gameId);
            res.status(200).json(reviews);
        }
        catch (error) {
            console.error("Fout bij ophalen reviews:", error);
            res.status(500).json({ message: "Kon reviews niet ophalen." });
        }
    }

    public async updateReview(req: Request, res: Response): Promise<void> {
        try {
            const reviewId: number = parseInt(req.params.id, 10);
            const { comment }: UpdateReviewRequestBody = req.body as UpdateReviewRequestBody;
            const userIdCookie: unknown = req.cookies.user;
            const userId: number = typeof userIdCookie === "string" ? parseInt(userIdCookie, 10) : NaN;

            if (!userId || isNaN(userId) || !comment || isNaN(reviewId)) {
                res.status(400).json({ message: "Ongeldige invoer of niet ingelogd." });
                return;
            }

            const gebruiker: User | null = await this.postReviewService.getUsernameByUserId(userId);

            if (!gebruiker) {
                res.status(404).json({ message: "Gebruiker niet gevonden." });
                return;
            }

            const username: string = gebruiker.username;
            console.log("⛳ userId uit cookie:", userId);
            console.log("⛳ username uit DB:", username);

            const review: Review | null = await this.postReviewService.getReviewById(reviewId);

            if (!review) {
                res.status(404).json({ message: "Review niet gevonden." });
                return;
            }

            console.log("⛳ review.username:", review.username);
            console.log("⛳ vergelijking:", review.username === username);

            if (review.username !== username) {
                res.status(403).json({ message: "Je mag alleen je eigen review bewerken." });
                return;
            }

            await this.postReviewService.updateReview(reviewId, comment);
            res.status(200).json({ message: "Review succesvol bijgewerkt." });
        }
        catch (error) {
            console.error("Fout bij updateReview:", error);
            res.status(500).json({ message: "Kon review niet bijwerken." });
        }
    }

    public async deleteReview(req: Request, res: Response): Promise<void> {
        try {
            const reviewId: number = parseInt(req.params.id, 10);
            const userIdCookie: unknown = req.cookies.user;
            const userId: number = typeof userIdCookie === "string" ? parseInt(userIdCookie, 10) : NaN;

            if (!userId || isNaN(userId) || isNaN(reviewId)) {
                res.status(401).json({ message: "Je moet ingelogd zijn om een review te verwijderen." });
                return;
            }

            const gebruiker: User | null = await this.postReviewService.getUsernameByUserId(userId);
            if (!gebruiker) {
                res.status(404).json({ message: "Gebruiker niet gevonden." });
                return;
            }

            const review: Review | null = await this.postReviewService.getReviewById(reviewId);
            if (!review) {
                res.status(404).json({ message: "Review niet gevonden." });
                return;
            }

            if (review.username !== gebruiker.username) {
                res.status(403).json({ message: "Je mag alleen je eigen review verwijderen." });
                return;
            }

            await this.postReviewService.deleteReview(reviewId);
            res.status(200).json({ message: "Review succesvol verwijderd." });
        }
        catch (error) {
            console.error("Fout bij deleteReview:", error);
            res.status(500).json({ message: "Er ging iets mis bij het verwijderen van de review." });
        }
    }
}
