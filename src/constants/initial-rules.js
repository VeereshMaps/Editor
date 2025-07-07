import { highlightColors } from './highlight-colors'

export const initialRules = [
  {
    id: '1',
    title: 'Spell-Check English Text',
    prompt: 'Review the provided English text, which is in HTML format, and identify any spelling errors in the visible text only. Do not suggest corrections related to HTML tags, attributes, or formatting. Focus exclusively on checking the correctness of the English words shown to the reader.',
    color: highlightColors[1].color,
    backgroundColor: highlightColors[1].backgroundColor,
  },
  {
    id: '2',
    title: 'Grammar-Check English Text',
    prompt: 'Review the provided English text, which is in HTML format, and identify any grammatical errors in the visible text only. Suggest corrections where necessary, but do not provide feedback or suggestions related to HTML tags, attributes, or formatting. Focus exclusively on the correctness and clarity of the English sentences as displayed to the reader.',
    color: highlightColors[2].color, // ensure you have a third color in highlightColors
    backgroundColor: highlightColors[2].backgroundColor,
  },
]
