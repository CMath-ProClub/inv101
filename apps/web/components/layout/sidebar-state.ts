export const SIDEBAR_STORAGE_KEY = "investing101:sidebar-collapsed";
export const SIDEBAR_EVENT = "investing101:sidebar-state";

export type SidebarEventDetail = {
  collapsed: boolean;
};

export function readSidebarPreference(defaultValue = false) {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
  if (stored === null) {
    return defaultValue;
  }
  return stored === "true";
}

export function emitSidebarState(collapsed: boolean) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent<SidebarEventDetail>(SIDEBAR_EVENT, { detail: { collapsed } }));
}
