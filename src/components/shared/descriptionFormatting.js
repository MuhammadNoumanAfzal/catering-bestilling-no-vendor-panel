import DOMPurify from "dompurify";
export function cleanDescription(value) {
 return DOMPurify.sanitize(String(value || ""), {ALLOWED_TAGS:["p","br","strong","b","em","i","u","s","ul","ol","li","h2","h3","blockquote"],ALLOWED_ATTR:[]});
}
export function descriptionContent(value) {
 const text=String(value || "");
 if (/<\/?(?:p|br|strong|b|em|i|u|s|ul|ol|li|h2|h3|blockquote)(?:\s[^>]*)?\s*\/?>/i.test(text)) return cleanDescription(text);
 return text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\r?\n/g,"<br>");
}
export function descriptionText(value) {
 const node=document.createElement("div");node.innerHTML=descriptionContent(value);
 for(const el of node.querySelectorAll("p,br,li,h2,h3,blockquote"))el.append(document.createTextNode(" "));
 return node.textContent.replace(/\s+/g," ").trim();
}
