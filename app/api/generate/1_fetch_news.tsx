import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '../../../types/supabase';
import { sleep } from './helpers';

export async function fetchNews() {
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
    apiUrl.searchParams.append('domain', newsDomains.join(','));

    if (pageId != '') {
      apiUrl.searchParams.append('page', pageId);
    }

    return apiUrl;
  }

  let pageId = '';
  do {
    await sleep(1000); // prevent overuse

    console.log('Fetching page: "' + pageId + '"');

    const page = await fetch(newsApiUrl(pageId));

    if (page.status != 200) {
      console.log('Fetch news failed: ' + page.statusText);

      if (page.status == 429) {
        await sleep(60000); // Wait 60s because too many request. Rate limit reset every 15min
      }

      continue;
    }

    const pageJson = await page.json();

    if (!pageJson['results']) {
      console.log(
        'Wrong result from newsapi: ' + JSON.stringify(pageJson, null, 2)
      );

      continue;
    }

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
