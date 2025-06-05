import { Router, Request, Response } from "express";
import { PostreviewService } from "@api/services/PostreviewService";

// regelt alles met routes voor reviews
export class ReviewController {
    public readonly router: Router;
    private readonly postReviewService: PostreviewService;

    public constructor() {
        this.router = Router(); // maak nieuwe router aan
        this.postReviewService = new PostreviewService(); // service voor reviews

        // route voor review posten
        this.router.post("/games/:id/reviews", this.postReview.bind(this));

        // route voor reviews ophalen
        this.router.get("/games/:id/reviews", this.getReviewsByGameId.bind(this));
    }

    // review opslaan in database
    public async postReview(req: Request, res: Response): Promise<void> {
        try {
            // pak game-id uit URL
            const gameId = parseInt(req.params.id);

            // pak user uit cookie (user moet ingelogd zijn)
            const userIdCookie = req.cookies?.user;
            const userId = parseInt(userIdCookie);

            // pak sterren + comment uit body
            const { rating, comment } = req.body;

            // check of alles klopt
            if (!userId || isNaN(userId) || isNaN(gameId) || !rating || !comment) {
                res.status(401).json({ message: "Je moet ingelogd zijn om een review te plaatsen." });
                return;
            }

            // sla review op in database
            await this.postReviewService.addReview(userId, gameId, rating, comment);

            // stuur succes terug
            res.status(201).json({ message: "Review succesvol toegevoegd." });
        } catch (error) {
            // foutje? laat weten
            console.error("Fout bij postReview:", error);
            res.status(500).json({ message: "Er ging iets mis bij het opslaan van de review." });
        }
    }

    // haalt alle reviews op van game
    public async getReviewsByGameId(req: Request, res: Response): Promise<void> {
        try {
            // pak game-id uit URL
            const gameId = parseInt(req.params.id);

            // check of gameId geldig is
            if (isNaN(gameId)) {
                res.status(400).json({ message: "Ongeldig game ID." });
                return;
            }

            // vraag reviews op uit service
            const reviews = await this.postReviewService.getReviewsForGame(gameId);

            // stuur lijst terug
            res.status(200).json(reviews);
        } catch (error) {
            // als iets crasht
            console.error("Fout bij ophalen reviews:", error);
            res.status(500).json({ message: "Kon reviews niet ophalen." });
        }
    }
}
