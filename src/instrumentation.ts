// Next runs this once at server startup. Under `npm run dev:mock`
// (MOCK_BACKEND=1) we start the MSW server so every server-side upstream
// fetch to FastAPI/OpenRouter is intercepted by src/mocks/*. Guarded to the
// Node.js runtime so it never loads in the Edge runtime or the browser.
//
// This project uses a `src/` directory, so the file lives at `src/instrumentation.ts`
// (Next looks there instead of the project root). instrumentation is stable on Next 15 —
// no `experimental.instrumentationHook` needed in next.config.ts.
export async function register() {
  if (process.env.MOCK_BACKEND === "1" && process.env.NEXT_RUNTIME === "nodejs") {
    const { server } = await import("./mocks/server");
    server.listen({ onUnhandledRequest: "warn" });
  }
}
