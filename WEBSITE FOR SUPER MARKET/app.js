// ===== PRODUCTS DATA =====
const products = [
  {id:1,name:"Red Apples",category:"fruits",emoji:"🍎",price:120,original:150,unit:"1 kg",badge:"Fresh",organic:true},
  {id:2,name:"Bananas",category:"fruits",emoji:"🍌",price:40,original:50,unit:"500 g",badge:"",organic:true},
  {id:3,name:"Mangoes",category:"fruits",emoji:"🥭",price:180,original:220,unit:"1 kg",badge:"Sale",organic:false},
  {id:4,name:"Oranges",category:"fruits",emoji:"🍊",price:90,original:110,unit:"1 kg",badge:"Fresh",organic:true},
  {id:5,name:"Grapes",category:"fruits",emoji:"🍇",price:140,original:160,unit:"500 g",badge:"",organic:false},
  {id:6,name:"Watermelon",category:"fruits",emoji:"🍉",price:80,original:100,unit:"1 pc",badge:"Sale",organic:false},
  {id:7,name:"Broccoli",category:"vegetables",emoji:"🥦",price:60,original:80,unit:"500 g",badge:"Organic",organic:true},
  {id:8,name:"Carrots",category:"vegetables",emoji:"🥕",price:35,original:45,unit:"500 g",badge:"",organic:true},
  {id:9,name:"Tomatoes",category:"vegetables",emoji:"🍅",price:30,original:40,unit:"500 g",badge:"Fresh",organic:true},
  {id:10,name:"Bell Peppers",category:"vegetables",emoji:"🫑",price:70,original:90,unit:"3 pcs",badge:"",organic:false},
  {id:11,name:"Spinach",category:"vegetables",emoji:"🥬",price:25,original:35,unit:"250 g",badge:"Organic",organic:true},
  {id:12,name:"Potatoes",category:"vegetables",emoji:"🥔",price:30,original:40,unit:"1 kg",badge:"",organic:false},
  {id:13,name:"Full Cream Milk",category:"dairy",emoji:"🥛",price:78,original:95,unit:"2 L",badge:"Sale",organic:false},
  {id:14,name:"Cheddar Cheese",category:"dairy",emoji:"🧀",price:220,original:260,unit:"200 g",badge:"",organic:false},
  {id:15,name:"Farm Eggs",category:"dairy",emoji:"🥚",price:90,original:110,unit:"12 pcs",badge:"Fresh",organic:true},
  {id:16,name:"Greek Yogurt",category:"dairy",emoji:"🍦",price:65,original:80,unit:"400 g",badge:"",organic:false},
  {id:17,name:"Butter",category:"dairy",emoji:"🧈",price:55,original:65,unit:"100 g",badge:"",organic:false},
  {id:18,name:"Sourdough Loaf",category:"bakery",emoji:"🍞",price:120,original:145,unit:"1 loaf",badge:"Fresh",organic:false},
  {id:19,name:"Croissants",category:"bakery",emoji:"🥐",price:80,original:95,unit:"4 pcs",badge:"",organic:false},
  {id:20,name:"Muffins",category:"bakery",emoji:"🧁",price:60,original:75,unit:"2 pcs",badge:"",organic:false},
  {id:21,name:"Whole Wheat Bread",category:"bakery",emoji:"🥖",price:55,original:70,unit:"400 g",badge:"Organic",organic:true},
  {id:22,name:"Fruit Juice",category:"beverages",emoji:"🧃",price:65,original:80,unit:"1 L",badge:"",organic:false},
  {id:23,name:"Sparkling Water",category:"beverages",emoji:"💧",price:30,original:40,unit:"500 ml",badge:"",organic:false},
  {id:24,name:"Green Tea",category:"beverages",emoji:"🍵",price:120,original:150,unit:"25 bags",badge:"Organic",organic:true},
  {id:25,name:"Energy Drink",category:"beverages",emoji:"⚡",price:90,original:110,unit:"250 ml",badge:"",organic:false},
  {id:26,name:"Cold Coffee",category:"beverages",emoji:"☕",price:75,original:90,unit:"200 ml",badge:"",organic:false},
];

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('sa7cart') || '[]');
let currentCategory = 'all';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(products);
  updateCartUI();
  syncProductGridStates();
  startCountdown();
  initScrollEffects();
});

// ===== RENDER PRODUCTS =====
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  const noRes = document.getElementById('noResults');
  if (!list.length) { grid.innerHTML=''; noRes.style.display='block'; return; }
  noRes.style.display = 'none';
  grid.innerHTML = list.map(p => {
    const cartItem = cart.find(item => String(item.id) === String(p.id));
    const inCart = !!cartItem;
    const qty = inCart ? cartItem.qty : 0;
    return `
      <div class="product-card ${inCart ? 'in-cart' : ''}" id="prod-${p.id}" onclick="openProductModal(${p.id})" style="cursor: pointer;">
        <div class="product-img-wrap">
          <div class="product-emoji">${p.emoji}</div>
          ${p.badge ? `<span class="product-badge ${p.organic?'organic':''}">${p.organic?'Organic':p.badge}</span>` : ''}
          ${inCart ? `<span class="product-badge added-tag">Added to Cart</span>` : ''}
          <button class="product-fav" onclick="toggleFav(this, event)" aria-label="Favourite">🤍</button>
        </div>
        <div class="product-body">
          <div class="product-category">${p.category}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-unit">${p.unit}</div>
          <div class="product-footer">
            <div>
              <span class="product-price">₹${p.price}</span>
              ${p.original > p.price ? `<span class="product-original">₹${p.original}</span>` : ''}
            </div>
            <div class="add-btn-wrapper" onclick="event.stopPropagation();">
              ${inCart ? `
                <div class="card-qty-controls" id="controls-${p.id}">
                  <button class="qty-btn" onclick="changeQty('${p.id}', -1)">−</button>
                  <span class="qty-num">${qty}</span>
                  <button class="qty-btn" onclick="changeQty('${p.id}', 1)">+</button>
                </div>
              ` : `
                <button class="add-btn" onclick="addToCart(${p.id}, event)" id="add-${p.id}">+ Add</button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== FILTER BY CATEGORY =====
function filterByCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  const chip = document.getElementById('chip-' + cat);
  if (chip) chip.classList.add('active');
  const search = document.getElementById('searchInput').value.toLowerCase();
  let filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
  renderProducts(filtered);
  document.getElementById('products').scrollIntoView({behavior:'smooth'});
}

// ===== FILTER BY SEARCH =====
function filterProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  let filtered = currentCategory === 'all' ? products : products.filter(p => p.category === currentCategory);
  if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
  renderProducts(filtered);
}

// ===== SORT PRODUCTS =====
function sortProducts() {
  const val = document.getElementById('sortSelect').value;
  let filtered = currentCategory === 'all' ? [...products] : products.filter(p => p.category === currentCategory);
  const q = document.getElementById('searchInput').value.toLowerCase();
  if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
  if (val === 'priceLow') filtered.sort((a,b)=>a.price-b.price);
  else if (val === 'priceHigh') filtered.sort((a,b)=>b.price-a.price);
  else if (val === 'name') filtered.sort((a,b)=>a.name.localeCompare(b.name));
  renderProducts(filtered);
}

// ===== ADD TO CART =====
function addToCart(id, event) {
  if (event) event.stopPropagation();

  const p = products.find(x => x.id === id);
  if (!p) return;

  const existing = cart.find(x => String(x.id) === String(id));

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      price: p.price,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();
  syncProductGridStates();

  showToast(`🛒 ${p.name} added to cart!`);
}

function addToCartDeal(name, price, emoji, event) {
  if (event) event.stopPropagation();
  const existing = cart.find(x => x.name === name);
  if (existing) existing.qty++;
  else cart.push({id:'deal-'+name,name,emoji,price,qty:1});
  saveCart();
  updateCartUI();
  syncProductGridStates();
  showToast(`🛒 ${name} added to cart!`);
}

// ===== CART OPERATIONS =====
function updateCartUI() {
  const count = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cartCount').textContent = count;
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');
  if (!cart.length) {
    emptyEl.style.display='block'; footerEl.style.display='none';
    itemsEl.innerHTML=''; itemsEl.appendChild(emptyEl);
  } else {
    emptyEl.style.display='none'; footerEl.style.display='flex';
    const total = cart.reduce((s,i)=>s+(i.price*i.qty),0);
    document.getElementById('cartSubtotal').textContent=`₹${total.toFixed(2)}`;
    document.getElementById('cartTotal').textContent=`₹${total.toFixed(2)}`;
    itemsEl.innerHTML = cart.map(item=>`
      <div class="cart-item" id="ci-${item.id}">
        <div class="cart-item-icon">${item.emoji}</div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>₹${(item.price*item.qty).toFixed(2)}</span>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
          <button class="remove-btn" onclick="removeFromCart('${item.id}')">🗑</button>
        </div>
      </div>
    `).join('');
  }
  syncProductGridStates();
}

function syncProductGridStates() {
  // Sync products grid
  products.forEach(p => {
    const card = document.getElementById(`prod-${p.id}`);
    if (!card) return;
    
    const cartItem = cart.find(item => String(item.id) === String(p.id));
    const inCart = !!cartItem;
    const qty = inCart ? cartItem.qty : 0;
    
    // Toggle in-cart class on card
    card.classList.toggle('in-cart', inCart);
    
    // Update badge
    let badge = card.querySelector('.added-tag');
    if (inCart) {
      if (!badge) {
        const imgWrap = card.querySelector('.product-img-wrap');
        if (imgWrap) {
          badge = document.createElement('span');
          badge.className = 'product-badge added-tag';
          badge.textContent = 'Added to Cart';
          imgWrap.appendChild(badge);
        }
      }
    } else {
      if (badge) badge.remove();
    }
    
    // Update controls wrapper
    const wrapper = card.querySelector('.add-btn-wrapper');
    if (wrapper) {
      if (inCart) {
        wrapper.innerHTML = `
          <div class="card-qty-controls" id="controls-${p.id}">
            <button class="qty-btn" onclick="changeQty('${p.id}', -1)">−</button>
            <span class="qty-num">${qty}</span>
            <button class="qty-btn" onclick="changeQty('${p.id}', 1)">+</button>
          </div>
        `;
      } else {
        wrapper.innerHTML = `
          <button class="add-btn" onclick="addToCart(${p.id}, event)" id="add-${p.id}">+ Add</button>
        `;
      }
    }
  });

  // Sync deal buttons (if present in DOM)
  const dealButtons = [
    { id: 'deal1Btn', name: 'Premium Apple Box' },
    { id: 'deal2Btn', name: 'Full Cream Milk' },
    { id: 'deal3Btn', name: 'Artisan Sourdough' }
  ];
  
  dealButtons.forEach(deal => {
    const btn = document.getElementById(deal.id);
    if (btn) {
      const inCart = cart.some(item => item.name === deal.name);
      btn.classList.toggle('added', inCart);
      btn.textContent = inCart ? '✓ Added to Cart' : 'Add to Cart';
    }
  });
}

function changeQty(id, delta) {
  const item = cart.find(
    x => String(x.id) === String(id)
  );

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter(
      x => String(x.id) !== String(id)
    );
  }

  saveCart();
  updateCartUI();
  syncProductGridStates();
}

function removeFromCart(id) {
  cart = cart.filter(
    x => String(x.id) !== String(id)
  );

  saveCart();
  updateCartUI();
  syncProductGridStates();
}

function clearCart() {
  cart = [];

  saveCart();
  updateCartUI();
  syncProductGridStates();

  showToast('🧹 Cart cleared');
}

function saveCart() {
  localStorage.setItem('sa7cart', JSON.stringify(cart));
}

function toggleCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  drawer.classList.toggle('open');
  overlay.classList.toggle('open');
}

function checkout() {
  if (!cart.length) return;
  showToast('✅ Order placed! Thank you for shopping at Sa7!');
  cart = [];
  saveCart();
  updateCartUI();
  syncProductGridStates();
  toggleCart();
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2500);
}

// ===== FAVOURITE =====
function toggleFav(btn, event) {
  if (event) event.stopPropagation();
  btn.textContent = btn.textContent === '🤍' ? '❤️' : '🤍';
}

// ===== MODALS =====
function openModal(title, text) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = `<p style="white-space: pre-wrap; line-height: 1.6;">${text}</p>`;
  document.getElementById('mainModalOverlay').classList.add('open');
  document.getElementById('mainModal').classList.add('open');
}

function closeModal() {
  document.getElementById('mainModalOverlay').classList.remove('open');
  document.getElementById('mainModal').classList.remove('open');
}

function openProductModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const inCart = cart.some(item => String(item.id) === String(p.id));
  
  const content = `
    <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px;">
      <div style="font-size: 4rem; width: 100px; height: 100px; background: #f8fdf9; border-radius: 16px; display: flex; align-items: center; justify-content: center;">${p.emoji}</div>
      <div>
        <div style="color: #27ae60; font-weight: 600; font-size: 0.85rem; text-transform: uppercase;">${p.category}</div>
        <h3 style="font-size: 1.5rem; margin: 4px 0;">${p.name}</h3>
        <div style="color: #6b7c6b;">Quantity: ${p.unit}</div>
      </div>
    </div>
    <div style="margin-bottom: 20px;">
      <p style="color: #6b7c6b; line-height: 1.6;">Experience the best quality <strong>${p.name}</strong> sourced specially for you. ${p.organic ? 'This is a certified organic product.' : 'Fresh and delicious!'}</p>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e0ede0; padding-top: 20px;">
      <div>
        <span style="font-size: 1.5rem; font-weight: 800; color: #27ae60;">₹${p.price}</span>
        ${p.original > p.price ? `<span style="text-decoration: line-through; color: #6b7c6b; margin-left: 8px;">₹${p.original}</span>` : ''}
      </div>
      <button style="background: ${inCart ? '#f0faf4' : '#27ae60'}; color: ${inCart ? '#27ae60' : '#fff'}; border: ${inCart ? '1.5px solid #27ae60' : 'none'}; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer;" onclick="addToCart(${p.id}); closeModal();">${inCart ? '✓ Added to Cart' : 'Add to Cart'}</button>
    </div>
  `;
  
  document.getElementById('modalTitle').textContent = 'Product Details';
  document.getElementById('modalBody').innerHTML = content;
  document.getElementById('mainModalOverlay').classList.add('open');
  document.getElementById('mainModal').classList.add('open');
}

// ===== COUNTDOWN =====
function startCountdown() {
  let end = new Date(); end.setHours(end.getHours()+8,end.getMinutes()+34,end.getSeconds()+59);
  setInterval(()=>{
    const diff = end - new Date();
    if (diff<=0) { end = new Date(); end.setHours(end.getHours()+8); }
    const h=Math.floor(diff/3600000), m=Math.floor((diff%3600000)/60000), s=Math.floor((diff%60000)/1000);
    const hEl=document.getElementById('hours'), mEl=document.getElementById('minutes'), sEl=document.getElementById('seconds');
    if(hEl) hEl.textContent=String(h).padStart(2,'0');
    if(mEl) mEl.textContent=String(m).padStart(2,'0');
    if(sEl) sEl.textContent=String(s).padStart(2,'0');
  },1000);
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
  const navbar = document.getElementById('navbar');
  const scrollTop = document.getElementById('scrollTop');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = ['home','categories','deals','products','contact'];
  window.addEventListener('scroll',()=>{
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 50);
    scrollTop.classList.toggle('visible', y > 400);
    sections.forEach(id=>{
      const el=document.getElementById(id);
      if(!el) return;
      const top=el.offsetTop-100, bot=top+el.offsetHeight;
      const link=document.querySelector(`.nav-link[href="#${id}"]`);
      if(link) link.classList.toggle('active', y>=top && y<bot);
    });
  });
}

// ===== MOBILE MENU =====
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ===== NEWSLETTER =====
function subscribeNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  showToast(`🎉 Subscribed! Welcome aboard, ${email.split('@')[0]}!`);
  e.target.reset();
}
