import { Node } from '@tiptap/core';

const PageBreak = Node.create({
  name: 'pageBreak',

  group: 'block',
  atom: true,

  parseHTML() {
    return [{ tag: 'hr[data-page-break]' }];
  },

  renderHTML() {
    return ['hr', { 'data-page-break': 'true', class: 'page-break' }];
  },

  addCommands() {
    return {
      insertPageBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },
});

export default PageBreak;