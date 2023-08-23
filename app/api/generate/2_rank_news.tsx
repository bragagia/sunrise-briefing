import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { Database } from '../../../types/supabase';
import { getNewsOfTheDay } from './helpers';

// @ts-ignore (for vscode only)
import RANKER_PROMPT from './2_prompt_rank_news.txt';

const openai = new OpenAI();

export async function rankNews() {
  const rootSupabase = createRouteHandlerClient<Database>(
    { cookies },
    { supabaseKey: process.env.SUPABASE_SERVICE_KEY }
  );

  const { data: news, error } = await getNewsOfTheDay(rootSupabase)
    .neq('content', '')
    .is('scale', null);
  if (error) {
    throw error;
  }

  const batchSize = 40;
  for (let i = 0; i < news.length; i += batchSize) {
    var tries = 0;
    var ok = true;

    do {
      tries++;
      ok = true;

      console.log('Batch ' + i + ', try ' + tries);

      const newsBatch = news.slice(i, i + batchSize);

      const newsList = newsBatch
        .map((news) => `${news.id}: ${news.source}: ${news.title}`)
        .join('\n');

      const chat_completion: OpenAI.Chat.ChatCompletion =
        await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'user', content: newsList },
            { role: 'user', content: RANKER_PROMPT },
          ],
        });
      const gptResponse = await chat_completion.choices[0].message.content;

      interface NewsAnalysis {
        id: number;
        scale: number;
        magnitude: number;
        potential: number;
        novelty: number;
        reliability: number;
        error: string;
      }

      var newsAnalysises: NewsAnalysis[];
      try {
        newsAnalysises = JSON.parse(gptResponse || '');
      } catch (error) {
        console.log('Parsing error: ' + error);

        ok = false;
        continue;
      }

      if (newsAnalysises.length != newsBatch.length) {
        console.log(
          'analysis parsing fail, retry.\n gptInput:\n' +
            newsList +
            '\n\n gptResponse:\n' +
            gptResponse
        );

        ok = false;
        continue;
      }

      await Promise.all(
        newsAnalysises.map(async (newsAnalysis) => {
          if (newsAnalysis.error) {
            console.log(
              `analysis of news ${newsAnalysis.id} failed: ${newsAnalysis.error}`
            );
            return;
          }

          const { error } = await rootSupabase
            .from('news')
            .update({
              scale: newsAnalysis.scale,
              magnitude: newsAnalysis.magnitude,
              potential: newsAnalysis.potential,
              novelty: newsAnalysis.novelty,
              reliability: newsAnalysis.reliability,
            })
            .eq('id', newsAnalysis.id);
          if (error) {
            throw error;
          }
        })
      );
    } while (!ok && tries < 3);

    if (!ok) {
      console.log('Failed to analyse news.');
    }
  }
}
