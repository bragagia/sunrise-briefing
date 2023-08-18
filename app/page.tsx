import Color from 'color';

export default function Home() {
  const lastBriefing = 12;
  const briefingContent = `Good morning! Here's your daily news briefing for today.

Let's start with a significant development in global military affairs. The Chinese army has posted a provocative propaganda video, fueling suspicions about possible conflict in the Taiwan Strait, an area of ongoing tension between China and Taiwan. The video showcases soldiers in exercise amidst a simulated environment similar to Taiwan's coast, indicating potential preparations for war. The circumstance further escalates the conflict between China and Taiwan, hence raising an alarm for a potential armed engagement in the region.

Next, we move onto Europe where an upcoming extreme weather event is set to hit. A high-pressure "heat dome" will engulf parts of Europe next week, causing extreme temperatures and elevating the risk of wildfires particularly in Spain, Portugal, and Southern France. The extended heatwave poses real threats to human health, infrastructure, and could potentially lead to widespread power disruption.

In NATO, Secretary-General Jens Stoltenberg highlighted Ukraine's prerogative in determining conditions for peace talks amidst its ongoing territorial conflict with Russia. The emphasis on Ukraine's autonomy in making decisions and NATO's support role amplifies the significance of national sovereignty amid international disputes.

Further on, we turn to the US, where Kansas City rolls out a major development for women's sports. The city plans to construct its first stadium specifically for professional women's sports, expected to commence operations in 2024. This signifies a monumental evolution in the recognition and enhancement of women's sports.

Lastly, a recent analysis from The Guardian scrutinizes popular movies allegedly based on true stories but ladden with significant factual inaccuracies. The piece serves as a reminder that while these films provide entertainment, viewers should be aware of their tendency to deviate from historical truth.

That concludes your daily briefing. Stay informed, stay safe, and have a wonderful day!`;
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

              color = color.fade(0.7);

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
