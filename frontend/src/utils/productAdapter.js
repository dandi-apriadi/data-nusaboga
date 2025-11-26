import { buildImageUrl, PRODUCT_PLACEHOLDER } from './media';

/**
 * Normalize backend product shape for UI consumption (user & admin)
 * @param {Object} p raw backend product
 * @returns {Object} normalized
 */
export const adaptBackendProduct = (p) => {
  if (!p) return null;
  const images = Array.isArray(p.product_images) ? p.product_images : [];
  const primary = images.find(i => i.is_primary) || images[0];
  const raw = primary?.url || p.image_url || '';
  const image = buildImageUrl(raw) || PRODUCT_PLACEHOLDER;
  return {
    id: p.product_id,
    product_id: p.product_id, // keep original for compatibility
    name: p.name,
    description: p.description,
    price: Number(p.price || 0),
    originalPrice: p.original_price ? Number(p.original_price) : null,
    costPrice: p.cost_price ? Number(p.cost_price) : null,
    stock: Number(p.stock || 0),
    weightGrams: Number(p.weight_grams || 0),
    categoryId: p.category_id || p.ProductCategory?.category_id || '',
    categoryName: p.ProductCategory?.name || '',
    image,
    images: images.map(img => ({ ...img, fullUrl: buildImageUrl(img.url) })),
    rating: Number(p.rating_avg || 0),
    reviews: Number(p.reviews_count || 0),
    sold: Number(p.sold_count || 0), // backend may add later
    active: !!p.active,
    slug: p.slug || '',
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    raw, // original relative/absolute path
    _original: p, // reference for downstream operations
  };
};

export const adaptBackendProducts = (arr) => Array.isArray(arr) ? arr.map(adaptBackendProduct) : [];

export default adaptBackendProduct;
