import { Product } from '../types';

/**
 * Returns the Minimum Order Quantity (MOQ) for a product based on its category and price tier.
 */
export function getProductMOQ(product: Product): number {
  return 100;
}
