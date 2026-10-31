function calculatePrint(v) {
for(const value of Object.values(v))if(typeof value!=='number'||!Number.isFinite(value)||value<0)throw Error('invalid');
if(v.spoolWeight<=0||v.quantity<1||!Number.isInteger(v.quantity)||v.discount>100||v.minutes>=60||v.failureRate>99)throw Error('invalid');
const hours=v.hours+v.minutes/60,material=v.grams/v.spoolWeight*v.spoolPrice,markup=material*v.markup/100,energy=hours*v.watts/1000*v.kwh,labor=v.prep/60*v.prepRate+v.finish/60*v.finishRate,machine=hours*v.reserveRate;
const failure=(material+energy+machine)*v.failureRate/100,unit=material+energy+labor+machine+v.extras+failure,production=unit*v.quantity,profit=unit*v.profitRate/100,base=(unit+markup+profit)*v.quantity,discount=base*v.discount/100;
const minimumTopup=unit>0?Math.max(0,v.minimum-(base-discount)):0,rush=(base-discount+minimumTopup)*v.rush/100,subtotal=base-discount+minimumTopup+rush,tax=subtotal*v.tax/100;
return {hours,material,markup,energy,labor,machine,failure,extras:v.extras,unit,production,profit,base,discount,minimumTopup,rush,subtotal,tax,total:subtotal+tax,quantity:v.quantity};
}
function parseGcode(text) {
  const result={};
  let match=text.match(/^;\s*TIME:\s*([\d.]+)/mi);
  if(match) result.seconds=Number(match[1]);
  if(result.seconds===undefined) {
    match=text.match(/^;\s*(?:estimated printing time[^=]*=|model printing time\s*:)\s*([^;\r\n]+)/mi);
    if(match) {
      let seconds=0, found=false;
      const factors={d:86400,h:3600,m:60,s:1};
      for(const part of match[1].matchAll(/([\d.]+)\s*([dhms])/gi)){seconds+=Number(part[1])*factors[part[2].toLowerCase()];found=true;}
      if(found)result.seconds=seconds;
    }
  }
  match=text.match(/^;\s*(?:total filament (?:used )?\[g\]|filament used \[g\]|filament weight(?:\s*\[g\])?)\s*[:=]\s*([\d.,\s]+)/mi);
  if(match) result.grams=match[1].split(',').reduce((sum,x)=>sum+Number(x.trim()||0),0);
  return result;
}
(() => {
'use strict';
const form=document.getElementById('print-form');
const t=text=>window.VerticeLanguage ? window.VerticeLanguage.t(text):text;
const money=value=>new Intl.NumberFormat(document.documentElement.lang==='en'?'en-US':'es-US',{style:'currency',currency:'USD'}).format(value);
let current=null;
function number(id){const field=document.getElementById(id);return field.value===''?NaN:Number(field.value);}
const keys=['hours','minutes','grams','spoolPrice','spoolWeight','markup','watts','kwh','prep','prepRate','finish','finishRate','reserveRate','failureRate','profitRate','minimum','quantity','discount','tax'];
function values(){
  const v=Object.fromEntries(keys.map(key=>[key,number('calc-'+key)]));
  v.rush=document.getElementById('calc-urgent').checked?number('calc-rush'):0;
  const costs=[...document.querySelectorAll('[data-extra-cost]')].map(input=>input.value===''?NaN:Number(input.value));
  if(costs.some(x=>!Number.isFinite(x)||x<0))throw Error('invalid');
  v.extras=costs.reduce((sum,x)=>sum+x,0);return v;
}
function update(){
  try{
    if(!form.checkValidity())throw Error('invalid');
    current=calculatePrint(values());
    for(const [key,value]of Object.entries(current)){const el=document.getElementById('out-'+key);if(el)el.textContent=key==='quantity'?String(value):money(key==='discount'?-value:value);}
    document.getElementById('calc-error').hidden=true;
    document.getElementById('calc-copy').disabled=false;document.getElementById('calc-print').disabled=false;
  }catch{
    current=null;document.querySelectorAll('[id^="out-"]').forEach(el=>el.textContent='—');
    document.getElementById('calc-error').hidden=false;
    document.getElementById('calc-copy').disabled=true;document.getElementById('calc-print').disabled=true;
  }
}
function summary(){
 const title=document.getElementById('calc-job').value.trim()||t('Proyecto de impresión 3D');
 const rows=[['Filamento',current.material],['Recargo de material',current.markup],['Electricidad',current.energy],['Mano de obra',current.labor],['Máquina y mantenimiento',current.machine],['Otros costos',current.extras],['Costo de producción por pieza',current.unit],['Costo de producción del pedido',current.production],['Reserva por fallos (por pieza)',current.failure],['Recargo de ganancia (por pieza)',current.profit],['Total antes de ajustes',current.base],['Descuento',-current.discount],['Ajuste por mínimo de pedido',current.minimumTopup],['Urgencia',current.rush],['Subtotal',current.subtotal],['Impuesto',current.tax],['Precio total',current.total]];
 return ['Vértice 3D · '+t('Estimación de impresión 3D'),title,
 t('Cliente')+': '+document.getElementById('calc-client').value.trim(),
 t('Referencia')+': '+document.getElementById('calc-reference').value.trim(),
 new Date().toLocaleDateString(document.documentElement.lang==='en'?'en-US':'es-US'),
 t('Material')+': '+document.getElementById('calc-material').value,
 t('Tiempo por pieza')+': '+number('calc-hours')+' h '+number('calc-minutes')+' min',
 t('Peso por pieza (g)')+': '+number('calc-grams'),
 t('Cantidad de piezas')+': '+current.quantity,'',
 ...rows.map(([label,value])=>t(label)+': '+money(value)),'',
 t('Cálculo orientativo en USD. No constituye una cotización confirmada.'),
 document.getElementById('calc-notes').value.trim()].filter(Boolean).join('\n');
}
form.addEventListener('submit',event=>event.preventDefault());
form.addEventListener('input',update);form.addEventListener('change',update);
document.getElementById('calc-urgent').addEventListener('change',event=>{document.getElementById('calc-rush').disabled=!event.target.checked;update();});
document.getElementById('calc-add-extra').addEventListener('click',()=>{
 const row=document.createElement('div');row.className='extra-row';
 const label=document.createElement('input');label.type='text';label.maxLength=100;label.placeholder='Descripción';label.setAttribute('aria-label','Descripción del gasto');
 const cost=document.createElement('input');cost.type='number';cost.min='0';cost.step='0.01';cost.value='0';cost.required=true;cost.dataset.extraCost='';cost.setAttribute('aria-label','Costo por pieza (USD)');
 const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Eliminar gasto');
 remove.addEventListener('click',()=>{row.remove();update();});row.append(label,cost,remove);document.getElementById('calc-extras').append(row);window.VerticeLanguage.apply(row);update();
});
document.getElementById('calc-copy').addEventListener('click',async()=>{
 if(!current)return;
 try{await navigator.clipboard.writeText(summary());window.VerticeLanguage.setText(document.getElementById('calc-status'),'Resumen copiado.');}
 catch{window.VerticeLanguage.setText(document.getElementById('calc-status'),'No se pudo copiar. Usa la opción de imprimir.');}
});
document.getElementById('calc-print').addEventListener('click',()=>{
 if(!current)return;document.getElementById('calc-print-summary').textContent=summary();window.print();
});
document.getElementById('calc-reset').addEventListener('click',()=>{
 form.reset();document.getElementById('calc-extras').replaceChildren();document.getElementById('calc-rush').disabled=true;
 window.VerticeLanguage.setText(document.getElementById('gcode-status'),'');window.VerticeLanguage.setText(document.getElementById('calc-status'),'');update();
});
document.getElementById('calc-file').addEventListener('change',async event=>{
 const file=event.target.files[0];if(!file)return;
 const status=document.getElementById('gcode-status');
 if(!/\.gcode$/i.test(file.name)||file.size>25*1024*1024){window.VerticeLanguage.setText(status,'Selecciona un archivo .gcode de texto de hasta 25 MB.');return;}
 try{
 const text=await file.text();if(text.includes('\u0000'))throw Error('binary');
 const parsed=parseGcode(text);
 if(Number.isFinite(parsed.seconds)&&parsed.seconds>=0){const minutes=Math.ceil(parsed.seconds/60);document.getElementById('calc-hours').value=Math.floor(minutes/60);document.getElementById('calc-minutes').value=minutes%60;}
 if(Number.isFinite(parsed.grams)&&parsed.grams>=0)document.getElementById('calc-grams').value=parsed.grams.toFixed(2);
 window.VerticeLanguage.setText(status,Object.keys(parsed).length?'Datos encontrados. Revisa el tiempo y el peso antes de usar el cálculo.':'No se encontraron tiempo o peso compatibles. Ingresa los datos manualmente.');update();
 }catch{window.VerticeLanguage.setText(status,'No se pudo leer el archivo. Ingresa los datos manualmente.');}
});
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
    ['Tu nombre',value('name')],['Correo o teléfono de contacto',value('contact')],
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

(() => {
 function refreshFileNames() {
  document.querySelectorAll('[data-file-picker]').forEach(button=>{
   const input=document.getElementById(button.dataset.filePicker);
   const label=document.getElementById(input.id+'-name');
   if(input.files.length) label.textContent=input.files[0].name;
   else window.VerticeLanguage.setText(label,'Ningún archivo seleccionado');
  });
 }
 document.querySelectorAll('[data-file-picker]').forEach(button=>{
  const input=document.getElementById(button.dataset.filePicker);
  button.addEventListener('click',()=>input.click());
  input.addEventListener('change',refreshFileNames);
 });
 document.getElementById('print-form').addEventListener('reset',()=>queueMicrotask(refreshFileNames));
 window.addEventListener('vertice:language',refreshFileNames);
 refreshFileNames();
})();
