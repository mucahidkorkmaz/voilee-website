/** Canonical localized URLs: English slugs, /tr | /en | /ar prefix. */

export type SiteLang = "TR" | "EN" | "AR";

const P = { TR: "/tr", EN: "/en", AR: "/ar" } as const;

export const sitePaths = {
  home: { TR: "/tr", EN: "/en", AR: "/ar" },
  collections: { TR: "/tr/collections", EN: "/en/collections", AR: "/ar/collections" },
  builder: { TR: "/tr/builder", EN: "/en/builder", AR: "/ar/builder" },
  about: { TR: "/tr/about", EN: "/en/about", AR: "/ar/about" },
  story: { TR: "/tr/story", EN: "/en/story", AR: "/ar/story" },
  lookbook: { TR: "/tr/lookbook", EN: "/en/lookbook", AR: "/ar/lookbook" },
  sustainability: { TR: "/tr/sustainability", EN: "/en/sustainability", AR: "/ar/sustainability" },
  contact: { TR: "/tr/contact", EN: "/en/contact", AR: "/ar/contact" },
  journal: { TR: "/tr/journal", EN: "/en/journal", AR: "/ar/journal" },
  shippingReturns: { TR: "/tr/shipping-returns", EN: "/en/shipping-returns", AR: "/ar/shipping-returns" },
  sizeGuide: { TR: "/tr/size-guide", EN: "/en/size-guide", AR: "/ar/size-guide" },
  checkout: { TR: "/tr/checkout", EN: "/en/checkout", AR: "/ar/checkout" },
  login: { TR: "/tr/login", EN: "/en/login", AR: "/ar/login" },
  forgotPassword: { TR: "/tr/forgot-password", EN: "/en/forgot-password", AR: "/ar/forgot-password" },
  resetPassword: { TR: "/tr/reset-password", EN: "/en/reset-password", AR: "/ar/reset-password" },
  register: { TR: "/tr/register", EN: "/en/register", AR: "/ar/register" },
  verify: { TR: "/tr/verify", EN: "/en/verify", AR: "/ar/verify" },
  account: { TR: "/tr/account", EN: "/en/account", AR: "/ar/account" },
  accountOrders: { TR: "/tr/account/orders", EN: "/en/account/orders", AR: "/ar/account/orders" },
  accountReturns: { TR: "/tr/account/returns", EN: "/en/account/returns", AR: "/ar/account/returns" },
  accountAddresses: { TR: "/tr/account/addresses", EN: "/en/account/addresses", AR: "/ar/account/addresses" },
  accountWishlist: { TR: "/tr/account/wishlist", EN: "/en/account/wishlist", AR: "/ar/account/wishlist" },
  accountProfile: { TR: "/tr/account/profile", EN: "/en/account/profile", AR: "/ar/account/profile" },
} as const;

export function productPath(lang: SiteLang, slug: string) {
  return `${P[lang]}/product/${encodeURIComponent(slug)}`;
}

export function verifySerialPath(lang: SiteLang, serial: string) {
  return `${P[lang]}/verify/${encodeURIComponent(serial)}`;
}

export function orderDetailPath(lang: SiteLang, id: string) {
  return `${P[lang]}/account/orders/${encodeURIComponent(id)}`;
}

export function returnDetailPath(lang: SiteLang, id: string) {
  return `${P[lang]}/account/returns/${encodeURIComponent(id)}`;
}
