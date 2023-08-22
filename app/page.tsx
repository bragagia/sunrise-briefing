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

  const date = new Date(briefing.created_at);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formatedDate = date.toLocaleDateString('fr-FR', options);

  var paragraphs = briefing.content.split('\n\n');

  return (
    <div className="text-justify text-gray-900 whitespace-pre-line font-hanken-grotesk">
      <div className="my-24 flex flex-col gap-3">
        <p className="text-sm text-gray-800 text-justify">
          <b>Chaque matin à 8h00</b>, recevez dans votre boîte mail
          <b> l'essentiel de l'actualité parisienne</b>.
        </p>

        <p className="text-sm text-gray-800 text-justify">
          Fini la lecture sans fin des journaux et réseaux sociaux, on fait le
          tri et on résume tout pour vous !
        </p>

        <SubscriptionField />
      </div>

      <p className="text-center mb-2">
        Édition du <b>{formatedDate}</b> :
      </p>

      {paragraphs.map((paragraph, index) => {
        var isLast = index + 1 == paragraphs.length;
        var isFirst = index == 0;

        const color = getParagraphBgColorFromPosition(index, isLast);

        var title = '';
        if (paragraph.substring(0, 5) == '#### ') {
          var split = paragraph.split(/\n(.*)/s);
          title = split[0].substring(5);
          paragraph = split[1];
        }

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
              {title != '' ? (
                <h3 className="font-bold text-left">{title}</h3>
              ) : (
                ''
              )}
              <p className="text-gray-800">{paragraph}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
