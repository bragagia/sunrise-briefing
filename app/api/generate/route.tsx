import { NextRequest, NextResponse } from 'next/server';
import { fetchNews } from './1_fetch_news';
import { rankNews } from './2_rank_news';
import { generateDigests } from './3_generate_digests';
import { generateBriefing } from './4_generate_briefing';
import { sendBriefingMails } from './5_send_briefing_mails';

export async function POST(request: Request) {
  var nrequest = new NextRequest(request.url);

  if (
    nrequest.nextUrl.searchParams.get('key') != process.env.GENERATE_SECRET_KEY
  ) {
    return NextResponse.json({ message: 'Get the hell out!' }, { status: 401 });
  }

  var startFrom = nrequest.nextUrl.searchParams.get('start_from');
  var debug = nrequest.nextUrl.searchParams.has('debug');
  switch (startFrom) {
    default:
    case 'fetch_news':
      console.log('# Fetching news');
      await fetchNews();
      if (debug) {
        break;
      }
    case 'rank_news':
      console.log('# Ranking news');
      await rankNews();
      if (debug) {
        break;
      }
    case 'generate_digests':
      console.log('# Generating digests');
      await generateDigests();
      if (debug) {
        break;
      }
    case 'generate_briefing':
      console.log('# Generating briefing');
      await generateBriefing();
      if (debug) {
        break;
      }
    case 'send_briefing_mails':
      console.log('# Sending mails');
      await sendBriefingMails();
  }

  console.log('# Ended');

  return NextResponse.json(
    { message: 'Briefing successfully generated' },
    { status: 200 }
  );
}
