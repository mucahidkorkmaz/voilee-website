export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  // 3-katmanlı mimari: Frontend'in origin'i (virgülle ayrılmış birden fazla olabilir)
  corsOrigin: process.env.CORS_ORIGIN ?? "",
  // true ise backend statik dosyaları da sunar (tek sunucu kurulumu için)
  serveStatic: process.env.SERVE_STATIC === "true",
};
