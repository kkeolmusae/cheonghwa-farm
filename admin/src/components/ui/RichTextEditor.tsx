import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import toast from 'react-hot-toast';
import { uploadImage } from '@/api/uploads';
import { cn } from '@/utils/cn';

// width 속성을 지원하는 Image 확장
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attrs) =>
          attrs.width ? { style: `width: ${attrs.width}; height: auto;` } : {},
        parseHTML: (el) => el.style.width || null,
      },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-gray-200" />;
}

async function handleFileUpload(file: File, editor: Editor) {
  try {
    const result = await uploadImage(file);
    editor.chain().focus().setImage({ src: result.image_url }).run();
  } catch {
    toast.error('이미지 업로드에 실패했습니다.');
  }
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  error,
  label,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [isImageActive, setIsImageActive] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder ?? '내용을 입력해주세요' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[300px] px-3 py-2.5 text-sm leading-relaxed text-gray-900',
      },
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItem = items.find((item) => item.type.startsWith('image/'));
        if (!imageItem) return false;

        event.preventDefault();
        const file = imageItem.getAsFile();
        if (file && editorRef.current) {
          handleFileUpload(file, editorRef.current);
        }
        return true;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        const imageFile = files.find((f) => f.type.startsWith('image/'));
        if (!imageFile) return false;

        event.preventDefault();
        if (editorRef.current) {
          handleFileUpload(imageFile, editorRef.current);
        }
        return true;
      },
    },
  });

  // editor ref 동기화 + 선택 변경 구독
  useEffect(() => {
    editorRef.current = editor;
    if (!editor) return;

    const updateImageActive = () => {
      setIsImageActive(editor.isActive('image'));
    };

    editor.on('selectionUpdate', updateImageActive);
    editor.on('transaction', updateImageActive);

    return () => {
      editor.off('selectionUpdate', updateImageActive);
      editor.off('transaction', updateImageActive);
    };
  }, [editor]);

  // 수정 모드 초기화
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const isImageSelected = isImageActive;

  async function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    await handleFileUpload(file, editor);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      <div
        className={cn(
          'overflow-hidden rounded-lg border border-gray-300 shadow-sm',
          error && 'border-red-500',
        )}
      >
        {/* 툴바 */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
          <ToolbarButton
            title="굵게 (Bold)"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive('bold')}
          >
            <strong>B</strong>
          </ToolbarButton>

          <ToolbarButton
            title="기울임 (Italic)"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive('italic')}
          >
            <em>I</em>
          </ToolbarButton>

          <ToolbarButton
            title="밑줄 (Underline)"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            isActive={editor?.isActive('underline')}
          >
            <span className="underline">U</span>
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="제목 2 (H2)"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor?.isActive('heading', { level: 2 })}
          >
            H2
          </ToolbarButton>

          <ToolbarButton
            title="제목 3 (H3)"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor?.isActive('heading', { level: 3 })}
          >
            H3
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="글머리 목록"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            isActive={editor?.isActive('bulletList')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            title="번호 목록"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            isActive={editor?.isActive('orderedList')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            title="인용구"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            isActive={editor?.isActive('blockquote')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
            </svg>
          </ToolbarButton>

          <ToolbarDivider />

          {/* 이미지 업로드 버튼 */}
          <ToolbarButton title="이미지 삽입 (클립보드 Ctrl+V도 가능)" onClick={() => fileInputRef.current?.click()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </ToolbarButton>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />

          {/* 이미지 선택 시 크기 조절 버튼 */}
          {isImageSelected && (
            <>
              <ToolbarDivider />
              <span className="px-1 text-xs text-gray-400">크기:</span>
              {(['25%', '50%', '75%', '100%'] as const).map((w) => (
                <ToolbarButton
                  key={w}
                  title={`이미지 너비 ${w}`}
                  onClick={() => editor?.chain().focus().updateAttributes('image', { width: w }).run()}
                >
                  <span className="text-xs">{w}</span>
                </ToolbarButton>
              ))}
            </>
          )}
        </div>

        {/* 에디터 본문 */}
        <EditorContent editor={editor} className="prose-editor" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
