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
    .single();

  if (error != null || briefing == null) {
    return (
      <p className="mb-16 font-hanken-grotesk text-center">
        This is a day without sunrise. Something broke on our side, sorry :'(
      </p>
    );
  }

  return (
    <div className="text-justify text-gray-900 whitespace-pre-line font-hanken-grotesk mb-32">
      <SubscriptionField className="my-6" />

      {briefing.content.split('\n\n').map((paragraph, index) => {
        const color = getParagraphBgColorFromPosition(index);

        return (
          <div key={index} className="max-w-2xl mx-auto">
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
