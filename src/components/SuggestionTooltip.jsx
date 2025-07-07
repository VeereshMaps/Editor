import React from 'react'
import { createPortal } from 'react-dom'
import { offset, shift, useFloating } from '@floating-ui/react'
import { getHTMLFromFragment } from '@tiptap/core'
import { getNextWord, getPreviousWord } from '@tiptap-pro/extension-ai-suggestion'
import {
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    Typography,
} from '@mui/material'

export function SuggestionTooltip({ element, editor }) {
    const suggestion = editor.extensionStorage.aiSuggestion.getSelectedSuggestion()
    const isOpen = Boolean(element && suggestion)

    const { refs, floatingStyles } = useFloating({
        open: Boolean(suggestion),
        middleware: [offset(8), shift({ padding: 8 })],
    });

    const getSuggestionCoords = () => {
        if (!editor || !suggestion?.deleteRange) return { top: 0, left: 0 };

        const { from } = suggestion.deleteRange;
        const coords = editor.view.coordsAtPos(from);

        return {
            top: coords.top + window.scrollY + 20, // adjust offset as needed
            left: coords.left + window.scrollX,
        };
    };

    const coords = getSuggestionCoords();


    return (
        <>
            {/* {element && createPortal(<span ref={refs.setReference}></span>, element)} */}

            {isOpen && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: coords.top,
                        left: coords.left,
                        zIndex: 9999,
                        background: 'white',
                    }}
                >
                    <Card variant="outlined" sx={{ minWidth: 300 }}>
                        <CardContent>
                            {suggestion.replacementOptions.map((option, index) => {
                                const { previousWord } = getPreviousWord(editor, suggestion.deleteRange.from)
                                const { nextWord, punctuationMark } = getNextWord(editor, suggestion.deleteRange.to)

                                return (
                                    <Box key={index} sx={{ mb: 2 }}>
                                        <Typography variant="body2">
                                            {previousWord}{' '}
                                            <span
                                                style={{
                                                    backgroundColor: suggestion.rule.backgroundColor,
                                                    padding: '0 4px',
                                                    borderRadius: '4px',
                                                }}
                                                dangerouslySetInnerHTML={{
                                                    __html: getHTMLFromFragment(
                                                        option.addSlice.content,
                                                        editor.schema
                                                    ),
                                                }}
                                            ></span>{' '}
                                            {nextWord ? ` ${nextWord}...` : punctuationMark}
                                        </Typography>

                                        <Stack direction="row" spacing={1} mt={1}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => {
                                                    editor
                                                        .chain()
                                                        .applyAiSuggestion({
                                                            suggestionId: suggestion.id,
                                                            replacementOptionId: option.id,
                                                            format: 'rich-text',
                                                        })
                                                        .focus()
                                                        .run()
                                                }}
                                            >
                                                Apply
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => {
                                                    editor
                                                        .chain()
                                                        .rejectAiSuggestion(suggestion.id)
                                                        .focus()
                                                        .run()
                                                }}
                                            >
                                                Reject
                                            </Button>
                                        </Stack>
                                    </Box>
                                )
                            })}

                            <Typography variant="caption" color="text.secondary" mt={2}>
                                {suggestion.rule.title}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </>
    )
}
