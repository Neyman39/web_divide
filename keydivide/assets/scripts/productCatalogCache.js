/**
 * Кэш каталога товаров в localStorage браузера.
 * TTL — время жизни «свежего» кэша; после истечения данные всё ещё показываются,
 * пока в фоне подгружается актуальный список (stale-while-revalidate).
 */
(function () {
  const CACHE_KEY = 'keydivide_product_catalog_v1';
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 минут

  function readCacheEntry() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.data)) return null;

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

  function writeCache(products) {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: products, savedAt: Date.now() })
    );
  }

  async function fetchFromApi() {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Ошибка загрузки товаров');
    }
    return response.json();
  }

  /**
   * Загружает каталог: сначала из кэша (если есть), затем при необходимости с сервера.
   * @param {{ onUpdated?: (products: Array, meta: { fromCache: boolean, isFresh: boolean }) => void }} options
   */
  async function loadProducts(options = {}) {
    const { onUpdated } = options;
    const cached = readCacheEntry();

    if (cached) {
      onUpdated?.(cached.data, { fromCache: true, isFresh: cached.isFresh });

      if (cached.isFresh) {
        return cached.data;
      }

      try {
        const fresh = await fetchFromApi();
        writeCache(fresh);
        onUpdated?.(fresh, { fromCache: false, isFresh: true });
        return fresh;
      } catch (error) {
        if (cached) return cached.data;
        throw error;
      }
    }

    const products = await fetchFromApi();
    writeCache(products);
    onUpdated?.(products, { fromCache: false, isFresh: true });
    return products;
  }

  function invalidate() {
    localStorage.removeItem(CACHE_KEY);
  }

  window.ProductCatalogCache = {
    loadProducts,
    invalidate,
    CACHE_TTL_MS,
  };
})();
