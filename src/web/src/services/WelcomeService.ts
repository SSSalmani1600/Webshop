import { SecretResponse, SessionResponse, WelcomeResponse } from "@shared/types";
import { IWelcomeService } from "@web/interfaces/IWelcomeService";

/**
 * This controller demonstrates the use of sessions, cookies and Services.
 *
 * @remarks This class should be removed from the final product!
 */
export class WelcomeService implements IWelcomeService {
    public async getSession(): Promise<string> {
        const API_BASE: string = window.location.hostname.includes("localhost")
            ? "http://localhost:3001"
            : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud";

        const response: Response = await fetch(`${API_BASE}/session`, {
            credentials: "include",
        });

        const sessionResponse: SessionResponse = await response.json() as unknown as SessionResponse;

        return sessionResponse.sessionId;
    }

    public async deleteSession(): Promise<void> {
        const API_BASE: string = window.location.hostname.includes("localhost")
            ? "http://localhost:3001"
            : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud";

        await fetch(`${API_BASE}/session`, {
            method: "DELETE",
            credentials: "include",
        });
    }

    public async getWelcome(): Promise<string> {
        const API_BASE: string = window.location.hostname.includes("localhost")
            ? "http://localhost:3001"
            : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud";

        const response: Response = await fetch(`${API_BASE}/welcome`, {
            credentials: "include",
        });

        const welcomeResponse: WelcomeResponse = await response.json() as unknown as WelcomeResponse;

        return welcomeResponse.message;
    }

    public async getSecret(): Promise<string> {
        const API_BASE: string = window.location.hostname.includes("localhost")
            ? "http://localhost:3001"
            : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud";

        const response: Response = await fetch(`${API_BASE}/secret`, {
            credentials: "include",
        });

        const secretResponse: SecretResponse = await response.json() as unknown as SecretResponse;

        return `Je bent user ID ${secretResponse.userId} met sessie ID ${secretResponse.sessionId}!`;
    }
}
