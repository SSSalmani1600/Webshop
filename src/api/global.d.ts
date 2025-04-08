declare global {
    namespace Express {
        export interface Request {
            sessionId?: string;
            userId?: number;
        }
    }
}

export { };
