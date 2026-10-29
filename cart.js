(() => {
'use strict';
const KEY = 'vertice-cart-v1';
const money = value => new Intl.NumberFormat('es-US', {style:'currency', currency:'USD'}).format(value);
const read = () => {
    try {
        const data = JSON.parse(localStorage.getItem(KEY) || '[]');
        return Array.isArray(data) ? data.filter(item => item && item.product === 'airholder' && ['Negro','Amarillo','Plateado','Rojo','Rosado','Verde militar','Verde'].includes(item.color) && typeof item.custom === 'string' && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99).map(item => ({...item, price:35})) : [];
    } catch { return []; }
};
let items = read();
function render() {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = String(count));
    document.querySelectorAll('[data-open-cart]').forEach(el => el.setAttribute('aria-label', 'Abrir carrito: ' + count + ' artículos'));
    const list = document.getElementById('cart-items');
    if (!list) return;
    list.replaceChildren();
    document.getElementById('cart-empty').hidden = items.length > 0;
    items.forEach((item, index) => {
        const row = document.createElement('li');
        row.className = 'cart-row';
        const image = document.createElement('img');
        const images = {'Negro':'negro','Amarillo':'amarillo','Plateado':'plateado','Rojo':'rojo','Rosado':'rosado','Verde militar':'verde-militar','Verde':'verde'};
        image.src = 'airholder-' + images[item.color] + '.webp';
        image.alt = 'Airholder ' + item.color;
        const info = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = 'Airholder · ' + item.color;
        const custom = document.createElement('p');
        custom.textContent = item.custom ? 'Texto: ' + item.custom : 'Sin personalización';
        const price = document.createElement('p');
        price.textContent = money(35 * item.quantity);
        const controls = document.createElement('div');
        controls.className = 'cart-controls';
        const button = (label, text, action) => {
            const el = document.createElement('button');
            el.type = 'button'; el.textContent = text; el.setAttribute('aria-label', label);
            el.addEventListener('click', action); return el;
        };
        controls.append(button('Reducir cantidad de Airholder ' + item.color, '−', () => change(index,-1)));
        const qty = document.createElement('span'); qty.textContent = String(item.quantity);
        controls.append(qty, button('Aumentar cantidad de Airholder ' + item.color, '+', () => change(index,1)), button('Eliminar Airholder ' + item.color, 'Eliminar', () => remove(index)));
        info.append(title, custom, price, controls); row.append(image, info); list.append(row);
    });
    document.getElementById('cart-total').textContent = money(items.reduce((sum,item) => sum + 35 * item.quantity,0));
}
function save() {
    let stored = true;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { stored = false; }
    render();
    const message = document.getElementById('cart-storage');
    if (message) message.hidden = stored;
}
function change(index, amount) {
    if (!items[index]) return;
    items[index].quantity = Math.min(99, items[index].quantity + amount);
    if (items[index].quantity <= 0) items.splice(index,1);
    save();
}
function remove(index) { items.splice(index,1); save(); }
function open() { const dialog = document.getElementById('cart-dialog'); if (dialog && !dialog.open) dialog.showModal(); }
function add(color, custom) {
    const colors = ['Negro','Amarillo','Plateado','Rojo','Rosado','Verde militar','Verde'];
    if (!colors.includes(color)) return false;
    custom = String(custom || '').trim().slice(0,80);
    const existing = items.find(item => item.color === color && item.custom === custom);
    if (existing) existing.quantity = Math.min(99,existing.quantity+1);
    else items.push({product:'airholder',color,custom,price:35,quantity:1});
    save(); open(); return true;
}
window.VerticeCart = {add, change, remove, items:() => items.map(item=>({...item}))};
function init() {
    const style = document.createElement('style');
    style.textContent = `
    .cart-trigger{position:relative;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:44px;height:44px;color:#242424;background:transparent;border:0;cursor:pointer}
    .cart-trigger svg{width:25px;height:25px}.cart-badge{position:absolute;right:0;top:0;min-width:19px;height:19px;border-radius:99px;background:#ff5a00;color:white;font-size:11px;font-weight:700;line-height:19px}
    #cart-dialog{width:min(94vw,480px);max-height:85dvh;border:0;border-radius:14px;padding:20px;color:#242424;background:white;margin:auto;overflow:auto}
    #cart-dialog::backdrop{background:rgba(0,0,0,.55)}
    .cart-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.cart-heading h2{font-size:20px;font-weight:800}.cart-heading button{min-width:44px;min-height:44px;font-size:24px}
    .cart-row{display:flex;gap:12px;padding:16px 0;border-bottom:1px solid #eee}.cart-row img{width:68px;height:80px;object-fit:contain;flex-shrink:0}.cart-row>div{min-width:0;overflow-wrap:anywhere}.cart-row strong{font-size:14px}.cart-row p{font-size:13px;margin:5px 0}
    .cart-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.cart-controls button{min-width:44px;min-height:44px;border:1px solid #ddd;border-radius:6px;padding:4px 10px;font-size:13px}.cart-controls span{min-width:20px;text-align:center}
    .cart-summary{display:flex;justify-content:space-between;font-weight:700;padding-top:18px}.cart-note{font-size:12px;color:#666;margin-top:12px}.cart-continue{display:block;width:100%;min-height:44px;margin-top:16px;background:#ff5a00;border-radius:6px;color:white;font-weight:700}
    @media(max-width:767px){header img{max-width:180px!important}#cart-dialog{padding:16px}}
    `;
    document.head.append(style);
    const dialog = document.createElement('dialog');
    dialog.id = 'cart-dialog'; dialog.setAttribute('aria-labelledby','cart-title');
    dialog.innerHTML = '<div class="cart-heading"><h2 id="cart-title">Tu carrito</h2><button type="button" id="cart-close" aria-label="Cerrar carrito">×</button></div><p id="cart-empty">Tu carrito está vacío. Elige un color de Airholder para empezar.</p><ul id="cart-items"></ul><div class="cart-summary"><span>Subtotal</span><span id="cart-total"></span></div><p class="cart-note">Importes en USD. Envío e impuestos pendientes de confirmar.</p><p class="cart-note">El pago en línea todavía no está habilitado.</p><p id="cart-storage" class="cart-note" hidden>No se pudo guardar el carrito en este navegador. Se conservará mientras esta página siga abierta.</p><button type="button" id="cart-continue" class="cart-continue">Seguir viendo productos</button>';
    document.body.append(dialog);
    const close = () => dialog.close();
    document.getElementById('cart-close').addEventListener('click',close);
    document.getElementById('cart-continue').addEventListener('click',close);
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
    document.querySelectorAll('[data-open-cart]').forEach(el=>el.addEventListener('click',open));
    window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){items=read();render();}});
    render();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
else init();
})();