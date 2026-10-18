import { sendEmail, type EmailInput } from "./email-service";
import { notifyAcceptedLead } from "./telegram-notifications";
// Only website leads use this adapter; SMTP diagnostics keep using sendEmail.
export function createLeadEmailSender({ send = sendEmail, notify = notifyAcceptedLead, }: {
    send?: typeof sendEmail;
    notify?: typeof notifyAcceptedLead;
} = {}) {
    return async (input: EmailInput) => {
        const result = await send(input);
        if (result.success && !result.uncertain) {
            try {
                await notify({ form: "lead" });
            }
            catch { /* Email acceptance remains the only source of the API result. */ }
        }
        return result;
    };
}
export const sendLeadEmail = createLeadEmailSender();
