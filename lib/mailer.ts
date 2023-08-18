interface MailTarget {
  name?: string;
  email: string;
}

export interface SendEmailsParams {
  to: MailTarget[];
  subject: string;
  content: string;
}

export type SendEmailResponse =
  | {
      success: true;
    }
  | {
      success: false;
      error: {
        code: number;
        message: string;
      };
    };

const SENDER_NAME = 'Sunrise Briefing';
const SENDER_EMAIL = 'sunrise-briefing@gmail.com';
const BASE_URL = 'https://api.brevo.com/v3/smtp';

export const sendEmails = async ({
  subject,
  to,
  content,
}: SendEmailsParams): Promise<SendEmailResponse> => {
  const data = {
    sender: {
      name: SENDER_NAME,
      email: SENDER_EMAIL,
    },
    to,
    subject,
    htmlContent: content,
  };

  try {
    const response = await fetch(`${BASE_URL}/email`, {
      headers: {
        accept: 'application/json',
        'api-key': '',
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: { code: response.status, message: response.statusText },
    };
  } catch (error: any) {
    return {
      success: false,
      error: { code: 500, message: error.message },
    };
  }
};
