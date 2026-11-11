import type { ReactNode } from "react";
// Reuse the shared Fudo navigation from app/layout.tsx instead of rendering a second header.
export function AccountShell({ children }: { children: ReactNode }) {
  return (
    <div className="fudo-root">
      <main className="fudo-main">{children}</main>
      <footer className="fudo-footer">Fudo · Економимо разом, менше викидаємо · Студентський проєкт</footer>
    </div>
  );
}
