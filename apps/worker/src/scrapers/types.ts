export interface ScrapedProduct {
  sku: string;
  rawName: string;
  priceClp: number;
  inStock: boolean;
  productUrl: string;
  regulatoryLabel?: string; // raw text found on the page, e.g. "Este producto requiere receta médica simple"
}

export interface PharmacyScraper {
  chainSlug: string;
  /** Async generator so the pipeline can stream + persist incrementally instead of buffering everything in memory. */
  scrape(productUrls: string[]): AsyncGenerator<ScrapedProduct>;
}
