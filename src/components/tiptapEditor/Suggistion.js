import { Extension } from '@tiptap/core'
import {
    suggestChanges,
    withSuggestChanges,
} from '@handlewithcare/prosemirror-suggest-changes'
import { Mark } from '@tiptap/core'

export const SuggestChangesExtension = Extension.create({
    name: 'suggestChanges',

    addMarks() {
        return {
            deletion: {
                inclusive: false,
                parseDOM: [{ tag: 'del' }],
                toDOM: () => ['del', 0],
            },
            addition: {
                inclusive: false,
                parseDOM: [{ tag: 'ins' }],
                toDOM: () => ['ins', 0],
            },
        }
    },

    addProseMirrorPlugins() {
        return [suggestChanges()]
    },

    onCreate() {
        this.editor.view.dispatch = withSuggestChanges(this.editor.view)
    },
})


export const SuggestChanges = Extension.create({
    name: 'suggestChanges',

    addProseMirrorPlugins() {
        return [suggestChanges()]
    },
})

export const SuggestionMark = Mark.create({
  name: 'suggestion',

  addOptions() {
    return {}
  },

  parseHTML() {
    return [{ tag: 'span[data-suggestion]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { ...HTMLAttributes, 'data-suggestion': 'true' }, 0]
  },
})