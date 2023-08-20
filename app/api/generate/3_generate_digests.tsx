import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { Database } from '../../../types/supabase';
import { getNewsOfTheDay, getTop5NewsOfTheDay } from './helpers';

// @ts-ignore (for vscode only)
import DIGEST_PROMPT from './3_prompt_digest.txt';

const openai = new OpenAI();

export async function generateDigests() {
  const rootSupabase = createRouteHandlerClient<Database>(
    { cookies },
    { supabaseKey: process.env.SUPABASE_SERVICE_KEY }
  );

  const { data: allNews, error } = await getNewsOfTheDay(rootSupabase).not(
    'scale',
    'is',
    null
  );
  if (error) {
    throw error;
  }

  const topFive = getTop5NewsOfTheDay(allNews);

  await Promise.all(
    topFive.map(async (news) => {
      const chat_completion: OpenAI.Chat.ChatCompletion =
        await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: 'title: ' + news.title + '\n\n' + news.content,
            },
            { role: 'user', content: DIGEST_PROMPT },
          ],
        });
      const gptResponse = await chat_completion.choices[0].message.content;

      const { error } = await rootSupabase
        .from('news')
        .update({ digest: gptResponse })
        .eq('id', news.id);
      if (error) {
        throw error;
      }
    })
  );
}
