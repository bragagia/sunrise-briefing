import Briefing from '../emails/Briefing';
import { Database } from '../types/supabase';

export interface GetBriefingTemplateParams {
  briefing: Database['public']['Tables']['briefings']['Row'];
}

const getFormattedDate = (date: Date, locale: Intl.BCP47LanguageTag) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString(locale, options);
};

const getShortFormattedDate = (date: Date, locale: Intl.BCP47LanguageTag) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return date.toLocaleDateString(locale, options);
};

export const getBriefingMailSubject = (date: string) => {
  return `${date}: Votre dose de news journalière est prête !`;
};

export const getBriefingTemplateMail = ({
  briefing,
}: GetBriefingTemplateParams) => {
  const date = new Date(Date.now());
  const locale = 'fr-FR';

  const shortDate = getShortFormattedDate(date, locale)

  return {
    content: Briefing({
      briefing: briefing.content.split('\n\n') || [],
      formattedDate: getFormattedDate(date, locale),
      shortDate,
    }),
    subject: getBriefingMailSubject(shortDate)
  }
};
