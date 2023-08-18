import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import Color from 'color';
import { cookies } from 'next/headers';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from('briefings')
    .select()
    .limit(1)
    .single();

  const lastBriefing = 12;
  const briefingContent = data.content;
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
    <div>
      {lastBriefing == null ? (
        <p className="mb-16 font-hanken-grotesk text-center">
          No Daily Briefing for today.
        </p>
      ) : (
        <>
          <div className="text-justify text-gray-900 whitespace-pre-line font-hanken-grotesk">
            {briefingContent.split('\n\n').map((paragraph, index) => {
              var color = Color(colorMap[index % colorMap.length]);

              color = color.fade(0.75);

              return (
                <div className="max-w-2xl mx-auto">
                  <div
                    className="py-5 px-8 mx-8 border-b-black border-b"
                    style={{ backgroundColor: color.string() }}
                  >
                    <p className="">{paragraph}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
