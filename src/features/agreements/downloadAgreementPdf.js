export async function downloadAgreementPdf(url, filename) {
 // The signed URL is already authorized; never forward the portal JWT to storage.
 const response=await fetch(url,{credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok)throw new Error('The contract could not be downloaded. Please try again.');
 const blob=await response.blob();
 const signature=await blob.slice(0,5).text();
 if(signature!=='%PDF-')throw new Error('The document service did not return a PDF. Please try again.');
 const objectUrl=URL.createObjectURL(new Blob([blob],{type:'application/pdf'}));
 const link=document.createElement('a');
 link.href=objectUrl;link.download=filename;link.hidden=true;
 document.body.appendChild(link);
 try{link.click();}finally{link.remove();window.setTimeout(()=>URL.revokeObjectURL(objectUrl),60000);}
}
