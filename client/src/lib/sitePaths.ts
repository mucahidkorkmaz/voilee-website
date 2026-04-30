/** Canonical localized storefront URLs: `/tr`, `/en`, `/ar` + English slugs. */

export type Lang = "TR" | "EN" | "AR";

const P = { TR: "/tr", EN: "/en", AR: "/ar" } as const;

export const sitePaths = {
  home: { TR: "/tr", EN: "/en", AR: "/ar" },
  silhouettes: { TR: "/tr/silhouettes", EN: "/en/silhouettes", AR: "/ar/silhouettes" },
  product: { TR: "/tr/product", EN: "/en/product", AR: "/ar/product" },
  builder: { TR: "/tr/builder", EN: "/en/builder", AR: "/ar/builder" },
  about: { TR: "/tr/about", EN: "/en/about", AR: "/ar/about" },
  story: { TR: "/tr/story", EN: "/en/story", AR: "/ar/story" },
  lookbook: { TR: "/tr/lookbook", EN: "/en/lookbook", AR: "/ar/lookbook" },
  contact: { TR: "/tr/contact", EN: "/en/contact", AR: "/ar/contact" },
  journal: { TR: "/tr/journal", EN: "/en/journal", AR: "/ar/journal" },
  shippingReturns: { TR: "/tr/shipping-returns", EN: "/en/shipping-returns", AR: "/ar/shipping-returns" },
  sizeGuide: { TR: "/tr/size-guide", EN: "/en/size-guide", AR: "/ar/size-guide" },
  checkout: { TR: "/tr/checkout", EN: "/en/checkout", AR: "/ar/checkout" },
  login: { TR: "/tr/login", EN: "/en/login", AR: "/ar/login" },
  register: { TR: "/tr/register", EN: "/en/register", AR: "/ar/register" },
  forgotPassword: { TR: "/tr/forgot-password", EN: "/en/forgot-password", AR: "/ar/forgot-password" },
  resetPassword: { TR: "/tr/reset-password", EN: "/en/reset-password", AR: "/ar/reset-password" },
  verify: { TR: "/tr/verify", EN: "/en/verify", AR: "/ar/verify" },
  account: { TR: "/tr/account", EN: "/en/account", AR: "/ar/account" },
  orders: { TR: "/tr/account/orders", EN: "/en/account/orders", AR: "/ar/account/orders" },
  returns: { TR: "/tr/account/returns", EN: "/en/account/returns", AR: "/ar/account/returns" },
  addresses: { TR: "/tr/account/addresses", EN: "/en/account/addresses", AR: "/ar/account/addresses" },
  wishlist: { TR: "/tr/account/wishlist", EN: "/en/account/wishlist", AR: "/ar/account/wishlist" },
  accountSettings: { TR: "/tr/account/settings", EN: "/en/account/settings", AR: "/ar/account/settings" },
} as const;

export function productPath(lang: Lang, slug: string) {
  return `${sitePaths.product[lang]}/${encodeURIComponent(slug)}`;
}

export function verifySerialPath(lang: Lang, serial: string) {
  return `${sitePaths.verify[lang]}/${encodeURIComponent(serial)}`;
}

export function orderDetailPath(lang: Lang, id: string) {
  return `${sitePaths.orders[lang]}/${encodeURIComponent(id)}`;
}

export function returnDetailPath(lang: Lang, id: string) {
  return `${sitePaths.returns[lang]}/${encodeURIComponent(id)}`;
}

/** @deprecated Use `Lang` */
export type SiteLang = Lang;
