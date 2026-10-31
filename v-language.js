(() => {
'use strict';
const english = {"Vértice 3D | Taller de Impresión y Catálogo":"Vértice 3D | Custom 3D Printing & Products in Austin","Inicio":"Home","Catálogo":"Shop","Redes Sociales":"Instagram","Contacto":"Contact","TRANSFORMANDO":"TURNING","IDEAS EN REALIDAD":"IDEAS INTO REALITY","Piezas funcionales, accesorios personalizados y prototipos fabricados en Austin, Texas. Explora nuestro catálogo o cuéntanos qué necesitas para tu próximo proyecto.":"Functional parts, personalized accessories and prototypes made in Austin, Texas. Explore our products or tell us what you need for your next project.","Diseños listos para tu día a día":"Practical Designs for Everyday Life","Destacado":"Featured","Mantén tu termo, teléfono y llaves a mano mientras entrenas. Soporte magnético con anclaje MagSafe.":"Keep your bottle, phone and keys within reach while you work out. A magnetic holder with a MagSafe mount.","Próximamente:":"Coming soon:","Nuevos Productos":"New Products","Impresión 3D de alta calidad en Austin, TX.":"Custom 3D printing in Austin, TX.","Contáctanos para proyectos a medida:":"Have a custom project? Contact us:","DM @vertices3d_tx":"Message @vertices3d_tx","© 2026 Vértice 3D. Todos los derechos reservados.":"© 2026 Vértice 3D. All rights reserved.","Airholder | Vértice 3D":"Airholder Magnetic Bottle Holder | Vértice 3D","Volver al Catálogo":"Back to Shop","Volver":"Back","Selecciona tu color":"Choose Your Color","En el gimnasio":"At the Gym","Negro":"Black","Amarillo":"Yellow","Plateado":"Silver","Rojo":"Red","Rosado":"Pink","Verde militar":"Army Green","Verde":"Green","Organiza lo que necesitas durante el entrenamiento. Airholder se fija a superficies metálicas compatibles para mantener tu termo, teléfono y llaves al alcance. Fabricado mediante impresión 3D, con soporte MagSafe y dimensiones de 15 × 8 cm.":"Keep your workout essentials organized. Airholder attaches to compatible metal surfaces to keep your bottle, phone and keys within reach. Made with 3D printing, featuring a MagSafe mount and dimensions of 15 × 8 cm.","Hazlo tuyo: texto en relieve":"Make It Yours: Raised Lettering","Agrega un nombre o una frase corta. La personalización es opcional.":"Add a name or short phrase. Personalization is optional.","Color seleccionado:":"Selected color:","Selecciona un color":"Choose a color","Selecciona una miniatura para ver el producto en ese color antes de añadirlo al carrito.":"Select a thumbnail to preview the product in that color before adding it to your cart.","Añadir al Carrito":"Add to Cart","Detalles del producto":"Product Details","Anclaje con tres imanes, cubiertos por una lámina de goma azul.":"Three-magnet attachment system covered with a blue rubber layer.","Ensamble con adhesivo 3M 300LSE. La fijación depende de la superficie y de las condiciones de uso.":"Assembled with 3M 300LSE adhesive. Attachment depends on the surface and conditions of use.","Clip inferior para mantener las llaves junto a tus accesorios.":"Lower clip keeps your keys with your workout essentials.","Abrir carrito":"Open cart","Colores del Airholder":"Airholder colors","Demostración del anclaje magnético y MagSafe":"Magnetic attachment and MagSafe demonstration","Airholder azul sujeto magnéticamente a una máquina de gimnasio con soporte MagSafe":"Blue Airholder attached to gym equipment with a MagSafe mount","Ej. Emilio, Vértice3D...":"e.g. Alex, Vértice3D...","Fondo Taller":"Workshop background","Taller Vértice 3D":"Vértice 3D workshop","Abrir menú":"Open menu","Cerrar menú":"Close menu","Tu carrito":"Your Cart","Cerrar carrito":"Close cart","Tu carrito está vacío. Elige un color de Airholder para empezar.":"Your cart is empty. Choose an Airholder color to get started.","Subtotal":"Subtotal","Importes en USD. Envío e impuestos pendientes de confirmar.":"Prices in USD. Shipping and taxes will be confirmed separately.","El pago en línea todavía no está habilitado.":"Online checkout is not available yet.","No se pudo guardar el carrito en este navegador. Se conservará mientras esta página siga abierta.":"Your cart could not be saved in this browser. It will remain available while this page is open.","Seguir viendo productos":"Continue Shopping","Sin personalización":"No personalization","Texto: ":"Text: ","Eliminar":"Remove","Abrir carrito: ":"Open cart: "," artículos":" items","Reducir cantidad de Airholder ":"Decrease quantity of Airholder ","Aumentar cantidad de Airholder ":"Increase quantity of Airholder ","Eliminar Airholder ":"Remove Airholder ","Selecciona el color que deseas en las fotos del producto.":"Choose your preferred color from the product photos.","Impresión 3D a medida, accesorios funcionales y prototipos en Austin, TX. Explora Airholder y los productos de Vértice 3D.":"Custom 3D printing, functional accessories and prototypes in Austin, TX. Discover Airholder and Vértice 3D products.","Airholder: soporte magnético para termo, teléfono y llaves. Elige tu color y personaliza tu accesorio de gimnasio en Vértice 3D.":"Airholder: a magnetic holder for your bottle, phone and keys. Choose a color and personalize your gym accessory at Vértice 3D.","Airholder Negro":"Airholder Black","Airholder en color Negro":"Airholder in Black","Airholder Amarillo":"Airholder Yellow","Airholder en color Amarillo":"Airholder in Yellow","Airholder Plateado":"Airholder Silver","Airholder en color Plateado":"Airholder in Silver","Airholder Rojo":"Airholder Red","Airholder en color Rojo":"Airholder in Red","Airholder Rosado":"Airholder Pink","Airholder en color Rosado":"Airholder in Pink","Airholder Verde militar":"Airholder Army Green","Airholder en color Verde militar":"Airholder in Army Green","Airholder Verde":"Airholder Green","Airholder en color Verde":"Airholder in Green"};
let language = 'es';
const KEY = 'vertice-language';
const originals = new WeakMap(), attributes = new WeakMap();
const t = text => language === 'en' ? (english[text] || text) : text;
function apply(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while(walker.nextNode()) {
    const node = walker.currentNode;
    if(node.parentElement.closest('script,style,[data-language-control],.cart-row,[data-cart-count]')) continue;
    const source = originals.get(node) || node.nodeValue;
    originals.set(node,source);
    const key = source.trim().replace(/\s+/g,' ');
    if(Object.prototype.hasOwnProperty.call(english,key)) node.nodeValue = source.replace(/\S[\s\S]*\S|\S/,()=>t(key));
  }
  root.querySelectorAll('[placeholder],[alt],[aria-label]').forEach(element=>{
    if(element.closest('[data-language-control],.cart-row,[data-open-cart],#main-image')) return;
    let values = attributes.get(element);
    if(!values){values={};attributes.set(element,values);}
    ['placeholder','alt','aria-label'].forEach(attr=>{
      const source = values[attr] || element.getAttribute(attr);
      if(source){values[attr]=source;element.setAttribute(attr,t(source));}
    });
  });
}
const title = document.title;
const meta = document.querySelector('meta[name="description"]');
const description = meta ? meta.content : '';
function setText(element,text) {element.textContent=text;apply(element);}
function setLanguage(value) {
  language = value === 'en' ? 'en' : 'es';
  document.documentElement.lang=language;document.title=t(title);
  if(meta)meta.content=t(description);
  apply();
  document.getElementById('v-language').value=language;
  document.querySelector('label[for="v-language"]').textContent=language==='en'?'Language':'Idioma';
  try{localStorage.setItem(KEY,language);}catch{}
  window.dispatchEvent(new Event('vertice:language'));
}
window.VerticeLanguage={t,apply,setText,setLanguage,get language(){return language;}};
document.getElementById('v-language').addEventListener('change',event=>setLanguage(event.target.value));
let saved;
try{saved=localStorage.getItem(KEY);}catch{}
setLanguage(saved || ((navigator.language || 'es').toLowerCase().startsWith('es')?'es':'en'));
})();