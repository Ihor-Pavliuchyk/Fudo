"use client";
import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { loginAction, registerAction, requestPasswordResetAction, resetPasswordAction, updateProfileAction, changePasswordAction, requestEmailChangeAction, updateNotificationPrefsAction, createSupportTicketAction, verifyNewEmailAction } from "../server/actions";
import { emptyResult, type ActionResult } from "../server/action-types";

type Act = (previous: ActionResult, formData: FormData) => Promise<ActionResult>;
function useForm(action: Act) { return useActionState(action, emptyResult); }
function Submit({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="fudo-btn fudo-btn-primary" disabled={pending}>{pending ? "Зачекайте…" : children}</button>;
}
function Alert({ status }: { status: ActionResult }) {
  return status.message ? <div role="status" className={`fudo-alert ${status.ok ? "fudo-alert-ok" : "fudo-alert-err"}`}>{status.message}</div> : null;
}
function PasswordInput({ name, label, autoComplete = "new-password" }: { name: string; label: string; autoComplete?: string }) {
  return <label className="fudo-field">{label}<input className="fudo-input" name={name} type="password" autoComplete={autoComplete} minLength={name === "oldPassword" ? 1 : 10} maxLength={128} required /></label>;
}

export function LoginForm({ next = "" }: { next?: string }) {
  const [state, action] = useForm(loginAction);
  return <form className="fudo-form" action={action}>
    <input type="hidden" name="next" value={next} />
    <label className="fudo-field">Електронна пошта<input className="fudo-input" name="email" type="email" autoComplete="email" placeholder="student@example.com" required /></label>
    <PasswordInput name="password" label="Пароль" autoComplete="current-password" />
    <div className="fudo-line fudo-line-end"><Link href="/forgot-password">Забули пароль?</Link></div>
    <Alert status={state}/><Submit>Увійти</Submit>
    <p className="fudo-hint fudo-center">Ще немає акаунта? <Link href="/register">Зареєструватися</Link></p>
  </form>;
}
export function RegisterForm() {
  const [state, action] = useForm(registerAction);
  return <form className="fudo-form" action={action}>
    <label className="fudo-field">Ваше ім’я<input className="fudo-input" name="name" autoComplete="name" minLength={2} maxLength={80} required placeholder="Юрій"/></label>
    <label className="fudo-field">Електронна пошта<input className="fudo-input" name="email" type="email" autoComplete="email" required placeholder="student@example.com"/></label>
    <PasswordInput name="password" label="Пароль (від 10 символів)" />
    <PasswordInput name="confirmPassword" label="Повторіть пароль" />
    <label className="fudo-checkbox"><input type="checkbox" name="consent" required /> <span>Погоджуюся з <Link href="/settings/about/terms">правилами</Link> та <Link href="/settings/about/privacy">політикою конфіденційності</Link></span></label>
    <Alert status={state}/><Submit>Створити акаунт</Submit>
    <p className="fudo-hint fudo-center">Вже маєте акаунт? <Link href="/login">Увійти</Link></p>
  </form>;
}
export function ForgotPasswordForm() {
  const [state, action] = useForm(requestPasswordResetAction);
  return <form action={action} className="fudo-form">
    <label className="fudo-field">Електронна пошта<input className="fudo-input" type="email" name="email" autoComplete="email" required /></label>
    <Alert status={state}/><Submit>Надіслати посилання</Submit>
    <p className="fudo-hint fudo-center"><Link href="/login">Повернутися до входу</Link></p>
  </form>;
}
export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useForm(resetPasswordAction);
  return <form action={action} className="fudo-form">
    <input type="hidden" name="token" value={token}/>
    <PasswordInput name="password" label="Новий пароль" />
    <PasswordInput name="confirmPassword" label="Повторіть новий пароль" />
    <Alert status={state}/><Submit>Зберегти новий пароль</Submit>
  </form>;
}
export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, action] = useForm(updateProfileAction);
  return <form action={action} className="fudo-form">
    <label className="fudo-field">Ім’я<input className="fudo-input" name="name" defaultValue={name} autoComplete="name" minLength={2} maxLength={80} required /></label>
    <label className="fudo-field">Телефон (необов’язково)<input className="fudo-input" name="phone" defaultValue={phone} autoComplete="tel" placeholder="+380 00 000 00 00"/></label>
    <Alert status={state}/><Submit>Зберегти дані</Submit>
  </form>;
}
export function ChangePasswordForm() {
  const [state, action] = useForm(changePasswordAction);
  return <form action={action} className="fudo-form">
    <PasswordInput name="oldPassword" label="Поточний пароль" autoComplete="current-password" />
    <PasswordInput name="password" label="Новий пароль" />
    <PasswordInput name="confirmPassword" label="Повторіть новий пароль" />
    <Alert status={state}/><Submit>Змінити пароль</Submit>
    <p className="fudo-muted fudo-small">Після зміни пароля потрібно буде ввійти повторно.</p>
  </form>;
}
export function ChangeEmailForm() {
  const [state, action] = useForm(requestEmailChangeAction);
  return <form action={action} className="fudo-form">
    <label className="fudo-field">Нова електронна пошта<input className="fudo-input" type="email" name="newEmail" autoComplete="email" required /></label>
    <PasswordInput name="password" label="Підтвердіть поточним паролем" autoComplete="current-password" />
    <Alert status={state}/><Submit>Підтвердити зміну email</Submit>
    <p className="fudo-muted fudo-small">Посилання для підтвердження надійде на нову адресу.</p>
  </form>;
}
export function VerifyEmailForm({ token }: { token: string }) {
  const [state, action] = useForm(verifyNewEmailAction);
  return <form action={action} className="fudo-form"><input type="hidden" name="token" value={token} /><Alert status={state}/><Submit>Підтвердити нову адресу</Submit></form>;
}
export function NotificationPrefsForm({ discounts, promotions, orderStatus }: { discounts: boolean; promotions: boolean; orderStatus: boolean }) {
  const [state, action] = useForm(updateNotificationPrefsAction);
  return <form action={action} className="fudo-form">
    <label className="fudo-switch-row"><span><strong>Нові знижки</strong><small>Вигідні товари у магазинах</small></span><input type="checkbox" name="discounts" defaultChecked={discounts} /></label>
    <label className="fudo-switch-row"><span><strong>Акції</strong><small>Спеціальні пропозиції магазинів</small></span><input type="checkbox" name="promotions" defaultChecked={promotions} /></label>
    <label className="fudo-switch-row"><span><strong>Статус замовлення</strong><small>Зміни у ваших групових і звичайних замовленнях</small></span><input type="checkbox" name="orderStatus" defaultChecked={orderStatus} /></label>
    <Alert status={state}/><Submit>Зберегти налаштування</Submit>
  </form>;
}
export function SupportForm() {
  const [state, action] = useForm(createSupportTicketAction);
  return <form action={action} className="fudo-form">
    <label className="fudo-field">Тема звернення<input className="fudo-input" name="subject" minLength={5} maxLength={120} placeholder="Наприклад: помилка під час замовлення" required /></label>
    <label className="fudo-field">Опишіть проблему<textarea className="fudo-input fudo-textarea" name="message" minLength={20} maxLength={3000} rows={5} required placeholder="Що сталося? Коли? Якого результату очікували?" /></label>
    <Alert status={state}/><Submit>Надіслати звернення</Submit>
  </form>;
}
