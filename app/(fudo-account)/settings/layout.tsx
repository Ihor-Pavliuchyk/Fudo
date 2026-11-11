import type { ReactNode } from "react";
import { SettingsNav } from "@/features/fudo-account/components/settings-nav";
import { getFudoUser } from "@/features/fudo-account/server/current-user";
export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const user = await getFudoUser();
  return <div className="fudo-settings-layout"><SettingsNav signedIn={Boolean(user)}/><div className="fudo-settings-content">{children}</div></div>;
}
