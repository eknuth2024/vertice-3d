function calculatePrint(v) {
  const required = ['spoolWeight','years','dailyHours','quantity'];
  for (const [key,value] of Object.entries(v)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error('invalid');
  }
  if(required.some(key=>v[key]<=0)||!Number.isInteger(v.quantity)||v.discount>100||v.dailyHours>24||v.minutes>=60) throw new Error('invalid');
  const hours = v.hours + v.minutes/60;
  const material = v.grams / v.spoolWeight * v.spoolPrice;
  const markup = material * v.markup/100;
  const energy = hours * v.watts/1000 * v.kwh;
  const labor = v.prep/60*v.prepRate + v.finish/60*v.finishRate;
  const machine = hours * v.machinePrice*(1+v.repair/100)/(v.years*365*v.dailyHours);
  const unit = material+markup+energy+labor+machine+v.extras;
  const base = unit*v.quantity;
  const discount = base*v.discount/100;
  const rush = (base-discount)*v.rush/100;
  const subtotal = base-discount+rush;
  const tax = subtotal*v.tax/100;
  return {hours,material,markup,energy,labor,machine,extras:v.extras,unit,base,discount,rush,subtotal,tax,total:subtotal+tax,quantity:v.quantity};
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
const keys=['hours','minutes','grams','spoolPrice','spoolWeight','markup','watts','kwh','prep','prepRate','finish','finishRate','machinePrice','years','dailyHours','repair','quantity','discount','tax'];
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
 const rows=[['Filamento',current.material],['Recargo de material',current.markup],['Electricidad',current.energy],['Mano de obra',current.labor],['Máquina y mantenimiento',current.machine],['Otros costos',current.extras],['Precio por pieza',current.unit],['Total antes de ajustes',current.base],['Descuento',-current.discount],['Urgencia',current.rush],['Subtotal',current.subtotal],['Impuesto',current.tax],['Precio total',current.total]];
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