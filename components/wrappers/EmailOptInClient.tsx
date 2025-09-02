// components/wrappers/EmailOptInClient.tsx
"use client";

import EmailOptIn from "@/components/notifications/EmailOptIn";

export default function EmailOptInClient(props: { initialEnabled: boolean; userEmail: string }) {
  return <EmailOptIn initialEnabled={props.initialEnabled} userEmail={props.userEmail} />;
}
