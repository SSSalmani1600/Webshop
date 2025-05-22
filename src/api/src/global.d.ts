/// <reference types="express" />

declare namespace Express {
    export interface Request {
        /**
         * Session ID van de gebruiker
         */
        sessionId?: string;

        /**
         * ID van de gebruiker
         */
        userId?: number;
    }
}
