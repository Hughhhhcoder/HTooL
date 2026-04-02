export const markedRenderOptions = {
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false
}

export const turndownOptions = {
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  linkReferenceStyle: 'full'
}

export const strikethroughReplacement = (content) => `~~${content}~~`
