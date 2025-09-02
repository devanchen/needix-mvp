export const metadata = { title: "Privacy • Needix" };
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 prose prose-invert">
      <h1>Privacy Policy</h1>
      <p>We respect your privacy. This page explains what we collect and why.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Account info (email, name)</li>
        <li>Order and retailer integration data</li>
        <li>Usage analytics (events, performance)</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To automate reorders you request</li>
        <li>To improve reliability and support</li>
        <li>To send essential notifications</li>
      </ul>
      <h2>Data sharing</h2>
      <p>No selling of personal data. Limited sharing with processors (payments, analytics).</p>
      <h2>Contact</h2>
      <p>Email: support@needix.com</p>
      <p>Last updated: {new Date().toISOString().slice(0,10)}</p>
    </main>
  );
}
