export const KIT_PAGES = [
  "/create-kit",
  "/pre-package-apps",
  "/managed-apps",
  "/review-kit",
  "/checkout",
];

export const isKitPage = (path: string) => {
  return KIT_PAGES.some((page) => path.startsWith(page));
};

export const clearKitSession = () => {
  localStorage.removeItem("kit_headset");
  localStorage.removeItem("kit_preapps");
  localStorage.removeItem("kit_managedapps");
  localStorage.removeItem("kit_review");
  localStorage.removeItem("kit_active");
};

export const startKitSession = () => {
  localStorage.setItem("kit_active", "true");
};
