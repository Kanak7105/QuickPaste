// Fires 50 simultaneous reads at one burn-after-read paste and checks that
// exactly one of them gets the content.
// Usage: npm run test:burn   (server must be running; API_URL defaults to localhost:5000)

const API_URL = process.env.API_URL || "http://localhost:5000";
const REQUESTS = 50; // stays under the 60/min read limit

const secret = `burn-test-${Date.now()}`;

// 1. Create the paste
const createRes = await fetch(`${API_URL}/api/pastes`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content: secret, expiresIn: "10m", burnAfterRead: true }),
}).catch(() => {
  console.error(`Could not reach ${API_URL}. Is the server running (npm run dev)?`);
  process.exit(1);
});
if (!createRes.ok) {
  console.error(`Could not create paste: ${createRes.status} ${await createRes.text()}`);
  process.exit(1);
}
const { id } = await createRes.json();
console.log(`Created burn-after-read paste ${id}`);

// 2. Send all reads at once
console.log(`Sending ${REQUESTS} simultaneous GET requests...`);
const results = await Promise.all(
  Array.from({ length: REQUESTS }, async () => {
    const res = await fetch(`${API_URL}/api/pastes/${id}`);
    const body = await res.json();
    return { status: res.status, gotContent: body.content === secret };
  })
);

// 3. Tally the results
const counts = {};
for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
const winners = results.filter((r) => r.status === 200 && r.gotContent).length;

console.log("Status codes:", counts);
console.log(`Requests that saw the content: ${winners}`);

if (counts[429]) {
  console.log("Some requests were rate limited (429). Wait a minute and run again.");
  process.exit(1);
}
if (winners === 1 && counts[404] === REQUESTS - 1) {
  console.log("PASS: exactly one request read the paste, the rest got 404");
} else {
  console.log("FAIL: expected exactly one 200 and the rest 404");
  process.exit(1);
}
