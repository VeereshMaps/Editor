// tiptapExtensions.js

import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import TextStyle from '@tiptap/extension-text-style';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Highlight from '@tiptap/extension-highlight';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import HardBreak from '@tiptap/extension-hard-break';
import HorizontalRule from '@tiptap/extension-horizontal-rule';

import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TodoList from '@tiptap/extension-task-list';
import TodoItem from '@tiptap/extension-task-item';

import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
// import FontFamily from '@tiptap/extension-font-family';
// import FontSize from '@tiptap/extension-font-size';
import Placeholder from '@tiptap/extension-placeholder';
import History from '@tiptap/extension-history';

import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import CharacterCount from '@tiptap/extension-character-count';

import { InlineThread } from '@tiptap-pro/extension-comments'; // Optional Pro
import { ExportDocx } from '@tiptap-pro/extension-export-docx'; // Optional Pro

// Optional Custom (you mentioned CustomHighlight)

export const defaultTipTapExtensions = [
  Document,
  Paragraph,
  Text,
  Heading,
  TextStyle,
  Bold,
  Italic,
  Underline,
  Strike,
  Highlight,
  Code,
  CodeBlock,
  Blockquote,
  Link,
  Image.configure({ inline: true, allowBase64: true }),
  HardBreak,
  HorizontalRule,

  BulletList,
  OrderedList,
  ListItem,
  TodoList,
  TodoItem.configure({ nested: true }),

  Table.configure({ resizable: true }),
  TableRow,
  TableCell,
  TableHeader,

  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Color,
  Placeholder.configure({ placeholder: 'Start typing...' }),
  History,

  Dropcursor,
  Gapcursor,
  CharacterCount.configure({ limit: 10000 }),

  // Pro/Optional
  InlineThread,
  ExportDocx,
];
