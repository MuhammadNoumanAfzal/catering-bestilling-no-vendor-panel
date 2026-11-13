import {descriptionContent} from "./descriptionFormatting.js";
export default function RichDescription({value,className=""}) {
 return <div className={"break-words [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-semibold [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-[#cf6e38] [&_blockquote]:pl-3 "+className} dangerouslySetInnerHTML={{__html:descriptionContent(value)}} />;
}
