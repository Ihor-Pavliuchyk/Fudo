import { z } from "zod";

const email = z.email("Вкажіть коректну електронну пошту").max(254).transform((x) => x.trim().toLowerCase());
const password = z.string().min(10, "Пароль повинен містити щонайменше 10 символів").max(128);
export const loginSchema = z.object({ email, password: z.string().min(1) });
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ім’я надто коротке").max(80),
  email,
  password,
  confirmPassword: z.string(),
  consent: z.literal("on", { error: "Потрібно погодитися з правилами" }),
}).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Паролі не збігаються" });
export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.union([z.literal(""), z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Вкажіть коректний номер")]),
});
export const passwordChangeSchema = z.object({
  oldPassword: z.string().min(1),
  password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Паролі не збігаються" });
export const resetSchema = z.object({ token: z.string().min(32), password, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Паролі не збігаються" });
export const emailChangeSchema = z.object({ newEmail: email, password: z.string().min(1) });
export const supportSchema = z.object({
  subject: z.string().trim().min(5, "Коротко опишіть проблему").max(120),
  message: z.string().trim().min(20, "Додайте трохи більше деталей").max(3000),
});
