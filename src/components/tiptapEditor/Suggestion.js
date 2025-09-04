import { Extension } from '@tiptap/core'
import { Mark } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet } from "@tiptap/pm/view";

let tempSuggestion = null;
let lastCursorPos = null;
let currentSuggestionId = null;
let currentDeletionId = null;

const SuggestionMark = Mark.create({
    name: 'suggestion',

    addOptions() {
        return {
            viewerUserId: null,
        };
    },

    addAttributes() {
        return {
            username: { default: 'User' },
            userId: { default: null },
            color: { default: '#0000ff' },
            suggestionId: { default: null },
            createdAt: { default: () => new Date().toISOString() },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-suggestion]' }];
    },

    renderHTML({ HTMLAttributes, options = {} }) {
        const isOwn = HTMLAttributes.userId === options.viewerUserId;
        const userClass = isOwn ? 'suggestion-own' : 'suggestion-other';
        const userIdClass = `user-${HTMLAttributes.userId}`;
        const userColor = HTMLAttributes.color || '#444475ff';

        return [
            'span',
            {
                ...HTMLAttributes,
                'data-suggestion': 'true',
                'data-user': HTMLAttributes.username,
                'data-timestamp': HTMLAttributes.createdAt,
                'data-suggestion-id': HTMLAttributes.suggestionId,
                class: `suggestion ${userClass} ${userIdClass}`,
                style: `color: ${userColor};`,
                // style: `border: 1px solid ${userColor}; border-radius: 2px;`,
            },
            0,
        ];
    },
});

const SuggestionExtension = Extension.create({
    name: 'suggestion-extension',

    addOptions() {
        return {
            getMode: () => 'Editing',
            getUser: () => ({ id: null, name: 'Anonymous' }),
        }
    },

    addProseMirrorPlugins() {
        return [
            SuggestionPlugin({
                getMode: this.options.getMode,
                getUser: this.options.getUser,
            }),
        ]
    },
});

const SuggestionPlugin = ({ getMode, getUser }) => {
    return new Plugin({
        key: new PluginKey('suggestionPlugin'),

        props: {
            handleTextInput(view, from, to, text) {
                console.log('getMode()', getMode(), getMode() !== 'Suggesting');

                if (getMode() !== 'Suggesting') {
                    return false;
                }
                const { state, dispatch } = view;
                const { schema } = state;
                const currentUser = getUser();
                const createdAt = new Date().toISOString();
                // popup coords calculation
                const coords = view.coordsAtPos(from);
                const editorRect = view.dom.parentElement?.getBoundingClientRect?.() || { top: 0, left: 0 };
                const top = coords.top - editorRect.top + 8;
                const left = coords.left - editorRect.left;
                // ✅ 2. No active-in-progress extension — determine context
                const markAtPos = getMarkAtPos(state, from, 'suggestion');
                const isInsideSameSuggestion =
                    markAtPos &&
                    markAtPos.attrs.suggestionId === currentSuggestionId &&
                    markAtPos.attrs.userId === currentUser.id;
                // ✅ 1. Extend existing suggestion if already typing in the same view
                if (isInsideSameSuggestion && tempSuggestion && tempSuggestion.view === view) {
                    const mark = tempSuggestion.mark;

                    // Replace the slice with the new input (handles insertion/replacement)
                    const tr = state.tr.replaceWith(from, to, schema.text(text, [mark]));
                    dispatch(tr);

                    // After dispatch, the view.state reflects the updated document
                    const updatedState = view.state;
                    const range = findSuggestionRange(updatedState, currentSuggestionId);
                    console.log("1st if", range)
                    if (range) {
                        const actualText = updatedState.doc.textBetween(range.from, range.to);
                        tempSuggestion.from = range.from;
                        tempSuggestion.to = range.to;
                        tempSuggestion.text = actualText;
                        // Optionally re-resolve the mark at the updated position if necessary:
                        // const resolvedMark = getMarkAtPos(updatedState, range.from, 'suggestion');
                        // tempSuggestion.mark = resolvedMark || mark;
                        tempSuggestion.mark = mark;
                    } else {
                        console.warn('Could not locate suggestion range after edit', currentSuggestionId);
                        tempSuggestion = null;
                        return false;

                    }

                    return true;
                }

                // 2a. Rehydrate same user's existing suggestion (cursor entered it, but nothing is active yet)
                if (markAtPos && markAtPos.attrs.userId === currentUser.id && !currentSuggestionId) {
                    currentSuggestionId = markAtPos.attrs.suggestionId;

                    // After inserting the current character, we want to reflect actual doc state.
                    // Create initial insertion for this keystroke:
                    const mark = markAtPos;
                    const tr = state.tr.replaceWith(from, to, schema.text(text, [mark]));
                    dispatch(tr);

                    const updatedState = view.state;
                    const range = findSuggestionRange(updatedState, currentSuggestionId);
                    const actualText = range
                        ? updatedState.doc.textBetween(range.from, range.to)
                        : text; // fallback to raw input

                    tempSuggestion = {
                        from: range?.from ?? from,
                        to: range?.to ?? from + text.length,
                        text: actualText,
                        suggestionId: currentSuggestionId,
                        user: {
                            id: markAtPos.attrs.userId,
                            name: markAtPos.attrs.username,
                            color: markAtPos.attrs.color,
                        },
                        createdAt: markAtPos.attrs.createdAt,
                        mark,
                        view,
                        type: 'insertion',
                    };
                    console.log('✍️ Rehydrated current user\'s suggestion:', currentSuggestionId);
                    return true;
                }

                // 2b. Typing inside someone else's suggestion — start a new one
                if (markAtPos) {
                    const sameUser = markAtPos.attrs.userId === currentUser.id;

                    if (sameUser && !currentSuggestionId) {
                        // 🪄 Rehydrate instead of creating new suggestion
                        currentSuggestionId = markAtPos.attrs.suggestionId;

                        const mark = markAtPos;
                        const tr = state.tr.replaceWith(from, to, schema.text(text, [mark]));
                        dispatch(tr);

                        const updatedState = view.state;
                        const range = findSuggestionRange(updatedState, currentSuggestionId);
                        const actualText = range
                            ? updatedState.doc.textBetween(range.from, range.to)
                            : text;

                        tempSuggestion = {
                            from: range?.from ?? from,
                            to: range?.to ?? from + text.length,
                            text: actualText,
                            suggestionId: currentSuggestionId,
                            user: {
                                id: markAtPos.attrs.userId,
                                name: markAtPos.attrs.username,
                                color: markAtPos.attrs.color,
                            },
                            createdAt: markAtPos.attrs.createdAt,
                            mark,
                            view,
                            type: 'insertion',
                        };
                        console.log('✍️ Rehydrated current user\'s suggestion:', currentSuggestionId);
                        return true;
                    }

                    if (!sameUser) {
                        // 👤 Start a new suggestion
                        const suggestionId = `sugg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                        currentSuggestionId = suggestionId;

                        const mark = schema.marks.suggestion.create({
                            suggestionId,
                            username: currentUser.name,
                            userId: currentUser.id,
                            color: currentUser.color,
                            createdAt,
                        });

                        const node = schema.text(text, [mark]);
                        const tr = state.tr.replaceWith(from, to, node);
                        dispatch(tr);

                        const updatedState = view.state;
                        const range = findSuggestionRange(updatedState, suggestionId);
                        const actualText = range
                            ? updatedState.doc.textBetween(range.from, range.to)
                            : text;

                        tempSuggestion = {
                            from: range?.from ?? from,
                            to: range?.to ?? from + text.length,
                            text: actualText,
                            suggestionId,
                            user: currentUser,
                            createdAt,
                            mark,
                            view,
                            type: 'insertion',
                        };
                        console.log('👤 Started new suggestion due to other user\'s mark:', suggestionId);
                        return true;
                    }
                }


                // 2c. Plain area — start a fresh suggestion
                if (!markAtPos && !currentSuggestionId) {
                    const suggestionId = `sugg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                    currentSuggestionId = suggestionId;

                    const mark = schema.marks.suggestion.create({
                        suggestionId,
                        username: currentUser.name,
                        userId: currentUser.id,
                        color: currentUser.color,
                        createdAt,
                    });

                    const node = schema.text(text, [mark]);
                    const tr = state.tr.replaceWith(from, to, node);
                    dispatch(tr);

                    // After insertion, compute actual range/text
                    const updatedState = view.state;
                    const range = findSuggestionRange(updatedState, suggestionId);
                    const actualText = range
                        ? updatedState.doc.textBetween(range.from, range.to)
                        : text;

                    tempSuggestion = {
                        from: range?.from ?? from,
                        to: range?.to ?? from + text.length,
                        text: actualText,
                        suggestionId,
                        user: currentUser,
                        createdAt,
                        mark,
                        view,
                        type: 'insertion',
                    };
                    console.log('🆕 New suggestion started in plain text:', suggestionId);
                    return true;
                }

                // Case: tempSuggestion got lost, but we are inside same suggestion — rehydrate
                if (
                    isInsideSameSuggestion &&
                    !tempSuggestion
                ) {
                    currentSuggestionId = markAtPos.attrs.suggestionId;

                    const mark = markAtPos;
                    const tr = state.tr.replaceWith(from, to, schema.text(text, [mark]));
                    dispatch(tr);

                    const updatedState = view.state;
                    const range = findSuggestionRange(updatedState, currentSuggestionId);
                    const actualText = range
                        ? updatedState.doc.textBetween(range.from, range.to)
                        : text;

                    tempSuggestion = {
                        from: range?.from ?? from,
                        to: range?.to ?? from + text.length,
                        text: actualText,
                        suggestionId: currentSuggestionId,
                        user: {
                            id: markAtPos.attrs.userId,
                            name: markAtPos.attrs.username,
                            color: markAtPos.attrs.color,
                        },
                        createdAt: markAtPos.attrs.createdAt,
                        mark,
                        view,
                        type: 'insertion',
                    };
                    console.log('♻️ Rehydrated due to missing tempSuggestion');
                    return true;
                }

                // Fallback: inconsistent state (e.g., cursor moved inside your suggestion but currentSuggestionId mismatched)
                console.log('⚠️ Cursor moved mid-suggestion or inconsistent state:', {
                    currentSuggestionId,
                    markAtPos,
                    tempSuggestion,
                });

                if (markAtPos && markAtPos.attrs.userId === currentUser.id && markAtPos.attrs.suggestionId !== currentSuggestionId) {
                    // Try rehydrating fallback
                    currentSuggestionId = markAtPos.attrs.suggestionId;

                    // Insert current text under that mark
                    const mark = markAtPos;
                    const tr = state.tr.replaceWith(from, to, schema.text(text, [mark]));
                    dispatch(tr);

                    const updatedState = view.state;
                    const range = findSuggestionRange(updatedState, currentSuggestionId);
                    console.log("fallback", range)
                    const actualText = range
                        ? updatedState.doc.textBetween(range.from, range.to)
                        : text;

                    tempSuggestion = {
                        from: range?.from ?? from,
                        to: range?.to ?? from + text.length,
                        text: actualText,
                        suggestionId: currentSuggestionId,
                        user: {
                            id: markAtPos.attrs.userId,
                            name: markAtPos.attrs.username,
                            color: markAtPos.attrs.color,
                        },
                        createdAt: markAtPos.attrs.createdAt,
                        mark,
                        view,
                        type: 'insertion',
                    };
                    console.log('♻️ Rehydrated in fallback');
                    return true;
                }

                // If everything else fails, do nothing (or optionally clear)
                return false;
            },
            handleKeyDown(view, event) {
                const { state, dispatch } = view;
                const { selection, schema } = state;
                const currentUser = getUser();

                if (getMode() !== 'Suggesting') return false;

                const { from, to, empty } = selection;
                const isDeleteKey = event.key === 'Backspace' || event.key === 'Delete';

                if (!isDeleteKey) return false;

                // Nothing to delete
                if (empty && event.key === 'Delete' && from === state.doc.content.size) return false;
                if (empty && event.key === 'Backspace' && from === 0) return false;

                // Determine actual deletion range
                const deleteFrom = empty
                    ? event.key === 'Backspace'
                        ? from - 1
                        : from
                    : from;

                const deleteTo = empty
                    ? event.key === 'Backspace'
                        ? from
                        : from + 1
                    : to;

                // 👇 Get all marks in the deletion range
                let deletionIsOwn = true;
                state.doc.nodesBetween(deleteFrom, deleteTo, (node) => {
                    node.marks.forEach(mark => {
                        console.log("mark.attrs.userId", mark.attrs.userId, currentUser.id, mark.type.name);

                        if (mark.type.name === 'suggestion' && mark.attrs.userId !== currentUser.id) {
                            deletionIsOwn = false;
                        }
                        if (mark.type.name === 'suggestion' && mark.attrs.userId === currentUser.id) {
                            // it's your own deletion, so just delete it directly
                        }
                    });
                });
                console.log("deletionIsOwn", deletionIsOwn);

                // If user is deleting their own suggestion-deletion(s), just allow normal deletion
                if (deletionIsOwn) {
                    dispatch(state.tr.delete(deleteFrom, deleteTo));
                    return true;
                }

                // Wrap others' or fresh text in deletion mark
                const deletedText = state.doc.textBetween(deleteFrom, deleteTo);
                if (!deletedText) return false;

                let suggestionDeletionId = `sugg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                const mark = schema.marks['suggestion-deletion'].create({
                    suggestionDeletionId: suggestionDeletionId,
                    username: currentUser.name,
                    userId: currentUser.id,
                    color: currentUser.color,
                    createdAt: new Date().toISOString(),
                });

                const node = schema.text(deletedText, [mark]);
                let tr = state.tr.replaceWith(deleteFrom, deleteTo, node);
                tr = tr.setSelection(TextSelection.create(tr.doc, deleteFrom));
                const coords = view.coordsAtPos(from); // where to show the popup
                const suggestionData = {
                    suggestionId: suggestionDeletionId,
                    user: {
                        name: currentUser.name,
                        id: currentUser.id,
                    },
                    createdAt: new Date().toISOString(),
                    text: deletedText,
                    type: 'deletion', // or 'insertion'
                    coords: {
                        top: coords.top + window.scrollY,
                        left: coords.left + window.scrollX,
                    }
                };

                window.dispatchEvent(new CustomEvent('show-suggestion-popup', {
                    detail: suggestionData,
                }));

                dispatch(tr);

                return true;
            },
            decorations(state) {
                try {
                    const decorations = [];
                    const { selection } = state;
                    const cursorPos = selection.from;

                    const markRanges = findChildrenMarks(state.doc, (mark) => mark.type.name === 'suggestion');

                    markRanges.forEach(({ node, from: start, to }) => {
                        const mark = node.marks.find(m => m.type.name === 'suggestion');
                        const isOwn = mark?.attrs?.userId === getUser().id;
                        const isFocused = cursorPos >= start && cursorPos <= to;

                        if (isOwn && isFocused) {
                            decorations.push(Decoration.inline(start, to, {
                                class: 'suggestion-focused'
                            }));
                        }
                    });

                    return DecorationSet.create(state.doc, decorations);
                } catch (err) {
                    console.warn("Failed to generate decorations:", err);
                    return DecorationSet.empty;
                }
            },
        },
    });
};

/* suggestion/track change code begins */
const findChildrenMarks = (doc, markType) => {
    const results = [];

    doc.descendants((node, pos) => {
        if (!node.isText) return;

        node.marks.forEach((mark) => {
            if (mark.type === markType) {
                results.push({ node, mark, pos });
            }
        });
    });

    return results;
}
function getMarkAtPos(state, pos, markType) {
    const $pos = state.doc.resolve(pos);
    for (let i = 0; i < $pos.marks().length; i++) {
        const mark = $pos.marks()[i];
        if (mark.type.name === markType) return mark;
    }
    return null;
}

function findSuggestionRange(state, suggestionId) {
    let start = -1;
    let end = -1;
    const { doc, schema } = state;
    const suggestionMarkName = 'suggestion';

    doc.descendants((node, pos) => {
        if (!node.isText) return true; // continue
        const hasMark = node.marks.some(
            (m) => m.type.name === suggestionMarkName && m.attrs.suggestionId === suggestionId
        );
        if (hasMark) {
            if (start === -1) {
                start = pos;
            }
            end = pos + node.nodeSize; // nodeSize for text includes its length
        }
        return true; // continue traversal
    });

    if (start === -1 || end === -1) {
        return null; // not found
    }

    // For textBetween we need the actual character positions; ProseMirror textBetween expects "from" inclusive, "to" exclusive in document positions.
    return { from: start, to: end };
}

export { SuggestionMark, SuggestionExtension };