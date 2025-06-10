// tests/services/ActionService.spec.ts

import { beforeEach, describe, expect, test, vi } from "vitest";
import { createMockDatabaseService, MockDatabaseService } from "../__helpers__/databaseService.helpers";

import { ActionService } from "../../src/services/ActionService";
import type { Actie } from "../../src/types/Actie";
import { DatabaseService } from "@api/services/DatabaseService";

vi.mock("../../src/services/DatabaseService");

describe("ActionService.getActieByProductA", () => {
    let mockDatabaseService: MockDatabaseService;
    let actionService: ActionService;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetAllMocks();

        mockDatabaseService = createMockDatabaseService();
        actionService = new ActionService(mockDatabaseService as unknown as DatabaseService);
    });

    test("returns Actie when a row exists", async () => {
        const fakeActieRow: Actie = {
            id: 5,
            product_a_id: 42,
            product_b_id: 99,
            slogan: "Test 1+1 actie",
            start_datum: "2025-01-01",
            eind_datum: "2025-12-31",
            actief: true,
        };

        mockDatabaseService.query.mockResolvedValue([[fakeActieRow]]);

        const result: Actie | null = await actionService.getActieByProductA(42);

        expect(mockDatabaseService.query).toHaveBeenCalledWith(
            expect.anything(),
            expect.stringContaining("SELECT * FROM actions"),
            [42, expect.any(String)]
        );
        expect(result).toEqual(fakeActieRow);
    });

    test("returns null when no rows found", async () => {
        mockDatabaseService.query.mockResolvedValue([[]]);

        const result: Actie | null = await actionService.getActieByProductA(123);

        expect(result).toBeNull();
        expect(mockDatabaseService.query).toHaveBeenCalled();
    });
});
