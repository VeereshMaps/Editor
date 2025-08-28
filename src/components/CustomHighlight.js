import { Mark } from '@tiptap/core'

export const CustomHighlight = Mark.create({
  name: 'highlight',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => element.style.backgroundColor || null,
        renderHTML: attributes => {
          if (!attributes.color) {
            return {}
          }

          return {
            style: `background-color: ${attributes.color}`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'mark',
      },
      {
        style: 'background-color',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', this.options.HTMLAttributes, HTMLAttributes, 0]
  },

  addCommands() {
    return {
      setHighlight: color => ({ commands }) => {
        return commands.setMark(this.name, { color })
      },
      toggleHighlight: color => ({ commands }) => {
        return commands.toggleMark(this.name, { color })
      },
      unsetHighlight: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})
