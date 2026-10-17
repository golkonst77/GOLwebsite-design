import { z } from "zod";
import { CONSENT_VERSION, UTM_KEYS } from "./lexradar-constants";

const singleLine = z
  .string()
  .trim()
  .refine(
    (value) => !/[\u0000-\u001f\u007f]/.test(value),
    "Не используйте управляющие символы",
  );
export const lexradarSchema = z.object({
  requestId: z.string().uuid(),
  consentVersion: z.literal(CONSENT_VERSION),
  site: singleLine.pipe(z.string().max(500)).refine((value) => {
    try {
      const url = new URL(value);
      return (
        ["http:", "https:"].includes(url.protocol) &&
        Boolean(url.hostname) &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "Укажите адрес сайта с http:// или https://"),
  name: singleLine.pipe(z.string().min(1).max(100)),
  email: singleLine.pipe(z.string().email().max(254)),
  phone: singleLine
    .pipe(
      z
        .string()
        .max(30)
        .regex(/^\+?[\d ()\-]*$/),
    )
    .refine((value) => !value || /^\d{7,15}$/.test(value.replace(/\D/g, "")))
    .optional()
    .default(""),
  comment: z
    .string()
    .trim()
    .max(2000)
    .refine(
      (value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value),
    )
    .optional()
    .default(""),
  company: z.string().max(200).optional().default(""),
  consent: z.literal(true),
  utm: z
    .object(
      Object.fromEntries(
        UTM_KEYS.map((key) => [
          key,
          singleLine.pipe(z.string().max(200)).optional(),
        ]),
      ),
    )
    .optional(),
});
