declare global {
    namespace Express {
        export interface Request {
            sessionId?: string;
            userId?: number;
            username?: string;
        }
    }
}

export { };
