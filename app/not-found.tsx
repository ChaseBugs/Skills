import Link from "next/link";
export default function NotFound() {
  return (
    <main className="center-state">
      <h1>Page not found</h1>
      <p>This link may have been replaced or is no longer available.</p>
      <Link className="button primary" href="/">
        Go to workspace
      </Link>
    </main>
  );
}
