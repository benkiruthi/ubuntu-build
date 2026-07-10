import { Resend } from "resend";

let _client: Resend | null = null;

export function getResendClient(): Resend {
  if (!_client) {
    _client = new Resend(process.env.RESEND_API_KEY);
  }
  return _client;
}

export const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@ebbli.co";
export const FROM_NAME = process.env.FROM_NAME ?? "Ebbli Build";
export const FROM = `${FROM_NAME} <${FROM_EMAIL}>`;
