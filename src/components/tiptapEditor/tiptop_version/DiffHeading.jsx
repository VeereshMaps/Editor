import { Heading as BaseHeading } from '@tiptap/extension-heading'
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { extractAttributeChanges } from '@tiptap-pro/extension-snapshot-compare'
import React from 'react'

/**
 * CAUTION: This is an advanced example.
 * This example shows how you can extend the `Heading` node to display differences using the `extractAttributeChanges` helper.
 */
export const Heading = BaseHeading.extend({
  addNodeView() {
    return ReactNodeViewRenderer(({ node, decorations }) => {
      // This allows us to extract the changes that have been applied to the node
      const { before, after, isDiffing } = extractAttributeChanges(decorations)

      return (
        <NodeViewWrapper style={{ position: 'relative' }}>
          {/* And, display them in the UI however we like */}
          {isDiffing && before.level !== after.level && (
            <span
              style={{
                position: 'absolute',
                right: '100%',
                fontSize: '14px',
                color: '#999',
                backgroundColor: '#f0f0f070',
              }}
              // Display the difference in level attribute
            >
              #<s>{before.level}</s>
              {after.level}
            </span>
          )}
          <NodeViewContent as={`h${node.attrs.level ?? 1}`} />
        </NodeViewWrapper>
      )
    })
  },
})