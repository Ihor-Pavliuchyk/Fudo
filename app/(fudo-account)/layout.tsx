import type { ReactNode } from "react";
import { AccountShell } from "@/features/fudo-account/components/shell";
import "@/features/fudo-account/components/account.css";
export default function FudoAccountLayout({ children }: { children: ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
