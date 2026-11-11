export type ActionResult = { ok: boolean; message: string };
export const emptyResult: ActionResult = { ok: false, message: "" };
export function friendlyZodError(issues: ReadonlyArray<{ message: string }>) {
  return issues[0]?.message ?? "Перевірте правильність даних";
}
