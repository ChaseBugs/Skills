"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="center-state">
      <h1>Something went wrong</h1>
      <p>The workspace could not be loaded. Please try again.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
