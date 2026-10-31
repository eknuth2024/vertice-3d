function estimatePublic(v){if(Object.values(v).some(x=>!Number.isFinite(x)||x<0)||v.quantity<1||!Number.isInteger(v.quantity)||!Number.isInteger(v.hours)||!Number.isInteger(v.minutes)||v.minutes>59)throw Error('invalid');const material=v.grams*.15,time=v.hours+v.minutes/60,unit=material+time,base=unit*v.quantity,minimumTopup=base>0?Math.max(0,15-base):0;return {material,time,unit,quantity:v.quantity,base,minimumTopup,total:base+minimumTopup};}
(()=>{
const form=document.getElementById('print-form'),t=x=>window.VerticeLanguage.t(x);let current;
const money=x=>new Intl.NumberFormat(document.documentElement.lang==='en'?'en-US':'es-US',{style:'currency',currency:'USD'}).format(x);
const values=()=>Object.fromEntries(['grams','hours','minutes','quantity'].map(k=>{const v=document.getElementById('calc-'+k).value;return[k,v===''?NaN:Number(v)];}));
function update(){try{if(!form.checkValidity())throw Error();current=estimatePublic(values());for(const[k,v]of Object.entries(current))document.getElementById('out-'+k).textContent=k==='quantity'?String(v):money(v);document.getElementById('calc-error').hidden=true;}catch{current=null;document.querySelectorAll('[id^="out-"]').forEach(x=>x.textContent='—');document.getElementById('calc-error').hidden=false;}['calc-copy','calc-print'].forEach(id=>document.getElementById(id).disabled=!current||!current.total);}
function summary(){const v=values();return ['Vértice 3D · '+t('Precio orientativo'),'PLA',t('Peso por pieza (g)')+': '+v.grams,t('Horas por pieza')+': '+v.hours,t('Minutos por pieza')+': '+v.minutes,t('Cantidad de piezas')+': '+v.quantity,t('Precio orientativo')+': '+money(current.total),t('Estimación para PLA básico. Diseño, acabados, envío e impuestos no incluidos. Otros materiales y urgencias requieren cotización.'),t('El precio final se confirma después de revisar el archivo, soportes y requisitos de la pieza.')].join('\n');}
form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',update);
document.getElementById('calc-reset').addEventListener('click',()=>{form.reset();update();});
document.getElementById('calc-copy').addEventListener('click',async()=>{if(!current)return;try{await navigator.clipboard.writeText(summary());window.VerticeLanguage.setText(document.getElementById('calc-status'),'Resumen copiado.');}catch{window.VerticeLanguage.setText(document.getElementById('calc-status'),'No se pudo copiar. Usa la opción de imprimir.');}});
document.getElementById('calc-print').addEventListener('click',()=>{if(current){document.getElementById('calc-print-summary').textContent=summary();window.print();}});
window.addEventListener('vertice:language',update);update();
})();
(() => {
 const t=text=>window.VerticeLanguage.t(text);
 const get=id=>document.getElementById('request-'+id);
 const value=id=>get(id).value.trim();
 const status=message=>window.VerticeLanguage.setText(get('status'),message);
 document.getElementById('print-request-form').addEventListener('submit',event=>{
   event.preventDefault();if(!event.currentTarget.reportValidity())return;
   const file=get('file').files[0],link=value('link');
   if(!value('name')||!value('contact')||!value('size')||!value('use')){status('Completa los campos obligatorios.');return;}
   if(!file&&!link){status('Incluye un archivo del modelo o un enlace.');return;}
   if(file&&!/\.(stl|step|stp|3mf|obj)$/i.test(file.name)){status('Usa un archivo STL, STEP, STP, 3MF u OBJ.');return;}
   if(link){try{const url=new URL(link);if(!['https:','http:'].includes(url.protocol))throw Error();}catch{status('Revisa el enlace al modelo. Debe comenzar con https:// o http://.');return;}}
   const rows=[
    ['Tu nombre',value('name')],['Correo o usuario de Instagram para responderte',value('contact')],
    ['Archivo del modelo (opcional)',file?file.name:t('No indicado')],['Enlace al modelo (opcional)',link||t('No indicado')],
    ['Cantidad de piezas',value('quantity')],['Medidas deseadas (largo × ancho × alto)',value('size')+' '+value('units')],
    ['Material preferido',value('material')||t('Necesito asesoría')],['Color preferido (opcional)',value('color')||t('No indicado')],
    ['Fecha deseada (opcional)',value('date')||t('No indicado')],['¿Para qué se usará la pieza?',value('use')],
    ['Acabado, resistencia u otros requisitos (opcional)',value('notes')||t('No indicado')]
   ];
   get('summary').value=t('Solicitud de impresión 3D')+' · Vértice 3D\n\n'+rows.map(([label,data])=>t(label)+': '+data).join('\n');
   get('result').hidden=false;
   status('Solicitud preparada. Cópiala y envíala por Instagram junto con tu archivo o enlace.');
 });
 get('copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(get('summary').value);status('Solicitud copiada.');}
  catch{get('summary').focus();get('summary').select();status('Selecciona y copia el resumen manualmente.');}
 });
 document.getElementById('print-request-form').addEventListener('input',()=>{get('result').hidden=true;status('');});
 window.addEventListener('vertice:language',()=>{get('result').hidden=true;status('');});
})();
