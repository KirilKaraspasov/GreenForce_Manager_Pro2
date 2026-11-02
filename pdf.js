/* Offline PDF writer: Bulgarian text is rasterized with the local system font.
   No remote libraries, network calls or external fonts. A4, automatic page breaks. */
'use strict';
async function createPDF(title,text){
 const W=1240,H=1754,margin=92,lineH=34,pages=[];
 let canvas,ctx,y;
 function page(){canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.fillStyle='#005525';ctx.fillRect(0,0,W,20);ctx.font='bold 32px sans-serif';ctx.fillText('GreenForce Manager Pro',margin,82);ctx.fillStyle='#183c27';ctx.font='23px sans-serif';y=145;}
 function flush(){ctx.fillStyle='#64766b';ctx.font='18px sans-serif';ctx.fillText('GreenForce • '+title+' • '+(pages.length+1),margin,H-50);pages.push(Uint8Array.from(atob(canvas.toDataURL('image/jpeg',.92).split(',')[1]),c=>c.charCodeAt(0)));}
 page();
 for(const raw of (title+'\n\n'+text).split('\n')){let line='';const words=raw.split(/\s+/);for(let word of words){while(ctx.measureText(word).width>W-2*margin){let cut=Math.floor(word.length/2);while(ctx.measureText(word.slice(0,cut)).width>W-2*margin)cut--;if(line){if(y>H-110){flush();page()}ctx.fillText(line,margin,y);y+=lineH;line=''}if(y>H-110){flush();page()}ctx.fillText(word.slice(0,cut),margin,y);y+=lineH;word=word.slice(cut)}const next=line?line+' '+word:word;if(ctx.measureText(next).width>W-2*margin&&line){if(y>H-110){flush();page()}ctx.fillText(line,margin,y);y+=lineH;line=word}else line=next;}if(y>H-110){flush();page()}ctx.fillText(line,margin,y);y+=lineH;}
 flush();const enc=new TextEncoder(),parts=[],offsets=[0];let offset=0;
 function push(v){const bytes=typeof v==='string'?enc.encode(v):v;parts.push(bytes);offset+=bytes.length}
 function obj(n,body){offsets[n]=offset;push(n+' 0 obj\n');if(Array.isArray(body))body.forEach(push);else push(body);push('\nendobj\n')}
 push('%PDF-1.4\n');obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Count '+pages.length+' /Kids ['+pages.map((_,i)=>(3+i*3)+' 0 R').join(' ')+'] >>');
 pages.forEach((bytes,i)=>{const n=3+i*3;obj(n,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im${i} ${n+1} 0 R >> >> /Contents ${n+2} 0 R >>`);obj(n+1,[`<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`,bytes,'\nendstream']);const stream=`q 595.28 0 0 841.89 0 0 cm /Im${i} Do Q`;obj(n+2,`<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}\nendstream`)});
 const start=offset;push('xref\n0 '+offsets.length+'\n0000000000 65535 f \n');for(let i=1;i<offsets.length;i++)push(String(offsets[i]).padStart(10,'0')+' 00000 n \n');push(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`);return new Blob(parts,{type:'application/pdf'});
}
