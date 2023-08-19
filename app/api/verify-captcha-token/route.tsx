import { NextResponse } from 'next/server';
import { z } from 'zod';

const postMethodSchema = z.object({
  token: z.string(),
});

export async function POST(request: Request) {
  const bodyCheck = postMethodSchema.safeParse(request.body);

  // If the request body is invalid, return a 400 error with the validation errors
  if (!bodyCheck.success) {
    const { errors } = bodyCheck.error;

    return NextResponse.json(
      {
        error: { message: 'Invalid request', errors },
      },
      { status: 400 }
    );
  }

  try {
    const { token } = bodyCheck.data;
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${token}`,
      { method: 'POST' }
    );

    const result = await response.json();

    return NextResponse.json(
      {
        success: true,
        isValidToken: result.success,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error verifying token',
      },
      { status: 500 }
    );
  }
}
