import { z } from "zod";

export const lexradarSchema = z.object({
  site: z
    .string()
    .trim()
    .max(500)
    .url()
    .refine((value) => {
      const url = new URL(value);
      return (
        ["https:", "http:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      );
    }, "Укажите публичный адрес сайта с http:// или https://"),
  name: z.string().trim().min(1).max(100),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .refine((value) => !/[\r\n]/.test(value)),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s()\-]*$/)
    .optional()
    .default(""),
  comment: z.string().trim().max(2000).optional().default(""),
  company: z.string().max(200).optional().default(""),
  consent: z.literal(true),
  utm: z
    .object({
      utm_source: z.string().max(200).optional(),
      utm_medium: z.string().max(200).optional(),
      utm_campaign: z.string().max(200).optional(),
      utm_term: z.string().max(200).optional(),
      utm_content: z.string().max(200).optional(),
    })
    .optional(),
});
