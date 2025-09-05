import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Underline from '@tiptap/extension-underline'
import { FontSize, TextStyle, FontFamily, TextStyleKit, LineHeight } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { BackgroundColor } from "@tiptap/extension-text-style";
import { InlineThread } from '@tiptap-pro/extension-comments'
import Strike from "@tiptap/extension-strike";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { CharacterCount, Focus } from "@tiptap/extensions";
import { ListKit } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import TextAlign from '@tiptap/extension-text-align'
import FileHandler from '@tiptap/extension-file-handler'
import DragHandle from '@tiptap/extension-drag-handle'
import {
    PaginationPlus,
} from 'tiptap-pagination-plus'

export const PAGE_SIZES = {
    // A3: { width: 842, height: 1191 },   // 297 × 420 mm
    A4: { width: 595, height: 842 },    // 210 × 297 mm
    A5: { width: 420, height: 595 },    // 148 × 210 mm
    // A6: { width: 298, height: 420 },    // 105 × 148 mm
    Letter: { width: 612, height: 792 }, // 8.5 × 11 in
    // Legal: { width: 612, height: 1008 }, // 8.5 × 14 in
    // Tabloid: { width: 792, height: 1224 } // 11 × 17 in
};


const CustomParagraph = Paragraph.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            role: {
                default: null,
                parseHTML: element => element.getAttribute('data-role'),
                renderHTML: attributes => {
                    if (!attributes.role) {
                        return {};
                    }
                    return {
                        'data-role': attributes.role,
                    };
                },
            },
        };
    },
});
export const CommenTipTapExtensions = (pageSizeKey = "A4", uploadedDocsTitle) => {
    const { width, height } = PAGE_SIZES[pageSizeKey] || PAGE_SIZES.A4;

    return [Document, Paragraph, CustomParagraph, Text, Underline, FontSize, TextStyle, FontFamily, LineHeight, BackgroundColor, Color, Highlight.configure({ multicolor: true }), Subscript, Superscript, InlineThread,
        Strike,
        Link,
        CharacterCount,
        TextStyleKit.configure({ textStyle: { mergeNestedSpanStyles: true } }),
        Focus.configure({
            className: 'has-focus',
            mode: 'all',
        }), ,
        HorizontalRule.configure({
            HTMLAttributes: {
                class: 'my-custom-class',
            },
        }),
        Image.configure({ inline: true, allowBase64: true }),
        ListKit,
        TableKit.configure({
            table: {
                resizable: true,
                HTMLAttributes: {
                    style: 'border-collapse: collapse; width: 100%;',
                },
            },
            tableRow: {
                HTMLAttributes: {
                    style: 'border: 1px solid #ddd;',
                },
            },
            tableCell: {
                HTMLAttributes: {
                    style: 'border: 1px solid #ddd; padding: 8px; min-width: 50px;',
                },
            },
            tableHeader: {
                HTMLAttributes: {
                    style: 'border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5; font-weight: bold;',
                },
            },
        }),
        PaginationPlus.configure({
            pageWidth: width,
            pageHeight: height,
            pageGap: 20,
            pageBreakBackground: "#F7F7F8",
            pageHeaderHeight: 25,
            pageFooterHeight: 25,
            footerRight: "Map Prepress Studio",
            footerLeft: "Page {page}",
            headerLeft: uploadedDocsTitle ? uploadedDocsTitle : "",
            // headerRight: "Header Right",
            marginTop: 30,
            marginBottom: 50,
            marginLeft: 70,
            marginRight: 70,
            contentMarginTop: 30,
            contentMarginBottom: 30,
        }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        FileHandler.configure({
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            onDrop: (currentEditor, files, pos) => {
                files.forEach(file => {
                    const fileReader = new FileReader()

                    fileReader.readAsDataURL(file)
                    fileReader.onload = () => {
                        currentEditor
                            .chain()
                            .insertContentAt(pos, {
                                type: 'image',
                                attrs: {
                                    src: fileReader.result,
                                },
                            })
                            .focus()
                            .run()
                    }
                })
            },
            onPaste: (currentEditor, files, htmlContent) => {
                files.forEach(file => {
                    if (htmlContent) {
                        // if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
                        // you could extract the pasted file from this url string and upload it to a server for example
                        console.log(htmlContent) // eslint-disable-line no-console
                        return false
                    }

                    const fileReader = new FileReader()

                    fileReader.readAsDataURL(file)
                    fileReader.onload = () => {
                        currentEditor
                            .chain()
                            .insertContentAt(currentEditor.state.selection.anchor, {
                                type: 'image',
                                attrs: {
                                    src: fileReader.result,
                                },
                            })
                            .focus()
                            .run()
                    }
                })
            },
        }),
        DragHandle.configure({
            render: () => {
                const element = document.createElement('div')

                // Use as a hook for CSS to insert an icon
                element.classList.add('custom-drag-handle')

                return element
            },
            tippyOptions: {
                placement: 'left',
            },
        }),
    ];
};
