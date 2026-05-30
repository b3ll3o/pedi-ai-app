import type { Metadata } from 'next';

interface MetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

export function createPageMetadata(options: MetadataOptions = {}): Metadata {
  const {
    title,
    description = 'Cardápio digital para restaurantes modernos',
    path = '',
    image,
    noIndex = false,
  } = options;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const fullUrl = `${baseUrl}${path}`;
  const imageUrl = image || '/og-image.png';

  return {
    title,
    description,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      url: fullUrl,
      title: title ? `${title} | Pedi-AI` : 'PediAI - Cardápio Digital',
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'PediAI - Cardápio Digital',
        },
      ],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
