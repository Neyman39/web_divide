let adminState = {
  user: null,
  switchesCache: null,
  activeTab: 'orders',
  loaded: { orders: false, switches: false, keyboards: false },
  existingGalleryUrls: [],
};

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSwitchType(type) {
  return type || '—';
}

function formatForce(value) {
  return value == null ? '—' : `${value} g`;
}

function invalidateProductCaches() {
  if (window.ProductCatalogCache) ProductCatalogCache.invalidate();
  if (window.ProductPageCache) ProductPageCache.invalidateAll();
}

function renderOrdersHtml(orders, containerId) {
  const container = document.getElementById(containerId);

  if (!orders?.length) {
    container.innerHTML = '<div class="empty-orders">Заказов пока нет.</div>';
    return;
  }

  let html = '';
  orders.forEach((order) => {
    html += `
      <div class="order-card">
        <div class="order-card__header">
          <strong>Заказ №${order.id}</strong>
          <span>${formatDate(order.created_at)}</span>
          <span>Статус: <em>${getStatusText(order.status)}</em></span>
        </div>
        <table class="admin-table">
          <tr><th>Товар</th><th>Переключатель</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr>`;
    order.items?.forEach((item) => {
      const unit = Number(item.unit_price);
      html += `
        <tr>
          <td>${escapeHtml(item.product_name || 'Товар')}</td>
          <td>${escapeHtml(item.switch_name || '—')}</td>
          <td>${item.quantity}</td>
          <td>${formatPriceRub(unit)}</td>
          <td>${formatPriceRub(unit * item.quantity)}</td>
        </tr>`;
    });
    html += `
        </table>
        <div class="order-card__total">Итого: ${formatPriceRub(order.total)}</div>
      </div>`;
  });
  container.innerHTML = html;
}

async function loadUserOrders(userId, containerId = 'ordersSection') {
  const container = document.getElementById(containerId);
  container.innerHTML = '<div class="empty-orders">Загрузка заказов…</div>';

  try {
    const response = await fetch(`/api/orders?userId=${userId}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Ошибка загрузки заказов');
    const orders = await response.json();
    renderOrdersHtml(orders, containerId);
  } catch (err) {
    container.innerHTML = `<div class="empty-orders">Ошибка: ${escapeHtml(err.message)}</div>`;
  }
}

async function fetchAdminSwitches() {
  if (adminState.switchesCache) return adminState.switchesCache;

  const response = await fetch('/api/admin/switches', { credentials: 'include' });
  if (!response.ok) throw new Error('Не удалось загрузить свитчи');
  const { data } = await response.json();
  adminState.switchesCache = data || [];
  return adminState.switchesCache;
}

async function loadAdminSwitches() {
  const container = document.getElementById('switchesSection');
  container.innerHTML = '<div class="empty-orders">Загрузка свитчей…</div>';

  try {
    const switches = await fetchAdminSwitches();

    if (!switches.length) {
      container.innerHTML = '<div class="empty-orders">Свитчи пока не добавлены.</div>';
      return;
    }

    let html = `
      <div class="switches-table-wrap">
        <table class="admin-table switches-table">
          <thead>
            <tr>
              <th>ID</th><th>Фото</th><th>Название</th><th>Тип</th>
              <th>Срабатывание</th><th>До упора</th><th>Тактильность</th>
              <th>Ход</th><th>Цена</th><th>Склад</th><th>Действия</th>
            </tr>
          </thead><tbody>`;

    switches.forEach((sw) => {
      const thumb = sw.image_url
        ? `<img src="${escapeHtml(sw.image_url)}" alt="" class="switch-thumb">`
        : '—';
      html += `
        <tr>
          <td>${sw.id}</td>
          <td>${thumb}</td>
          <td>${escapeHtml(sw.name)}</td>
          <td>${escapeHtml(formatSwitchType(sw.type))}</td>
          <td>${formatForce(sw.actuation_force)}</td>
          <td>${formatForce(sw.bottom_force)}</td>
          <td>${formatForce(sw.tactile_force)}</td>
          <td>${escapeHtml(sw.travel_length)}</td>
          <td>${formatPriceRub(sw.price_per_switch)}</td>
          <td>${sw.stock ?? 0}</td>
          <td class="switches-table__actions">
            <button type="button" class="admin-btn admin-btn--small" data-edit-switch="${sw.id}">Редактировать</button>
            <button type="button" class="admin-btn admin-btn--danger admin-btn--small" data-delete-switch="${sw.id}">Удалить</button>
          </td>
        </tr>`;
    });

    container.innerHTML = html + '</tbody></table></div>';

    container.querySelectorAll('[data-edit-switch]').forEach((btn) => {
      btn.addEventListener('click', () => openSwitchModal(parseInt(btn.dataset.editSwitch, 10)));
    });

    container.querySelectorAll('[data-delete-switch]').forEach((btn) => {
      btn.addEventListener('click', () => deleteSwitch(parseInt(btn.dataset.deleteSwitch, 10)));
    });
    adminState.loaded.switches = true;
  } catch (err) {
    container.innerHTML = `<div class="empty-orders">Ошибка: ${escapeHtml(err.message)}</div>`;
  }
}

async function loadAdminKeyboards() {
  const container = document.getElementById('keyboardsSection');
  container.innerHTML = '<div class="empty-orders">Загрузка клавиатур…</div>';

  try {
    const response = await fetch('/api/admin/products', { credentials: 'include' });
    if (!response.ok) throw new Error('Ошибка загрузки каталога');

    const { data: products } = await response.json();

    if (!products?.length) {
      container.innerHTML = '<div class="empty-orders">Клавиатуры пока не добавлены.</div>';
      return;
    }

    let html = '<div class="keyboard-admin-list">';
    products.forEach((product) => {
      const img = product.img || 'assets/images/default.jpg';
      const priceLabel = formatPriceRub(Number(product.price));
      html += `
        <article class="keyboard-admin-card" data-id="${product.id}">
          <img src="${escapeHtml(img)}" alt="${escapeHtml(product.name)}" class="keyboard-admin-card__img">
          <div class="keyboard-admin-card__body">
            <h3>${escapeHtml(product.name)}</h3>
            <p class="keyboard-admin-card__price">${priceLabel}</p>
          </div>
          <div class="keyboard-admin-card__actions">
            <button type="button" class="admin-btn admin-btn--small" data-edit-keyboard="${product.id}">Редактировать</button>
            <button type="button" class="admin-btn admin-btn--danger admin-btn--small" data-delete-keyboard="${product.id}">Удалить</button>
          </div>
        </article>`;
    });
    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('[data-edit-keyboard]').forEach((btn) => {
      btn.addEventListener('click', () => openKeyboardModal(parseInt(btn.dataset.editKeyboard, 10)));
    });

    container.querySelectorAll('[data-delete-keyboard]').forEach((btn) => {
      btn.addEventListener('click', () => deleteKeyboard(parseInt(btn.dataset.deleteKeyboard, 10)));
    });

    adminState.loaded.keyboards = true;
  } catch (err) {
    container.innerHTML = `<div class="empty-orders">Ошибка: ${escapeHtml(err.message)}</div>`;
  }
}

async function deleteKeyboard(productId) {
  if (!confirm('Удалить эту клавиатуру?')) return;

  try {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка удаления');

    invalidateProductCaches();
    adminState.loaded.keyboards = false;
    await loadAdminKeyboards();
    alert('Клавиатура удалена');
  } catch (err) {
    alert(err.message);
  }
}

function switchAdminTab(tabName) {
  adminState.activeTab = tabName;

  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.classList.toggle('admin-tab--active', tab.dataset.tab === tabName);
  });

  document.querySelectorAll('.admin-panel').forEach((panel) => {
    panel.classList.toggle('admin-panel--active', panel.dataset.panel === tabName);
  });

  document.getElementById('addSwitchBtn').style.display = tabName === 'switches' ? '' : 'none';
  document.getElementById('addKeyboardBtn').style.display = tabName === 'keyboards' ? '' : 'none';

  if (tabName === 'orders' && !adminState.loaded.orders) {
    loadUserOrders(adminState.user.id, 'adminOrdersSection');
    adminState.loaded.orders = true;
  }
  if (tabName === 'switches' && !adminState.loaded.switches) loadAdminSwitches();
  if (tabName === 'keyboards' && !adminState.loaded.keyboards) loadAdminKeyboards();
}

function setupAdminTabs(user) {
  document.getElementById('userOrdersSection').style.display = 'none';
  document.getElementById('adminPanel').style.display = '';

  document.querySelectorAll('.admin-only').forEach((el) => {
    if (el.id !== 'addSwitchModal' && el.id !== 'keyboardModal') {
      el.style.display = '';
    }
  });

  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => switchAdminTab(tab.dataset.tab));
  });

  switchAdminTab('orders');
}

function showSwitchImagePreview(url) {
  const preview = document.getElementById('switchImagePreview');
  const img = document.getElementById('switchImagePreviewImg');

  if (!url) {
    preview.hidden = true;
    img.src = '';
    return;
  }

  img.src = url;
  preview.hidden = false;
}

async function uploadSwitchImageFile(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/admin/upload/switch-image', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Не удалось загрузить изображение свитча');
  }

  return data.url;
}

async function resolveSwitchImageUrl() {
  const fileInput = document.getElementById('switchImageFile');
  const existingUrl = document.getElementById('existingSwitchImageUrl')?.value?.trim();

  if (fileInput?.files?.[0]) {
    return uploadSwitchImageFile(fileInput.files[0]);
  }

  return existingUrl || null;
}

function collectSwitchPayload(form, imageUrl) {
  const fd = new FormData(form);
  return {
    name: fd.get('name'),
    type: fd.get('type'),
    actuation_force: fd.get('actuation_force'),
    bottom_force: fd.get('bottom_force'),
    tactile_force: fd.get('tactile_force'),
    travel_length: fd.get('travel_length'),
    price_per_switch: fd.get('price_per_switch'),
    stock: fd.get('stock'),
    image_url: imageUrl,
  };
}

async function openSwitchModal(switchId = null) {
  const modal = document.getElementById('addSwitchModal');
  const form = document.getElementById('addSwitchForm');
  const title = document.getElementById('switchModalTitle');
  const errorBox = document.getElementById('switchFormError');

  form.reset();
  document.getElementById('switchId').value = switchId || '';
  document.getElementById('existingSwitchImageUrl').value = '';
  showSwitchImagePreview(null);
  errorBox.hidden = true;

  title.textContent = switchId ? 'Редактировать свитч' : 'Добавить свитч';

  if (switchId) {
    const response = await fetch(`/api/admin/switches/${switchId}`, { credentials: 'include' });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Не удалось загрузить свитч');
      return;
    }

    const sw = data.switch;
    form.name.value = sw.name;
    form.type.value = sw.type;
    form.actuation_force.value = sw.actuation_force;
    form.bottom_force.value = sw.bottom_force;
    form.tactile_force.value = sw.tactile_force ?? '';
    form.travel_length.value = sw.travel_length;
    form.price_per_switch.value = (Number(sw.price_per_switch) / 100).toFixed(2);
    form.stock.value = sw.stock ?? 0;

    if (sw.image_url) {
      document.getElementById('existingSwitchImageUrl').value = sw.image_url;
      showSwitchImagePreview(sw.image_url);
    }
  }

  modal.classList.add('admin-modal--open');
}

async function deleteSwitch(switchId) {
  if (!confirm('Удалить этот свитч?')) return;

  try {
    const response = await fetch(`/api/admin/switches/${switchId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка удаления');

    invalidateProductCaches();
    adminState.switchesCache = null;
    adminState.loaded.switches = false;
    await loadAdminSwitches();
    alert('Свитч удалён');
  } catch (err) {
    alert(err.message);
  }
}

function setupAddSwitchModal() {
  const modal = document.getElementById('addSwitchModal');
  const form = document.getElementById('addSwitchForm');
  const errorBox = document.getElementById('switchFormError');

  const close = () => modal.classList.remove('admin-modal--open');

  document.getElementById('addSwitchBtn').addEventListener('click', () => openSwitchModal());
  document.getElementById('closeSwitchModal').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  document.getElementById('switchImageFile').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      showSwitchImagePreview(document.getElementById('existingSwitchImageUrl').value || null);
      return;
    }
    showSwitchImagePreview(URL.createObjectURL(file));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const switchId = document.getElementById('switchId').value;

    try {
      const imageUrl = await resolveSwitchImageUrl();
      const payload = collectSwitchPayload(form, imageUrl);
      const url = switchId ? `/api/admin/switches/${switchId}` : '/api/admin/switches';
      const method = switchId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка сохранения');

      invalidateProductCaches();
      adminState.switchesCache = null;
      adminState.loaded.switches = false;
      close();
      await loadAdminSwitches();
      alert(switchId ? 'Свитч обновлён' : 'Свитч добавлен');
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.hidden = false;
    }
  });
}

function addSpecRow(key = '', value = '') {
  const row = document.createElement('div');
  row.className = 'admin-dynamic-row';
  row.innerHTML = `
    <input type="text" class="spec-key" placeholder="Ключ" value="${escapeHtml(key)}">
    <input type="text" class="spec-value" placeholder="Значение" value="${escapeHtml(value)}">
    <button type="button" class="admin-btn admin-btn--danger admin-btn--small row-remove">×</button>`;
  row.querySelector('.row-remove').addEventListener('click', () => row.remove());
  document.getElementById('specsList').appendChild(row);
}

function addEquipmentRow(value = '') {
  const row = document.createElement('div');
  row.className = 'admin-dynamic-row';
  row.innerHTML = `
    <input type="text" class="equipment-item" placeholder="Пункт комплектации" value="${escapeHtml(value)}">
    <button type="button" class="admin-btn admin-btn--danger admin-btn--small row-remove">×</button>`;
  row.querySelector('.row-remove').addEventListener('click', () => row.remove());
  document.getElementById('equipmentList').appendChild(row);
}

async function populateSwitchSelectors(selectedBaseId, selectedIds = []) {
  const switches = await fetchAdminSwitches();
  const baseSelect = document.getElementById('baseSwitchSelect');
  const checkboxes = document.getElementById('availableSwitchesList');

  baseSelect.innerHTML = '<option value="">Выберите свитч</option>';
  checkboxes.innerHTML = '';

  if (!switches.length) {
    baseSelect.innerHTML = '<option value="">Сначала добавьте свитчи</option>';
    return;
  }

  switches.forEach((sw) => {
    const opt = document.createElement('option');
    opt.value = sw.id;
    opt.textContent = `${sw.name} (${sw.type})`;
    if (String(sw.id) === String(selectedBaseId)) opt.selected = true;
    baseSelect.appendChild(opt);

    const label = document.createElement('label');
    label.className = 'admin-checkbox';
    label.innerHTML = `
      <input type="checkbox" name="available_switch" value="${sw.id}"
        ${selectedIds.includes(sw.id) ? 'checked' : ''}>
      <span>${escapeHtml(sw.name)}</span>`;
    checkboxes.appendChild(label);
  });
}

function showCoverPreview(url) {
  const preview = document.getElementById('keyboardCoverPreview');
  const img = document.getElementById('keyboardCoverPreviewImg');

  if (!url) {
    preview.hidden = true;
    img.src = '';
    return;
  }

  img.src = url;
  preview.hidden = false;
}

function renderExistingGalleryList() {
  const container = document.getElementById('existingGalleryList');
  container.innerHTML = '';

  adminState.existingGalleryUrls.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'admin-gallery-item';
    row.innerHTML = `
      <img src="${escapeHtml(item.url)}" alt="">
      <span>${escapeHtml(item.url)}</span>
      <button type="button" class="admin-btn admin-btn--danger admin-btn--small" data-remove-gallery="${index}">Удалить</button>`;
    row.querySelector('[data-remove-gallery]').addEventListener('click', () => {
      adminState.existingGalleryUrls.splice(index, 1);
      renderExistingGalleryList();
    });
    container.appendChild(row);
  });
}

async function uploadProductImageFile(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/admin/upload/product-image', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Не удалось загрузить изображение');
  }

  return data.url;
}

async function resolveKeyboardImages() {
  const coverFile = document.getElementById('keyboardCoverFile')?.files?.[0];
  const existingCover = document.getElementById('existingCoverUrl')?.value?.trim();
  let coverUrl = existingCover || null;

  if (coverFile) {
    coverUrl = await uploadProductImageFile(coverFile);
  }

  const galleryUrls = [...adminState.existingGalleryUrls];
  const galleryFiles = document.getElementById('keyboardGalleryFiles')?.files || [];

  for (const file of galleryFiles) {
    const url = await uploadProductImageFile(file);
    galleryUrls.push({ url, alt_text: '' });
  }

  return { coverUrl, galleryUrls };
}

function collectKeyboardPayload(form, { coverUrl, galleryUrls }) {
  const fd = new FormData(form);
  const specifications = [];
  document.querySelectorAll('#specsList .admin-dynamic-row').forEach((row, index) => {
    const key = row.querySelector('.spec-key').value.trim();
    const value = row.querySelector('.spec-value').value.trim();
    if (key) specifications.push({ key, value, display_order: index });
  });

  const equipment = [];
  document.querySelectorAll('#equipmentList .equipment-item').forEach((input) => {
    const val = input.value.trim();
    if (val) equipment.push(val);
  });

  const available_switch_ids = [];
  document.querySelectorAll('#availableSwitchesList input:checked').forEach((cb) => {
    available_switch_ids.push(parseInt(cb.value, 10));
  });

  const coverAlt = fd.get('cover_alt')?.trim() || '';
  const image_urls = [];

  if (coverUrl) {
    image_urls.push({ url: coverUrl, alt_text: coverAlt, sort_order: 1 });
  }

  galleryUrls.forEach((item, index) => {
    image_urls.push({
      url: item.url,
      alt_text: item.alt_text || '',
      sort_order: index + 2,
    });
  });

  return {
    name: fd.get('name'),
    description: fd.get('description'),
    base_price: fd.get('base_price'),
    switch_count: fd.get('switch_count'),
    stock: fd.get('stock'),
    base_switch_id: fd.get('base_switch_id'),
    available_switch_ids,
    specifications,
    equipment,
    image_urls,
  };
}

async function openKeyboardModal(productId = null) {
  const modal = document.getElementById('keyboardModal');
  const form = document.getElementById('keyboardForm');
  const title = document.getElementById('keyboardModalTitle');
  const errorBox = document.getElementById('keyboardFormError');

  form.reset();
  document.getElementById('keyboardProductId').value = productId || '';
  document.getElementById('existingCoverUrl').value = '';
  adminState.existingGalleryUrls = [];
  document.getElementById('specsList').innerHTML = '';
  document.getElementById('equipmentList').innerHTML = '';
  showCoverPreview(null);
  renderExistingGalleryList();
  errorBox.hidden = true;

  title.textContent = productId ? 'Редактировать клавиатуру' : 'Добавить клавиатуру';

  if (productId) {
    const response = await fetch(`/api/admin/products/${productId}`, { credentials: 'include' });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Не удалось загрузить клавиатуру');
      return;
    }
    const p = data.product;
    form.name.value = p.name;
    form.description.value = p.description || '';
    form.base_price.value = p.base_price;
    form.switch_count.value = p.switch_count;
    form.stock.value = p.stock ?? 0;
    if (p.cover_image) {
      document.getElementById('existingCoverUrl').value = p.cover_image.url;
      form.cover_alt.value = p.cover_image.alt_text || '';
      showCoverPreview(p.cover_image.url);
    }
    adminState.existingGalleryUrls = (p.gallery_images || []).map((img) => ({
      url: img.url,
      alt_text: img.alt_text || '',
    }));
    renderExistingGalleryList();
    p.specifications?.forEach((s) => addSpecRow(s.key, s.value));
    p.equipment?.forEach((item) => addEquipmentRow(item));
    await populateSwitchSelectors(p.base_switch_id, p.available_switch_ids || []);
  } else {
    addSpecRow();
    addEquipmentRow();
    await populateSwitchSelectors(null, []);
  }

  modal.classList.add('admin-modal--open');
}

function setupKeyboardModal() {
  const modal = document.getElementById('keyboardModal');
  const form = document.getElementById('keyboardForm');
  const errorBox = document.getElementById('keyboardFormError');

  const close = () => modal.classList.remove('admin-modal--open');

  document.getElementById('addKeyboardBtn').addEventListener('click', () => openKeyboardModal());
  document.getElementById('closeKeyboardModal').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.getElementById('addSpecRow').addEventListener('click', () => addSpecRow());
  document.getElementById('addEquipmentRow').addEventListener('click', () => addEquipmentRow());

  document.getElementById('keyboardCoverFile').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      showCoverPreview(document.getElementById('existingCoverUrl').value || null);
      return;
    }
    showCoverPreview(URL.createObjectURL(file));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const productId = document.getElementById('keyboardProductId').value;

    try {
      const images = await resolveKeyboardImages();
      const payload = collectKeyboardPayload(form, images);
      const url = productId ? `/api/admin/products/${productId}` : '/api/admin/products';
      const method = productId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка сохранения');

      invalidateProductCaches();
      adminState.loaded.keyboards = false;
      close();
      if (adminState.activeTab === 'keyboards') await loadAdminKeyboards();
      alert(productId ? 'Клавиатура обновлена' : 'Клавиатура добавлена');
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.hidden = false;
    }
  });
}

function setupAdminAccount(user) {
  adminState.user = user;
  setupAdminTabs(user);
  setupAddSwitchModal();
  setupKeyboardModal();
}

function setupRegularAccount(user) {
  document.getElementById('userOrdersSection').style.display = '';
  document.getElementById('adminPanel').style.display = 'none';
  loadUserOrders(user.id);
}

window.initAccountPage = function initAccountPage(user) {
  if (user.role === 'admin') {
    setupAdminAccount(user);
  } else {
    setupRegularAccount(user);
  }
};

window.openKeyboardModal = openKeyboardModal;
window.openSwitchModal = openSwitchModal;
