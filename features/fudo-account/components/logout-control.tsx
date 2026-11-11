"use client";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "../server/actions";

export function LogoutControl() {
  const [confirm, setConfirm] = useState(false);
  return <div>
    <button className="fudo-nav-link fudo-nav-logout" type="button" onClick={() => setConfirm(true)}><LogOut size={19} aria-hidden="true"/> Вийти з акаунта</button>
    {confirm && <div className="fudo-confirm" role="alertdialog" aria-modal="true" aria-labelledby="fudo-logout-title" aria-describedby="fudo-logout-desc">
      <strong id="fudo-logout-title">Вийти з Fudo?</strong>
      <p id="fudo-logout-desc">Щоб повернутися до профілю, потрібно буде ввійти знову.</p>
      <div className="fudo-confirm-buttons">
        <button type="button" className="fudo-btn fudo-btn-outline" onClick={() => setConfirm(false)}>Скасувати</button>
        <form action={logoutAction}><button type="submit" className="fudo-btn fudo-btn-danger">Вийти</button></form>
      </div>
    </div>}
  </div>;
}
