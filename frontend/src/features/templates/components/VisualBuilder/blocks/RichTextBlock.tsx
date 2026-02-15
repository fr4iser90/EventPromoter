/**
 * RichTextBlock - Rich-Text-Block Komponente
 * 
 * Rich-Text-Block für type: 'html' oder 'rich'
 * Unterstützt visuelles Bearbeiten mit Tiptap
 * 
 * @module features/templates/components/VisualBuilder/blocks/RichTextBlock
 */

import React, { useEffect } from 'react'
import { Typography, Box, Chip, ToggleButton, ToggleButtonGroup, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import type { RichTextBlockProps } from '../../../types'

/**
 * RichTextBlock Komponente
 */
function RichTextBlock({ block, fieldSchema, isSelected, onUpdate, onInsertVariable }: RichTextBlockProps) {
  const { t } = useTranslation()
  const [editorMode, setEditorMode] = React.useState<'visual' | 'code'>('visual') // 'visual' or 'code'

  const handleChange = (value: string) => {
    onUpdate({ value })
  }

  // Extrahiere Variablen aus dem Content
  const extractVariables = (content: string) => {
    if (!content) return []
    const matches = content.match(/\{([^}]+)\}/g) || []
    return [...new Set(matches.map((m: string) => m.slice(1, -1)))]
  }

  const variables = extractVariables(block.data.value || '')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https'
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true })
    ],
    content: block.data.value || '',
    onUpdate: ({ editor: instance }) => {
      handleChange(instance.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor'
      }
    }
  })

  useEffect(() => {
    if (!editor) return
    const nextValue = block.data.value || ''
    const currentValue = editor.getHTML()
    if (currentValue !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false })
    }
  }, [editor, block.data.value])

  const setLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt(
      t('template.linkPrompt', { defaultValue: 'Enter link URL (leave empty to remove)' }),
      previousUrl || 'https://'
    )

    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
          {fieldSchema.label}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {variables.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {variables.map((varName) => (
                <Chip
                  key={varName}
                  label={`{${varName}}`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          )}
          {fieldSchema.type === 'html' && (
            <ToggleButtonGroup
              value={editorMode}
              exclusive
              onChange={(e, value) => {
                if (value !== null) {
                  setEditorMode(value)
                }
              }}
              size="small"
            >
              <ToggleButton value="visual">
                {t('template.visual', { defaultValue: 'Visual' })}
              </ToggleButton>
              <ToggleButton value="code">
                {t('template.code', { defaultValue: 'Code' })}
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
      </Box>
      {fieldSchema.description && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {fieldSchema.description}
        </Typography>
      )}
      
      {editorMode === 'visual' ? (
        <Box sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Button size="small" onClick={() => editor?.chain().focus().setParagraph().run()} variant={editor?.isActive('paragraph') ? 'contained' : 'outlined'}>P</Button>
            <Button size="small" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} variant={editor?.isActive('heading', { level: 1 }) ? 'contained' : 'outlined'}>H1</Button>
            <Button size="small" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} variant={editor?.isActive('heading', { level: 2 }) ? 'contained' : 'outlined'}>H2</Button>
            <Button size="small" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} variant={editor?.isActive('heading', { level: 3 }) ? 'contained' : 'outlined'}>H3</Button>
            <Button size="small" onClick={() => editor?.chain().focus().toggleBold().run()} variant={editor?.isActive('bold') ? 'contained' : 'outlined'}><strong>B</strong></Button>
            <Button size="small" onClick={() => editor?.chain().focus().toggleItalic().run()} variant={editor?.isActive('italic') ? 'contained' : 'outlined'}><em>I</em></Button>
            <Button size="small" onClick={() => editor?.chain().focus().toggleUnderline().run()} variant={editor?.isActive('underline') ? 'contained' : 'outlined'}><u>U</u></Button>
            <Button size="small" onClick={() => editor?.chain().focus().toggleStrike().run()} variant={editor?.isActive('strike') ? 'contained' : 'outlined'}><s>S</s></Button>
            <Button size="small" onClick={() => editor?.chain().focus().toggleOrderedList().run()} variant={editor?.isActive('orderedList') ? 'contained' : 'outlined'}>1.</Button>
            <Button size="small" onClick={() => editor?.chain().focus().toggleBulletList().run()} variant={editor?.isActive('bulletList') ? 'contained' : 'outlined'}>•</Button>
            <Button size="small" onClick={setLink} variant={editor?.isActive('link') ? 'contained' : 'outlined'}>{t('template.link', { defaultValue: 'Link' })}</Button>
            <Button size="small" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} variant="outlined">{t('template.clear', { defaultValue: 'Clear' })}</Button>
            <input
              type="color"
              title={t('template.textColor', { defaultValue: 'Text color' })}
              onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
              style={{ width: 32, height: 28, border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
            <input
              type="color"
              title={t('template.backgroundColor', { defaultValue: 'Background color' })}
              onChange={(e) => editor?.chain().focus().setHighlight({ color: e.target.value }).run()}
              style={{ width: 32, height: 28, border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
          </Box>
          <Box sx={{
            '& .tiptap-editor': {
              minHeight: '300px',
              padding: '12px',
              fontSize: '14px',
              outline: 'none'
            }
          }}>
            <EditorContent editor={editor} />
          </Box>
        </Box>
      ) : (
        <Box>
          <textarea
            value={block.data.value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldSchema.placeholder || t('template.enterContent', { defaultValue: 'Enter content... Use {variable} for dynamic content' })}
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical',
            }}
          />
        </Box>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {t('template.variablesHint', { defaultValue: 'Use variables in curly braces, e.g., {title}, {date}' })}
      </Typography>
    </Box>
  )
}

export default RichTextBlock
