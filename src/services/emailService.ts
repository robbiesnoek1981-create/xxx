import emailjs from '@emailjs/react-native';
import * as MailComposer from 'expo-mail-composer';
import Constants from 'expo-constants';

export type SendResult =
  | { method: 'emailjs'; success: true }
  | { method: 'mailcomposer'; success: true }
  | { method: 'mailcomposer'; success: false; reason: 'unavailable' | 'cancelled' }
  | { method: 'emailjs'; success: false; error: unknown };

const RECIPIENT = 'r.snoek@sthelmond.nl';
const EMAIL_SUBJECT = 'Korte Contacten Registratie';

/**
 * Sends the registration form data by email.
 * Primary path: EmailJS (background send, no mail app needed).
 * Fallback: expo-mail-composer (opens native mail app pre-filled).
 */
export async function sendRegistration(emailBody: string): Promise<SendResult> {
  const extra = (Constants.expoConfig?.extra ?? {}) as {
    emailjsServiceId?: string;
    emailjsTemplateId?: string;
    emailjsPublicKey?: string;
  };

  const { emailjsServiceId, emailjsTemplateId, emailjsPublicKey } = extra;
  const emailjsConfigured = emailjsServiceId && emailjsTemplateId && emailjsPublicKey;

  // Primary path: EmailJS (one-tap, no mail app required)
  if (emailjsConfigured) {
    try {
      await emailjs.send(
        emailjsServiceId,
        emailjsTemplateId,
        {
          to_email: RECIPIENT,
          subject: EMAIL_SUBJECT,
          message: emailBody,
          sent_at: new Date().toISOString(),
        },
        { publicKey: emailjsPublicKey }
      );
      return { method: 'emailjs', success: true };
    } catch (error) {
      console.warn('[emailService] EmailJS failed, trying mail composer:', error);
    }
  }

  // Fallback: expo-mail-composer (opens native mail app)
  const isAvailable = await MailComposer.isAvailableAsync();
  if (!isAvailable) {
    return { method: 'mailcomposer', success: false, reason: 'unavailable' };
  }

  const result = await MailComposer.composeAsync({
    recipients: [RECIPIENT],
    subject: EMAIL_SUBJECT,
    body: emailBody,
    isHtml: false,
  });

  if (result.status === MailComposer.MailComposerStatus.SENT) {
    return { method: 'mailcomposer', success: true };
  }
  return { method: 'mailcomposer', success: false, reason: 'cancelled' };
}
