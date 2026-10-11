
import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState(null);
  const [shortCode, setShortCode] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Send the long URL to our FastAPI backend
  async function handleShorten(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setShortenedUrl(null);
    setStats(null);
    setCopied(false);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }

      const data = await response.json();

      setShortenedUrl(data.short_url);
      setShortCode(data.short_code);
      setUrl("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Copy the shortened link to the clipboard
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
    } catch {
      setError("Unable to copy the link");
    }
  }

  // Retrieve click analytics from FastAPI
  async function handleStats() {
    setError("");

    try {
      const response = await fetch(
        `/api/stats/${encodeURIComponent(shortCode)}`
      );

      if (!response.ok) {
        throw new Error("Failed to retrieve statistics");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-5">
          <h1 className="text-2xl font-bold text-blue-400">
            Shortly.
          </h1>
          <span className="ml-auto text-sm text-slate-400">
            URL Shortener
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Make every link count.
          </h2>
          <p className="mt-5 text-slate-400">
            Shorten long URLs, share them easily,
            and track your clicks.
          </p>
        </div>

        <form
          onSubmit={handleShorten}
          className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl"
        >
          <label
            htmlFor="long-url"
            className="mb-3 block font-medium"
          >
            Enter your long URL
          </label>

          <input
            id="long-url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            className="w-full rounded-lg border border-slate-600 bg-slate-900 p-4 text-white outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Shortening..." : "Shorten URL"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-5 text-center text-red-400">
            {error}
          </p>
        )}

        {shortenedUrl && (
          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800 p-6">
            <h3 className="mb-3 text-lg font-semibold">
              Your shortened URL
            </h3>

            <a
              href={shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-blue-400 hover:underline"
            >
              {shortenedUrl}
            </a>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={handleCopy}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>

              <button
                onClick={handleStats}
                className="rounded-lg bg-slate-700 px-5 py-3 font-medium hover:bg-slate-600"
              >
                View Statistics
              </button>
            </div>
          </div>
        )}

        {stats && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
              <p className="text-sm text-slate-400">
                Total Clicks
              </p>
              <p className="mt-2 text-4xl font-bold">
                {stats.clicks}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
              <p className="text-sm text-slate-400">
                Created At
              </p>
              <p className="mt-3 font-medium">
                {new Date(stats.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
