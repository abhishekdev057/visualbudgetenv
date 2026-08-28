const baseUrl = process.env.ACCEPTANCE_BASE_URL ?? "http://127.0.0.1:3000";
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const password = "EnvelopeAcceptance!42";
const accounts = [
  { displayName: "Acceptance Alpha", email: `alpha-${runId}@example.test`, token: "" },
  { displayName: "Acceptance Beta", email: `beta-${runId}@example.test`, token: "" },
];

type JsonRecord = Record<string, unknown>;
async function request(path: string, options: RequestInit = {}, token?: string, expected = 200) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const payload = await response.json() as { success: boolean; data?: unknown; error?: { code: string; message: string } };
  if (response.status !== expected || (expected < 400 && !payload.success)) throw new Error(`${options.method ?? "GET"} ${path}: expected ${expected}, received ${response.status} (${payload.error?.code ?? "unknown"})`);
  return payload.data as JsonRecord;
}
function post(path: string, body: unknown, token?: string, expected = 201) { return request(path, { method: "POST", body: JSON.stringify(body) }, token, expected); }
function patch(path: string, body: unknown, token: string) { return request(path, { method: "PATCH", body: JSON.stringify(body) }, token); }
function remove(path: string, body: unknown, token: string) { return request(path, { method: "DELETE", body: JSON.stringify(body) }, token); }
function assertEqual(actual: unknown, expected: unknown, label: string) { if (actual !== expected) throw new Error(`${label}: expected ${expected}, received ${actual}`); }

async function cleanup() {
  await Promise.all(accounts.filter((account) => account.token).map(async (account) => {
    try { await remove("/api/v1/account", { password, confirmation: "DELETE" }, account.token); } catch { /* best-effort cleanup */ }
  }));
}

async function main() {
  try {
    for (const account of accounts) {
      const data = await post("/api/v1/auth/register", { displayName: account.displayName, email: account.email, password, client: "mobile" });
      account.token = String(data.accessToken);
    }
    const budget = await post("/api/v1/budgets", { year: 2098, month: 8, income: "50000.00", envelopes: [
      { name: "Food", icon: "Utensils", accent: "amber", type: "expense", allocatedAmount: "8000.00" },
      { name: "Rent", icon: "House", accent: "cyan", type: "expense", allocatedAmount: "15000.00" },
      { name: "Future fund", icon: "PiggyBank", accent: "violet", type: "savings", allocatedAmount: "10000.00" },
    ] }, accounts[0].token);
    const budgetId = String(budget.id);
    const envelopes = budget.envelopes as JsonRecord[];
    const foodId = String(envelopes.find((item) => item.name === "Food")?.id);
    const rentId = String(envelopes.find((item) => item.name === "Rent")?.id);
    const savingsId = String(envelopes.find((item) => item.name === "Future fund")?.id);
    await request(`/api/v1/budgets/${budgetId}`, {}, accounts[1].token, 404);
    const groceries = await post("/api/v1/transactions", { budgetMonthId: budgetId, envelopeId: foodId, title: "Weekly groceries", amount: "1200.00", transactionDate: "2098-08-08T00:00:00.000Z", merchant: "Market" }, accounts[0].token);
    await post("/api/v1/transactions", { budgetMonthId: budgetId, envelopeId: rentId, title: "August rent", amount: "14000.00", transactionDate: "2098-08-01T00:00:00.000Z" }, accounts[0].token);
    await post("/api/v1/transactions", { budgetMonthId: budgetId, envelopeId: savingsId, title: "Monthly transfer", amount: "10000.00", transactionDate: "2098-08-02T00:00:00.000Z" }, accounts[0].token);
    await request(`/api/v1/transactions/${groceries.id}`, {}, accounts[1].token, 404);
    await patch(`/api/v1/transactions/${groceries.id}`, { amount: "1300.00" }, accounts[0].token);
    await patch(`/api/v1/transactions/${groceries.id}`, { amount: "1200.00", note: "Acceptance edit verified" }, accounts[0].token);
    const disposable = await post("/api/v1/transactions", { budgetMonthId: budgetId, envelopeId: foodId, title: "Delete verification", amount: "50.00", transactionDate: "2098-08-09T00:00:00.000Z" }, accounts[0].token);
    await remove(`/api/v1/transactions/${disposable.id}`, {}, accounts[0].token);
    const summary = await request(`/api/v1/budgets/${budgetId}/summary`, {}, accounts[0].token);
    assertEqual(summary.totalAllocated, "33000.00", "total allocated"); assertEqual(summary.unallocated, "17000.00", "unallocated"); assertEqual(summary.totalSpent, "15200.00", "total spent"); assertEqual(summary.available, "34800.00", "available");
    const copied = await post(`/api/v1/budgets/${budgetId}/copy`, { year: 2098, month: 9 }, accounts[0].token);
    assertEqual(copied.totalSpent, "0.00", "copied-month spending"); assertEqual((copied.envelopes as JsonRecord[]).every((item) => item.transactionCount === 0), true, "copy excludes transactions");
    const page = await request(`/api/v1/transactions?budgetId=${budgetId}&limit=2&sort=highest`, {}, accounts[0].token);
    assertEqual((page.items as unknown[]).length, 2, "paginated activity size");
    if (!page.nextCursor) throw new Error("paginated activity did not return an opaque cursor");
    await request(`/api/v1/transactions?budgetId=${budgetId}&limit=2&sort=highest&cursor=${encodeURIComponent(String(page.nextCursor))}`, {}, accounts[0].token);
    await request("/api/v1/insights?year=2098&month=8", {}, accounts[0].token);
    await request("/api/v1/export", {}, accounts[0].token);
    await request("/api/v1/auth/logout", { method: "POST" }, accounts[0].token);
    await request("/api/v1/auth/me", {}, accounts[0].token, 401);
    const login = await post("/api/v1/auth/login", { email: accounts[0].email, password, client: "mobile" }, undefined, 200);
    accounts[0].token = String(login.accessToken);
    await request("/api/v1/auth/me", {}, accounts[0].token);
    await cleanup(); accounts.forEach((account) => { account.token = ""; });
    console.log("Acceptance flow passed: two-user isolation, lifecycle totals, copy-forward, pagination, insights, export, session rotation, and cleanup.");
  } catch (error) { await cleanup(); throw error; }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Acceptance flow failed"); process.exitCode = 1; });
