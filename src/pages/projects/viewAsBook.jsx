import React, { useState, useLayoutEffect, useRef } from 'react';
import '../../styles/ViewAsBook.css';
import { useLocation } from 'react-router';

const ViewAsBook = () => {
    const location = useLocation();
    const { jsonContent } = location.state || {};

    const [pages, setPages] = useState([]);
    const hiddenContainerRef = useRef(null);

    // ✅ Converts mm to px at 96 dpi
    const mmToPx = (mm) => (mm * 96) / 25.4;

    // ✅ Renders a text node with marks
    const processMarks = (textNode, key) => {
        let text = textNode.text || '';

        if (textNode.marks && textNode.marks.length > 0) {
            return textNode.marks.reduce((acc, mark) => {
                if (mark.type === 'bold') {
                    return <strong key={key}>{acc}</strong>;
                } else if (mark.type === 'italic') {
                    return <em key={key}>{acc}</em>;
                }
                return acc;
            }, text);
        }

        return text;
    };

    // ✅ Renders each node as JSX
    const renderNode = (node, index) => {
        if (node.type === 'heading') {
            const level = node.attrs?.level || 1;
            const textAlign = node.attrs?.textAlign || 'left';
            const HeadingTag = `h${level}`;

            const text = node.content?.map((c, i) => processMarks(c, i));

            return (
                <HeadingTag key={index} style={{ textAlign }}>
                    {text}
                </HeadingTag>
            );
        } else if (node.type === 'paragraph') {
            const textAlign = node.attrs?.textAlign || 'left';

            const text = node.content?.map((c, i) => {
                if (c.type === 'text') {
                    return <React.Fragment key={i}>{processMarks(c, i)}</React.Fragment>;
                } else if (c.type === 'hardBreak') {
                    return <br key={i} />;
                }
                return null;
            });

            return (
                <p key={index} style={{ textAlign }}>
                    {text}
                </p>
            );
        }

        return null;
    };

    // ✅ Converts a React element to DOM element for measurement
    const renderToElement = (element) => {
        const container = document.createElement('div');
        const temp = document.createElement('div');
        container.appendChild(temp);
        import('react-dom').then(ReactDOM => {
            ReactDOM.render(element, temp);
        });
        return container;
    };

    // ✅ Height-based pagination logic
    useLayoutEffect(() => {
        if (!jsonContent?.content) return;

        const totalPageHeightPx = 1122; // fixed page height in px (A4)
        const verticalPaddingPx = mmToPx(50); // 25mm top + 25mm bottom
        const pageContentHeightPx = totalPageHeightPx - verticalPaddingPx;

        const nodeElements = jsonContent.content.map((node, i) => renderNode(node, i));

        // ✅ STEP 1: Extract heading + author as first page
        const firstPage = [];
        let remainingNodes = [...nodeElements];

        if (jsonContent.content.length >= 2 &&
            jsonContent.content[0].type === 'heading' &&
            jsonContent.content[1].type === 'paragraph') {
            firstPage.push(nodeElements[0], nodeElements[1]);
            remainingNodes = remainingNodes.slice(2);
        }

        // ✅ STEP 2: Continue normal pagination with remaining nodes
        const hiddenContainer = hiddenContainerRef.current;
        hiddenContainer.innerHTML = ''; // clear previous

        const tempPages = [];
        let currentPage = [];
        let currentHeight = 0;

        remainingNodes.forEach((element, index) => {
            const wrapper = document.createElement('div');
            wrapper.style.width = '210mm';
            wrapper.style.boxSizing = 'border-box';
            wrapper.style.padding = '25mm 20mm';
            wrapper.appendChild(renderToElement(element));

            hiddenContainer.appendChild(wrapper);
            const elHeight = wrapper.offsetHeight;
            hiddenContainer.removeChild(wrapper);

            if (currentHeight + elHeight > pageContentHeightPx) {
                tempPages.push([...currentPage]);
                currentPage = [];
                currentHeight = 0;
            }

            currentPage.push(element);
            currentHeight += elHeight;
        });

        if (currentPage.length > 0) {
            tempPages.push(currentPage);
        }

        // ✅ STEP 3: Combine first page with paginated pages
        const finalPages = [];
        if (firstPage.length > 0) finalPages.push(firstPage);
        finalPages.push(...tempPages);

        setPages(finalPages);
    }, [jsonContent]);

    return (
        <div className="book-container">
            {pages.map((pageContent, pageIndex) => (
                <div
                    className={`a4-page ${pageIndex === 0 ? 'first-page' : ''}`}
                    key={pageIndex}
                >
                    {pageContent}
                </div>
            ))}

            {/* Hidden container for measurement */}
            <div ref={hiddenContainerRef} style={{ visibility: 'hidden', position: 'absolute', top: '-9999px' }}></div>
        </div>
    );
};

export default ViewAsBook;

