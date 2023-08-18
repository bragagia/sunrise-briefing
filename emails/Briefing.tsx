import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BriefingProps {
  formattedDate: string
  shortDate: string
  briefing: string[]
}

export const Briefing = ({ formattedDate, shortDate, briefing }: BriefingProps) => (
  <Html>
    <Head />
    <Preview>{shortDate}: Votre dose de news journalière est prête !</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={title}>Sunrise Briefing</Heading>
        <Heading style={subtitle}>{formattedDate}</Heading>

        {
          briefing.map((paragraph, index) => (
            <Text>
              {paragraph}
            </Text>
          ))
        }
      </Container>
    </Body>
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

const title = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const subtitle = {
  color: '#a1a1a1',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '16px',
  padding: '0',
};
