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

/*
NEWS FETCHER JOB
  API_URL = 'https://newsdata.io/api/1/news'.freeze
  API_KEY = 'pub_2679824aa2f6cf15b3efed28304f9c388941a'.freeze
  DOMAINS = %w[theguardian bbc expresscouk huffpost].freeze

  class FetchError < StandardError; end

  def self.fetch_page(page_id = nil)
    page = HTTParty.get(api_url(page_id))
    raise FetchError, page.dig('results', 'message') unless page.code == 200

    page
  end

  def self.import_from_newsdata_io
    page_id = nil

    loop do
      page = fetch_page(page_id)

      page['results'].each do |news|
        News.create!(raw_data: news, published_at: news['pubDate'])
      end

      page_id = page['nextPage']
      break if page_id.nil?
    end
  end

  def self.api_url(page_id)
    uri = URI(API_URL)
    uri.query = URI.encode_www_form({ apiKey: API_KEY, domain: DOMAINS.join(','), page: page_id }.compact)
    uri.to_s
  end
*/

/*
NEWS RANKER JOB

  RANKER_PROMPT = 'I gave you a list of news articles, one per line.
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

You don\'t have access to the sources so you have to guess their reliability based on your own knowledge and impressions.

You must format your response as JSON and follow this format:
[
    {"id": 1, "scale": 1, "magnitude": 1, "potential": 1, "novelty": 1, "reliability": 1},
    {"id": 2, "scale": 1, "magnitude": 1, "potential": 1, "novelty": 1, "reliability": 1},
    ...
]

The id field of the output must match the id from the articles list I gave you.

If for some reason you cannot scale one of the articles (for example if the article is not correctly named, incomplete, or incoherent), the article JSON item must be :
{"id": 3, "error": "Description of the problem"}'.freeze

  def perform(news_batch)
    Rails.logger.info "#{Time.now} Starting the daily news ranking"
    client = OpenAI::Client.new

    message = news_batch
              .map { |news| "#{news.id}: #{news.raw_data['source_id']}: #{news.raw_data['title']}" }
              .join("\n")

    response = client.chat(
      parameters: {
        model: 'gpt-3.5-turbo-16k',
        messages: [{ role: 'user', content: message }, { role: 'user', content: RANKER_PROMPT }],
        temperature: 1
      }
    )
    raise "GPT Error encountered: #{response.dig('error', 'message')}" if response['error'].present?

    response = response.dig('choices', 0, 'message', 'content')
    parsed_response = JSON.parse(response)
    parsed_response.each do |response_hash|
      if response_hash['error'].present?
        Rails.logger.info "Error encountered ranking news #{response_hash['id']}: #{response_hash['error']}"
        next
      end
      ranking_attributes = response_hash.slice('scale', 'magnitude', 'potential', 'novelty', 'reliability')
      News.find(response_hash['id']).update_rankings!(ranking_attributes)
    rescue JSON::ParserError => e
      Rails.logger.info "#{Time.now} JSON parsing error: #{response}"
    end
    true
  end
*/

/*
Daily briefing generator

  DIGEST_PROMPT = 'Here is a news article. Please note it has been automatically retrieved so there may be unwanted artifacts like mentions "Please click here to accept cookies" or "Like & Share facebook.com". You must ignore all those artifacts.

I want you to summarize the article. Your summary should explain the news in simple terms, and why it\'s important. You should define any term or name that are not well known. Write a single paragraph with no new lines.'.freeze

  WRITE_BRIEFING_PROMPT = 'I gave you 5 news summary. I want you to write a daily briefing using those news. You can rewrite them as you want, but keep it as clear as possible and efficient, while keeping as much information from the source as you can. Emphasize for each news why it\'s important. Start the briefing with a greating and end with a closing. You can order the news by the level of importance you think they have.'

  def perform(*_args)
    Rails.logger.info "#{Time.now} Starting the daily news briefing"
    client = OpenAI::Client.new

    top_five = News.todays_top_five
    top_five.each do |news|
      next if news.digest.present?

      article_message = "Source: #{news.raw_data['source_id']}
Title: #{news.raw_data['title']}
Article content:
#{news.raw_data['content']}"

      response = client.chat(
        parameters: {
          model: 'gpt-3.5-turbo-16k',
          messages: [{ role: 'user', content: article_message }, { role: 'user', content: DIGEST_PROMPT }],
          temperature: 1
        }
      )
      response = response.dig('choices', 0, 'message', 'content')

      news.update!(digest: response)
    end

    messages = top_five.pluck(:digest).map do |item|
      { role: 'user', content: item }
    end.append({ role: 'user', content: WRITE_BRIEFING_PROMPT })
    response = client.chat(
      parameters: {
        model: 'gpt-4',
        messages:,
        temperature: 1
      }
    )
    response = response.dig('choices', 0, 'message', 'content')

    DailyBriefing.create!(content: response)
    true
  end
  */

/*
NEWS MODEL

    scope :awaiting_ranking, lambda {
                             where(scale: nil, magnitude: nil, potential: nil, novelty: nil, reliability: nil)
                           }
  scope :ranked, lambda {
                   where.not(scale: nil, magnitude: nil, potential: nil, novelty: nil, reliability: nil)
                 }

  def self.todays_top_five
    ranked.where('published_at > ?', 24.hours.ago).sort_by(&:average).last(5)
  end

  def average
    (scale * 0.9 + magnitude * 0.9 + potential * 0.9 + novelty * 0.9 + reliability * 1.4) / 5
  end

  class MissingKeyError < StandardError; end

  def update_rankings!(ranking_attributes)
    required_keys = %w[scale magnitude
                       potential novelty reliability]

    if (required_keys - ranking_attributes.keys).any?
      missing_keys = required_keys - ranking_attributes.keys
      raise MissingKeyError, "The following keys are missing #{missing_keys.join(', ')}"
    end

    update!(ranking_attributes)
  end

  */
