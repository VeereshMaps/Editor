import React from 'react'
import {
    Box,
    Card,
    CardContent,
    Button,
    Typography,
    Stack,
    Divider,
    CircularProgress,
} from '@mui/material'
import { getHTMLFromFragment } from '@tiptap/core'

export function AISuggestionsSidebar({ editor, aiLoading }) {
    const suggestions = editor.extensionStorage.aiSuggestion?.getSuggestions() || []
    // console.log("aiLoading",aiLoading);
    

    const scrollToSuggestion = (suggestion) => {
        if (!editor || !suggestion?.deleteRange) return

        // editor.chain().focus().setTextSelection(suggestion.deleteRange.from).run()
        // editor.view.scrollIntoView({ behavior: 'smooth', block: 'center' })
        editor.chain().focus().setTextSelection(suggestion.deleteRange.from).scrollIntoView().run()
    }

    const applySuggestion = (suggestion, option) => {
        editor
            .chain()
            .applyAiSuggestion({
                suggestionId: suggestion.id,
                replacementOptionId: option.id,
                format: 'rich-text',
            })
            .focus()
            .run()
    }

    const rejectSuggestion = (suggestion) => {
        editor.chain().rejectAiSuggestion(suggestion.id).focus().run()
    }

    const getCurrentText = (deleteRange) => {
        if (!editor || !deleteRange) return ''
        const { from, to } = deleteRange
        return editor.state.doc.textBetween(from, to, '\n')
    }

    return (
        <Box sx={{ p: 2, borderLeft: '1px solid #ddd', overflowY: 'auto', height:"100%" }}>
            <Typography variant="h6" gutterBottom>
                AI Suggestions
            </Typography>
            {aiLoading && (
                <CircularProgress size={24} />
                // <Box sx={{ textAlign: 'center', py: 2 }}>
                //     <CircularProgress size={24} />
                //     <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                //         Loading AI suggestions...
                //     </Typography>
                // </Box>
            )}

            {suggestions.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                    No suggestions available.
                </Typography>
            )}
            <div style={{height:"70vh", overflowY:"auto"}}>
            <Stack spacing={2}>
                {suggestions.map((suggestion) => (
                    <Card
                        key={suggestion.id}
                        variant="outlined"
                        elevation={3}
                        sx={{
                            cursor: 'pointer',
                            borderRadius: 2,
                            boxShadow: 3,
                            '&:hover': { backgroundColor: '#f9f9f9' },
                            width: "100%", 
                        }}
                        onClick={() => scrollToSuggestion(suggestion)}
                    >
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">
                                Current Text:
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    backgroundColor: '#f0f0f0',
                                    p: 0.5,
                                    borderRadius: 1,
                                    mb: 1,
                                }}
                            >
                                {getCurrentText(suggestion.deleteRange)}
                            </Typography>

                            <Divider />

                            <Typography variant="subtitle2" color="text.secondary" mt={1}>
                                Suggested:
                            </Typography>

                            {suggestion.replacementOptions.map((option) => (
                                <Box key={option.id} sx={{ mb: 1 }}>
                                    <Typography
                                        variant="body2"
                                        dangerouslySetInnerHTML={{
                                            __html: getHTMLFromFragment(option.addSlice.content, editor.schema),
                                        }}
                                        sx={{
                                            backgroundColor: suggestion.rule.backgroundColor,
                                            p: 0.5,
                                            borderRadius: 1,
                                            display: 'inline-block',
                                        }}
                                    ></Typography>

                                    <Stack direction="row" spacing={1} mt={1}>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="success"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                applySuggestion(suggestion, option)
                                            }}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                rejectSuggestion(suggestion)
                                            }}
                                        >
                                            Reject
                                        </Button>
                                    </Stack>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </Stack>
            </div>
        </Box>
    )
}
