import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '../../../types/supabase';

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
    const page = await fetch(newsApiUrl(pageId));

    if (page.status != 200) {
      console.log('Fetch news failed: ' + page.statusText);
    }

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
