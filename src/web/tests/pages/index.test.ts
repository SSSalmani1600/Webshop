import userEvent, { UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { deepQuerySelector } from "../__helpers__/web.helpers";

import { SessionResponse, WelcomeResponse } from "@shared/types";
import { WebshopEvent } from "@web/enums/WebshopEvent";
import { IndexPageComponent } from "@web/pages";
import { WebshopEventService } from "@web/services/WebshopEventService";

beforeEach(() => {
    // Clear and reset all mocks
    vi.clearAllMocks();
    vi.resetAllMocks();
});

describe("Index page", () => {
    test("page should render", () => {
        // Arrange
        const page: IndexPageComponent = new IndexPageComponent();
        document.body.append(page);

        const result1: HTMLElement = deepQuerySelector(document, "nav a:nth-of-type(2)")!;
        const result2: HTMLElement = deepQuerySelector(document, "h1")!;

        // Act / Assert
        expect(result1.innerHTML.trim()).toEqual("Example");
        expect(result2.innerHTML.trim()).toEqual("Welkom bij de LucaStars Webshop!");
    });

    test("public text button should change result and trigger event", async () => {
        // Arrange
        const page: IndexPageComponent = new IndexPageComponent();
        document.body.append(page);

        const result1: HTMLElement = deepQuerySelector(document, "#public-text-button")!;
        const result2: HTMLElement = deepQuerySelector(document, "#result")!;

        fetchMock.mockResponse(request => {
            if (request.url.endsWith("/welcome")) {
                return {
                    status: 200,
                    body: JSON.stringify(<WelcomeResponse>{
                        message: "test-123",
                    }),
                };
            }

            throw new Error();
        });

        vi.spyOn(WebshopEventService.prototype, "dispatchEvent");

        // Act
        const user: UserEvent = userEvent.setup();
        await user.click(result1);

        // Assert
        expect(result2.innerHTML.trim()).toContain("test-123");
        expect(WebshopEventService.prototype["dispatchEvent"])
            .toBeCalledWith(WebshopEvent.Welcome, "test-123");
    });

    test("create session button should change result", async () => {
        // Arrange
        const page: IndexPageComponent = new IndexPageComponent();
        document.body.append(page);

        const result1: HTMLElement = deepQuerySelector(document, "#create-session-button")!;
        const result2: HTMLElement = deepQuerySelector(document, "#result")!;

        fetchMock.mockResponse(request => {
            if (request.url.endsWith("/session")) {
                return {
                    status: 200,
                    body: JSON.stringify(<SessionResponse>{
                        sessionId: "test-123",
                    }),
                };
            }

            throw new Error();
        });

        // Act
        const user: UserEvent = userEvent.setup();
        await user.click(result1);

        // Assert
        expect(result2.innerHTML.trim()).toContain("test-123");
    });
});
