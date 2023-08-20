import { render } from '@react-email/render';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendEmails } from '../../../lib/mailer';
import { getBriefingTemplateMail } from '../../../lib/templating';
import { Database } from '../../../types/supabase';

export async function sendBriefingMails() {
  const rootSupabase = createRouteHandlerClient<Database>(
    { cookies },
    { supabaseKey: process.env.SUPABASE_SERVICE_KEY }
  );

  const { data: briefing } = await rootSupabase
    .from('briefings')
    .select()
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (!briefing) {
    return NextResponse.json(
      {
        type: 'BriefingNotGenerated',
        message: 'The briefing of the day could not be generated',
      },
      { status: 500 }
    );
  }

  const { data: subscriptions } = await rootSupabase
    .from('subscriptions')
    .select();

  const { content, subject } = getBriefingTemplateMail({ briefing });

  const mailResult = await sendEmails({
    subject,
    content: render(content),
    to: subscriptions?.map(({ email }) => ({ email })) || [],
  });

  if (!mailResult.success) {
    console.warn({
      type: 'SubscriptionMailError',
      message: mailResult.error.message,
    });
  }
}
