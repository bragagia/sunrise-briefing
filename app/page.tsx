import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import Color from 'color';
import { cookies } from 'next/headers';
import SubscriptionField from '../components/subscription/SubscriptionField';
import { Database } from '../types/supabase';

export default async function Home() {
  const rootSupabase = createServerComponentClient<Database>(
    { cookies },
    { supabaseKey: process.env.SUPABASE_SERVICE_KEY }
  );

  const { data: briefing, error } = await rootSupabase
    .from('briefings')
    .select()
    .limit(1)
    .single();

  if (error != null || briefing == null) {
    return (
      <p className="mb-16 font-hanken-grotesk text-center">
        This is a day without sunrise. Something broke on our side, sorry :'(
      </p>
    );
  }

  const colorMap = [
    '#6C3938',
    '#C84727',
    '#B05F0D',
    '#E57716',
    '#F5A125',
    '#DFB583',
    '#F4D4A3',
    '#ABD9E8',
    '#23ADD9',
  ];

  return (
    <div className="text-justify text-gray-900 whitespace-pre-line font-hanken-grotesk mb-32">
      <SubscriptionField className="my-6" />

      {briefing.content.split('\n\n').map((paragraph, index) => {
        var color = Color(colorMap[index % colorMap.length]);

        color = color.fade(0.75);

        return (
          <div className="max-w-2xl mx-auto">
            <div
              className="py-5 px-8 border-b-black border-b"
              style={{ backgroundColor: color.string() }}
            >
              <p className="">{paragraph}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
