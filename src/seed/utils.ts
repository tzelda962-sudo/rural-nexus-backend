/** Wraps plain text (or HTML-stripped text) into a minimal valid Lexical richText node. */
export function makeRichText(html: string) {
  const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          textFormat: 0,
          children: [
            {
              type: 'text',
              format: 0,
              style: '',
              mode: 'normal',
              text: plain,
              version: 1,
              detail: 0,
            },
          ],
        },
      ],
    },
  }
}