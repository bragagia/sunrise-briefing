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
  firstName: string;
  date: string
  briefing: string[]
}

export const Briefing = ({ firstName, date, briefing }: BriefingProps) => (
  <Html>
    <Head />
    <Preview>Hello {firstName}, your briefing is ready !</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={title}>Sunrise Briefing</Heading>
        <Heading style={subtitle}>{date}</Heading>

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
