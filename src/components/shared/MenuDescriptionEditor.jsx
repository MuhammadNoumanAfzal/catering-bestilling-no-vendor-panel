import {createElement,useEffect} from "react";
import {useTranslation} from "react-i18next";
import {EditorContent,useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {Bold,Italic,Underline,List,ListOrdered,Heading2,Heading3,Quote,Undo2,Redo2,RemoveFormatting} from "lucide-react";
import {cleanDescription,descriptionContent} from "./descriptionFormatting.js";
export default function MenuDescriptionEditor({value="",onChange,disabled=false,placeholder}) {
 const {i18n}=useTranslation(); const no=/^(nb|no)/.test(i18n.language);
 const editor=useEditor({extensions:[StarterKit.configure({link:false,codeBlock:false,code:false,horizontalRule:false,heading:{levels:[2,3]}})],content:descriptionContent(value),editable:!disabled,shouldRerenderOnTransaction:true,
 editorProps:{attributes:{role:"textbox","aria-label":placeholder || (no?"Beskrivelse":"Description"),"aria-multiline":"true",class:"min-h-full p-3 text-sm leading-6 outline-none"}},
 onUpdate:({editor})=>onChange?.({target:{value:editor.isEmpty?"":cleanDescription(editor.getHTML())}})});
 useEffect(()=>{if(editor)editor.setEditable(!disabled);},[editor,disabled]);
 useEffect(()=>{if(editor && descriptionContent(value)!==editor.getHTML())editor.commands.setContent(descriptionContent(value),{emitUpdate:false});},[editor,value]);
 const buttons=[
 [Bold,"Bold","Fet",()=>editor.chain().focus().toggleBold().run(),"bold"],
 [Italic,"Italic","Kursiv",()=>editor.chain().focus().toggleItalic().run(),"italic"],
 [Underline,"Underline","Understreking",()=>editor.chain().focus().toggleUnderline().run(),"underline"],
 [Heading2,"Heading","Overskrift",()=>editor.chain().focus().toggleHeading({level:2}).run(),"heading",{level:2}],
 [Heading3,"Subheading","Underoverskrift",()=>editor.chain().focus().toggleHeading({level:3}).run(),"heading",{level:3}],
 [List,"Bullet list","Punktliste",()=>editor.chain().focus().toggleBulletList().run(),"bulletList"],
 [ListOrdered,"Numbered list","Nummerert liste",()=>editor.chain().focus().toggleOrderedList().run(),"orderedList"],
 [Quote,"Quote","Sitat",()=>editor.chain().focus().toggleBlockquote().run(),"blockquote"],
 [RemoveFormatting,"Clear formatting","Fjern formatering",()=>editor.chain().focus().unsetAllMarks().clearNodes().run()],
 [Undo2,"Undo","Angre",()=>editor.chain().focus().undo().run()],
 [Redo2,"Redo","Gjor om",()=>editor.chain().focus().redo().run()]];
 return <div className={"overflow-hidden rounded-xl border border-[#d7cec4] bg-white focus-within:border-[#cf6e38] focus-within:ring-2 focus-within:ring-orange-100 "+(disabled?"opacity-70":"")}>
 {!disabled && <div role="toolbar" aria-label={no?"Tekstformatering":"Text formatting"} className="flex flex-wrap gap-1 border-b border-[#eee4dc] bg-[#faf7f4] p-2">{buttons.map(([Icon,en,nb,run,active,attrs])=><button key={en} type="button" disabled={!editor} title={no?nb:en} aria-label={no?nb:en} aria-pressed={active?!!editor?.isActive(active,attrs):undefined} onMouseDown={e=>e.preventDefault()} onClick={run} className={"rounded-md p-2 transition hover:bg-[#f1e5da] focus-visible:outline-2 focus-visible:outline-[#cf6e38] "+(active&&editor?.isActive(active,attrs)?"bg-[#f5dfce] text-[#ad542b]":"text-[#6e5b4b]")}>{createElement(Icon,{size:16})}</button>)}</div>}
 <div className="relative [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-1 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-orange-300 [&_blockquote]:pl-3">{editor?.isEmpty&&<span aria-hidden="true" className="pointer-events-none absolute left-3 top-3 text-sm text-[#a59689]">{placeholder}</span>}<div className="h-[220px] min-h-[160px] max-h-[75vh] resize-y overflow-auto"><EditorContent editor={editor} className="h-full"/></div></div>
 </div>;
}
