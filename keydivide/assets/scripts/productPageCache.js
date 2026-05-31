/**
 * Кэш данных страницы товара (product.html) в localStorage.
 * Отдельные записи для /api/products/:id и /api/products/:id/switches.
 */
(function () {
  const CACHE_PREFIX = 'keydivide_product_page_v2';
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 минут

  function cacheKey(productId, suffix) {
    return `${CACHE_PREFIX}_${productId}_${suffix}`;
  }

  function readCacheEntry(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (parsed.data == null) return null;

      const age = Date.now() - parsed.savedAt;
      return {
        data: parsed.data,
        savedAt: parsed.savedAt,
        isFresh: age <= CACHE_TTL_MS,
      };
    } catch {
      return null;
    }
  }

  function writeCacheEntry(key, data) {
    localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
  }

  async function loadCached(key, fetchFn, onUpdated) {
    const cached = readCacheEntry(key);

    if (cached) {
      onUpdated?.(cached.data, { fromCache: true, isFresh: cached.isFresh });

      if (cached.isFresh) {
        return cached.data;
      }

      try {
        const fresh = await fetchFn();
        writeCacheEntry(key, fresh);
        onUpdated?.(fresh, { fromCache: false, isFresh: true });
        return fresh;
      } catch (error) {
        return cached.data;
      }
    }

    const data = await fetchFn();
    writeCacheEntry(key, data);
    onUpdated?.(data, { fromCache: false, isFresh: true });
    return data;
  }

  async function fetchProduct(productId) {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      throw new Error('Product not found');
    }
    return response.json();
  }

  async function fetchSwitches(productId) {
    const response = await fetch(`/api/products/${productId}/switches`);
    if (!response.ok) {
      throw new Error('Switches not found');
    }
    return response.json();
  }

  /**
   * @param {number|string} productId
   * @param {{ onUpdated?: (data: object, meta: { fromCache: boolean, isFresh: boolean }) => void }} options
   */
  async function loadProduct(productId, options = {}) {
    const key = cacheKey(productId, 'detail');
    return loadCached(key, () => fetchProduct(productId), options.onUpdated);
  }

  /**
   * @param {number|string} productId
   * @param {{ onUpdated?: (data: object, meta: { fromCache: boolean, isFresh: boolean }) => void }} options
   */
  async function loadSwitches(productId, options = {}) {
    const key = cacheKey(productId, 'switches');
    return loadCached(key, () => fetchSwitches(productId), options.onUpdated);
  }

  function invalidate(productId) {
    localStorage.removeItem(cacheKey(productId, 'detail'));
    localStorage.removeItem(cacheKey(productId, 'switches'));
  }

  function invalidateAll() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  }

  window.ProductPageCache = {
    loadProduct,
    loadSwitches,
    invalidate,
    invalidateAll,
    CACHE_TTL_MS,
  };
})();
