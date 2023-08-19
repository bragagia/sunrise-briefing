import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  TailwindProps,
  Text,
} from '@react-email/components';
import tailwindConfig from '../tailwind.config';

import * as React from 'react';
import { getParagraphBgColorFromPosition } from '../utils/colors';
import { SharedHeaders } from './SharedHeaders';

interface BriefingProps {
  formattedDate: string;
  shortDate: string;
  briefing: string[];
  locale?: string;
}

export const Briefing = ({
  formattedDate,
  shortDate,
  briefing,
  locale = 'fr',
}: BriefingProps) => (
  <Tailwind config={tailwindConfig as TailwindProps['config']}>
    <Html>
      <SharedHeaders locale={locale} />
      <Preview>{shortDate}: Votre dose de news journalière est prête !</Preview>
      <Body className=" bg-[#FFFAF3] text-[#292928]">
        <Container className="mt-10 max-w-fit mx-auto">
          <Section className="flex items-center justify-center mb-2 mx-auto">
            <Column>
              <Img
                className="w-10 h-10 md:w-16 md:h-16 mr-4" /* mb-6 to correct vertical center due to date */
                src={`${process.env.FRONT_END_URL}/logo.png`}
                alt=""
              />
            </Column>
            <Column>
              <Heading className="mt-2 mb-1 text-3xl md:text-7xl text-center font-playfair-display text-[#292928]">
                Sunrise Briefing
              </Heading>
            </Column>
          </Section>
          <Text className="mb-4 text-xl font-playfair-display text-center text-[#292928]">
            {formattedDate}
          </Text>

          <Container className="w-full max-w-2xl text-justify text-gray-900 whitespace-pre-line font-hanken-grotesk mb-32">
            {briefing.map((paragraph, index) => {
              const color = getParagraphBgColorFromPosition(index);

              return (
                <Container key={index} className="mx-auto w-full max-w-full">
                  <Container
                    className="max-w-full w-full py-5 px-8 border-b-black border-b"
                    style={{ backgroundColor: color.string() }}
                  >
                    <Text>{paragraph}</Text>
                  </Container>
                </Container>
              );
            })}
          </Container>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

export default Briefing;
