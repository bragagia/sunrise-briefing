import { Font, Head } from "@react-email/components";

const FONT_BASE_URL = `${process.env.FRONT_END_URL}/assets`

interface SharedHeadersProps {
  locale?: string,
}

export const SharedHeaders = ({
  locale = 'fr'
}: SharedHeadersProps) => {
  return (
    <Head lang={locale}>
      <Font
        fontFamily="Hanken Grotesk"
        fallbackFontFamily="Verdana"
        webFont={{
          url: `${FONT_BASE_URL}/HankenGrotesk-VariableFont_wght.ttf`,
          format: 'truetype',
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="Playfair Display"
        fallbackFontFamily="Verdana"
        webFont={{
          url: `${FONT_BASE_URL}/PlayfairDisplay-VariableFont_wght.ttf`,
          format: 'truetype',
        }}
        fontWeight={400}
        fontStyle="normal"
      />
    </Head>
  )
}