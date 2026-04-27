import request from "supertest";
import { createApp } from "../app";

// Shared mock instance — health.ts creates PrismaClient once at module load,
// so we must modify the instance's methods (not mock the constructor again).
const mockPrisma = {
  $queryRaw: jest.fn().mockResolvedValue([{ "?column?": 1 }]),
  indexerState: {
    findFirst: jest.fn().mockResolvedValue({ id: "singleton", lastLedger: 1000 }),
  },
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const mockLedgerCall = jest.fn().mockResolvedValue({ records: [{ sequence: 1010 }] });
const mockGetNetwork = jest.fn().mockResolvedValue({ passphrase: "Test SDF Network ; September 2015" });

jest.mock("@stellar/stellar-sdk", () => ({
  // Networks must be present so relayer.ts (imported via app.ts) can
  // access StellarSdk.Networks.TESTNET without throwing.
  Networks: {
    TESTNET: "Test SDF Network ; September 2015",
    PUBLIC: "Public Global Stellar Network ; September 2015",
  },
  Horizon: {
    Server: jest.fn(() => ({
      ledgers: jest.fn(() => ({
        limit: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        call: mockLedgerCall,
      })),
    })),
  },
  rpc: {
    Server: jest.fn(() => ({ getNetwork: mockGetNetwork })),
  },
}));

describe("GET /api/health", () => {
  const app = createApp();

  beforeEach(() => {
    // Reset to healthy defaults before each test.
    mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    mockPrisma.indexerState.findFirst.mockResolvedValue({ id: "singleton", lastLedger: 1000 });
    mockLedgerCall.mockResolvedValue({ records: [{ sequence: 1010 }] });
    mockGetNetwork.mockResolvedValue({ passphrase: "Test SDF Network ; September 2015" });
  });

  it("returns 200 with all components up when healthy", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.database).toBe("up");
    expect(res.body.horizon).toBe("up");
    expect(res.body.sorobanRpc).toBe("up");
    expect(res.body.indexer).toBe("up");
    expect(res.body.timestamp).toBeDefined();
  });

  it("returns 503 when database is down", async () => {
    // Modify the shared instance's method directly.
    mockPrisma.$queryRaw.mockRejectedValueOnce(new Error("Connection refused"));
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(503);
    expect(res.body.database).toBe("down");
  });

  it("returns 503 when horizon is unreachable", async () => {
    mockLedgerCall.mockRejectedValueOnce(new Error("timeout"));
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(503);
    expect(res.body.horizon).toBe("down");
  });

  it("reports indexer warning when lag exceeds threshold", async () => {
    // latestLedger = 1010 (from mockLedgerCall), syncedLedger = 900 → lag 110 > 50
    mockPrisma.indexerState.findFirst.mockResolvedValueOnce({ id: "singleton", lastLedger: 900 });
    const res = await request(app).get("/api/health");
    expect(res.body.indexer).toBe("warning");
    expect(res.body.indexerLag).toBeGreaterThanOrEqual(50);
  });

  it("includes latestLedger and syncedLedger fields", async () => {
    const res = await request(app).get("/api/health");
    expect(typeof res.body.latestLedger).toBe("number");
    expect(typeof res.body.syncedLedger).toBe("number");
  });
});
