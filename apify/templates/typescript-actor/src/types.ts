/**
 * Type definitions for Actor
 *
 * Centralized type definitions for better code organization
 */

// Actor Input
export interface ActorInput {
    startUrls: { url: string }[];
    maxItems?: number;
    proxyConfiguration?: ProxyConfiguration;
}

// Proxy Configuration
export interface ProxyConfiguration {
    useApifyProxy?: boolean;
    proxyUrls?: string[];
    groups?: string[];
}

// Scraped Data Output
export interface ScrapedData {
    url: string;
    title: string;
    price?: number;
    description?: string;
    metadata?: ScrapedMetadata;
    scrapedAt: string;
}

// Optional Metadata
export interface ScrapedMetadata {
    productId?: string;
    category?: string;
    brand?: string;
    rating?: number;
    reviewCount?: number;
}
