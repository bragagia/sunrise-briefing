import { render } from '@react-email/render';
import {
  SupabaseClient,
  createRouteHandlerClient,
} from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { sendEmails } from '../../../lib/mailer';
import { getBriefingTemplateMail } from '../../../lib/templating';
import { Database } from '../../../types/supabase';

const openai = new OpenAI();

type News = Database['public']['Tables']['news']['Row'];

const fetchNewsOfTheDay = (supabase: SupabaseClient) => {
  const yesterday = new Date(Date.now());
  yesterday.setDate(yesterday.getDate() - 1);

  return supabase
    .from('news')
    .select()
    .gte('published_at', yesterday.toISOString());
};

const getNewsScore = ({
  magnitude,
  potential,
  novelty,
  reliability,
  scale,
}: News) =>
  ((scale || 0) * 0.9 +
    (magnitude || 0) * 0.9 +
    (potential || 0) * 0.9 +
    (novelty || 0) * 0.9 +
    (reliability || 0) * 1.4) /
  5;

const getTop5NewsOfTheDay = (allNews: News[]) => {
  const sortedNews = allNews.sort((a, b) => getNewsScore(b) - getNewsScore(a));

  return sortedNews.slice(0, 5);
};

async function fetchNews() {
  const rootSupabase = createRouteHandlerClient<Database>(
    { cookies },
    { supabaseKey: process.env.SUPABASE_SERVICE_KEY }
  );

  if (process.env.NEWS_API_KEY == undefined) {
    throw new Error('Missing news api key');
  }
  const newsApiKey = process.env.NEWS_API_KEY;

  const newsDomains = ['theguardian', 'bbc', 'expresscouk', 'huffpost'];

  function newsApiUrl(pageId: string) {
    const apiUrl = new URL('https://newsdata.io/api/1/news');
    apiUrl.searchParams.append('apiKey', newsApiKey);
    apiUrl.searchParams.append('page', pageId);
    apiUrl.searchParams.append('domain', newsDomains.join(','));

    return apiUrl;
  }

  let pageId = null;

  do {
    const page = await fetch(newsApiUrl(pageId));
    const pageJson = await page.json();

    pageJson['results'].map(async (news: any) => {
      const { error } = await rootSupabase.from('news').insert({
        published_at: news['pubDate'],
        content: news['content'] || '',
        title: news['title'],
        link: news['link'],
        source: news['source_id'],
      });

      if (error) {
        console.log(news);
        throw error;
      }
    });

    pageId = pageJson['nextPage'];
  } while (pageId != null);
}

async function rankNews() {
  const rootSupabase = createRouteHandlerClient<Database>(
    { cookies },
    { supabaseKey: process.env.SUPABASE_SERVICE_KEY }
  );

  const RANKER_PROMPT = `I gave you a list of news articles, one per line.
Each line starts with the article ID, then the journal name, and finally the article title.
Format:
ID: Journal: Title

I want you to evaluate each article with the pieces of information you have on those criteria :

Scale:
1/5: The event affects a small community or city.
2/5: The event affects a state or similar region.
3/5: The event affects a whole country or large geographical area.
4/5: The event affects multiple countries and can span multiple continents
5/5: The event affects the global worldwide population.

Magnitude:
1/5: The event has a minimal impact on the lives of those affected, causing minor changes or slight improvements.
2/5: The event has a mild impact, causing noticeable but not substantial changes in the lives of those affected.
3/5: The event significantly impacts those affected, introducing substantial improvements or changes in their daily routine or quality of life.
4/5: The event has a major impact on those affected, causing significant changes that have a long-term effect on their lives.
5/5: The event has a profound impact on those affected, significantly altering their life prospects, health, or well-being. The changes might have a lasting effect on their lives.

Potential:
1/5: The event is likely isolated and will probably not lead to bigger events.
2/5: The event may lead to some changes but is unlikely to cause major future events.
3/5: The event could potentially lead to significant events or changes.
4/5: The event is likely to lead to substantial future events or changes.
5/5: The event is highly likely to lead to major future events on a global scale.

Novelty:
1/5: The event is routine or expected.
2/5: The event is slightly unexpected but not entirely uncommon.
3/5: The event is unexpected and not common.
4/5: The event is likely to lead to substantial future events or changes.
5/5: The event is completely unprecedented and highly unexpected.

Reliability:
1/5: The article is primarily speculative or opinion-based, with little to no factual or scientific evidence supporting its claims.
2/5: The article contains some factual information but also includes significant speculation or unverified claims.
3/5: The article is a mix of factual information and analysis or interpretation. Some claims may not be thoroughly verified or universally accepted.
4/5: The article is mostly factual and evidence-based, with only a small portion of analysis or interpretation.
5/5: The article is entirely factual, evidence-based, and supported by multiple reliable sources or rigorous and verified scientific research.

You don't have access to the sources so you have to guess their reliability based on your own knowledge and impressions.

You must format your response as JSON and follow this format:
[
    {"id": 1, "scale": 1, "magnitude": 1, "potential": 1, "novelty": 1, "reliability": 1},
    {"id": 2, "scale": 1, "magnitude": 1, "potential": 1, "novelty": 1, "reliability": 1},
    ...
]

The id field of the output must match the id from the articles list I gave you.

If for some reason you cannot scale one of the articles (for example if the article is not correctly named, incomplete, or incoherent), the article JSON item must be :
{"id": 3, "error": "Description of the problem"}`;

  const { data: news, error } = await fetchNewsOfTheDay(rootSupabase).neq(
    'content',
    ''
  );
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

      const newsBatch = news.slice(i, i + batchSize);

      const newsList = newsBatch
        .map((news) => `${news.id}: ${news.source}: ${news.title}`)
        .join('\n');

      const chat_completion: OpenAI.Chat.ChatCompletion =
        await openai.chat.completions.create({
          model: 'gpt-3.5-turbo-16k',
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

      const newsAnalysises: NewsAnalysis[] = JSON.parse(gptResponse || '');

      if (newsAnalysises.length != newsBatch.length) {
        console.log('analysis parsing fail, retry');

        ok = false;
        continue;
      }

      await Promise.all(
        newsAnalysises.map(async (newsAnalysis) => {
          if (newsAnalysis.error) {
            console.log(
              `analysis of news ${newsAnalysis} failed: ${newsAnalysis.error}`
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

async function generateBriefing() {
  const rootSupabase = createRouteHandlerClient<Database>(
    { cookies },
    { supabaseKey: process.env.SUPABASE_SERVICE_KEY }
  );

  const DIGEST_PROMPT = `Here is a news article. Please note it has been automatically retrieved so there may be unwanted artifacts like mentions "Please click here to accept cookies" or "Like & Share facebook.com". You must ignore all those artifacts.

I want you to summarize the article. Your summary should explain the news in simple terms, and why it's important. You should define any term or name that are not well known. Write a single paragraph with no new lines.`;

  const WRITE_BRIEFING_PROMPT =
    "I gave you 5 news summary. I want you to write a daily briefing using those news. You can rewrite them as you want, but keep it as clear as possible and efficient, while keeping as much information from the source as you can. Emphasize for each news why it's important. Start the briefing with a greating and end with a closing. You can order the news by the level of importance you think they have.";

  const { data: allNews, error } = await fetchNewsOfTheDay(rootSupabase).not(
    'scale',
    'is',
    null
  );
  if (error) {
    throw error;
  }

  const topFive = getTop5NewsOfTheDay(allNews);

  const topFiveDigest = await Promise.all(
    topFive.map(async (news): Promise<string> => {
      const chat_completion: OpenAI.Chat.ChatCompletion =
        await openai.chat.completions.create({
          model: 'gpt-3.5-turbo-16k',
          messages: [
            {
              role: 'user',
              content: 'title: ' + news.title + '\n\n' + news.content,
            },
            { role: 'user', content: DIGEST_PROMPT },
          ],
        });
      const gptResponse = await chat_completion.choices[0].message.content;

      return gptResponse || '';
    })
  );

  // Briefing generation

  var topFiveChatMessages: OpenAI.Chat.Completions.CreateChatCompletionRequestMessage[] =
    topFiveDigest.map((summary) => {
      return { role: 'user', content: summary };
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

async function sendBriefingMails() {
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

export async function POST(/*request: Request*/) {
  await fetchNews();
  await rankNews();
  await generateBriefing();
  await sendBriefingMails();

  return NextResponse.json(
    { message: 'Briefing successfully generated' },
    { status: 200 }
  );
}
