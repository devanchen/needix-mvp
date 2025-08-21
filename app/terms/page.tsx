export const metadata = { title: "Terms • Needix" };
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 prose prose-invert">
      <h1>Terms of Service</h1>
      <p>By using Needix you agree to these terms.</p>
      <h2>Service</h2>
      <p>We place orders with partnered retailers according to your settings and price ceilings.</p>
      <h2>Billing</h2>
      <p>Membership fees and/or per‑order fees apply as shown on Pricing.</p>
      <h2>Cancellation</h2>
      <p>Cancel anytime from your dashboard. Prorations may apply where required.</p>
      <h2>Liability</h2>
      <p>Service provided “as is” to the extent permitted by law.</p>
      <h2>Contact</h2>
      <p>support@needix.com</p>
      <p>Last updated: {new Date().toISOString().slice(0,10)}</p>
    </main>
  );
}
