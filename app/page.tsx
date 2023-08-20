import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import SubscriptionField from '../components/subscription/SubscriptionField';
import { Database } from '../types/supabase';
import { getParagraphBgColorFromPosition } from '../utils/colors';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const rootSupabase = createServerComponentClient<Database>(
    { cookies },
    { supabaseKey: process.env.SUPABASE_SERVICE_KEY }
  );

  const { data: briefing, error } = await rootSupabase
    .from('briefings')
    .select()
    .limit(1)
    .order('id', { ascending: false })
    .single();

  if (error != null || briefing == null) {
    return (
      <p className="mb-16 font-hanken-grotesk text-center">
        C'est une journée sans lever de soleil. Un truc a cassé de notre côté,
        désolé :'(
      </p>
    );
  }

  var paragraphs = briefing.content.split('\n\n');

  return (
    <div className="text-justify text-gray-900 whitespace-pre-line font-hanken-grotesk mb-32">
      <SubscriptionField className="my-6" />

      {paragraphs.map((paragraph, index) => {
        const color = getParagraphBgColorFromPosition(index);
        var title = '';

        if (paragraph.substring(0, 5) == '#### ') {
          var split = paragraph.split(/\n(.*)/s);
          title = split[0].substring(5);
          paragraph = split[1];
        }

        var isLast = index + 1 == paragraphs.length;
        var isFirst = index == 0;

        return (
          <div key={index} className="max-w-2xl mx-auto">
            <div
              className={
                'py-5 px-8 ' +
                (isFirst ? 'rounded-t-lg ' : '') +
                (isLast ? 'rounded-b-lg' : 'border-b-black border-b')
              }
              style={{ backgroundColor: color.string() }}
            >
              {title != '' ? <h3 className="font-bold">{title}</h3> : ''}
              <p className="text-gray-800">{paragraph}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
