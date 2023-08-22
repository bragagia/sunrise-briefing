import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../types/supabase';

type News = Database['public']['Tables']['news']['Row'];

export function getNewsOfTheDay(supabase: SupabaseClient) {
  const yesterday = new Date(Date.now());
  yesterday.setDate(yesterday.getDate() - 1);

  return supabase
    .from('news')
    .select()
    .gte('published_at', yesterday.toISOString());
}

function getNewsScore({
  magnitude,
  potential,
  novelty,
  reliability,
  scale,
}: News) {
  return (
    ((scale || 0) * 2 +
      (magnitude || 0) * 1 +
      (potential || 0) * 1 +
      (novelty || 0) * 1 +
      (reliability || 0) * 1.5) /
    (2 + 1 + 1 + 1 + 1.5)
  );
}

export function getTop5NewsOfTheDay(allNews: News[]) {
  const sortedNews = allNews.sort((a, b) => getNewsScore(b) - getNewsScore(a));

  return sortedNews.slice(0, 5);
}

export function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
