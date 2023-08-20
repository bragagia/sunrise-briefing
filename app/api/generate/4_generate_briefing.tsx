import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { Database } from '../../../types/supabase';
import { getNewsOfTheDay } from './helpers';

// @ts-ignore (for vscode only)
import WRITE_BRIEFING_PROMPT from './4_prompt_briefing.txt';

const openai = new OpenAI();

export async function generateBriefing() {
  const rootSupabase = createRouteHandlerClient<Database>(
    { cookies },
    { supabaseKey: process.env.SUPABASE_SERVICE_KEY }
  );

  const { data: topFive, error } = await getNewsOfTheDay(rootSupabase).not(
    'digest',
    'is',
    null
  );
  if (error) {
    throw error;
  }

  var topFiveChatMessages: OpenAI.Chat.Completions.CreateChatCompletionRequestMessage[] =
    topFive.map((news) => {
      return { role: 'user', content: news.digest };
    });

  var messages = topFiveChatMessages;
  messages.push({
    role: 'user',
    content: WRITE_BRIEFING_PROMPT,
  });
  const chat_completion: OpenAI.Chat.ChatCompletion =
    await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
    });
  const gptResponse = await chat_completion.choices[0].message.content;

  await rootSupabase.from('briefings').insert({ content: gptResponse || '' });
}
