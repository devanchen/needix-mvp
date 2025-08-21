export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-4xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-white/70">The page you’re looking for doesn’t exist or moved.</p>
      <a href="/" className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-medium text-gray-900">Back home</a>
    </main>
  );
}
