import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Tailwind,
  TailwindProps,
  Text,
} from '@react-email/components';
import tailwindConfig from '../tailwind.config'

import * as React from 'react';
import { getParagraphBgColorFromPosition } from '../utils/colors';
import { SharedHeaders } from './SharedHeaders';

interface BriefingProps {
  formattedDate: string
  shortDate: string
  briefing: string[]
  locale?: string
}

export const Briefing = ({ formattedDate, shortDate, briefing, locale = 'fr' }: BriefingProps) => (
  <Html>
    <SharedHeaders locale={locale} />
    <Preview>{shortDate}: Votre dose de news journalière est prête !</Preview>
    <Tailwind config={tailwindConfig as TailwindProps['config']}>
      <Body className=" bg-[#FFFAF3] text-[#292928]">
        <Container className="my-10 max-w-2xl mx-auto">
          <Container  className="flex items-center justify-center gap-4 mb-12">
            <Img
              className="w-10 h-10 md:w-16 md:h-16 mb-6" /* mb-6 to correct vertical center due to date */
              src={`${window.location.host}/public/logo.png`}
              width="800"
              height="800"
              alt=""
            />
            <Container>
              <Heading className="text-3xl md:text-7xl text-center font-playfair-display">Sunrise Briefing</Heading>
              <Heading className="text-md font-playfair-display text-center">{formattedDate}</Heading>
            </Container>
          </Container>

          <Container className="text-justify text-gray-900 whitespace-pre-line font-hanken-grotesk mb-32">
            {
              briefing.map((paragraph, index) => {
                const color = getParagraphBgColorFromPosition(index)

                return (
                  <Container key={index} className="max-w-2xl mx-auto">
                    <Container className="py-5 px-8 border-b-black border-b"  style={{ backgroundColor: color.string() }}>
                      <Text>
                        {paragraph}
                      </Text>
                    </Container>
                  </Container>
                )
              })
            }
          </Container>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default Briefing;

const main = {
  backgroundColor: '#ffffff',
};

const container = {
  paddingLeft: '12px',
  paddingRight: '12px',
  margin: '0 auto',
};
