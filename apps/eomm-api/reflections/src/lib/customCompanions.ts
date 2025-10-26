export type UserCompanion = { id: string; name: string; style?: string };
const KEY = (h:string)=>`companions:${h}`;

export function loadUserCompanions(handle: string): UserCompanion[] {
  try {
    const raw = localStorage.getItem(KEY(handle));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
export function saveUserCompanions(handle: string, list: UserCompanion[]) {
  localStorage.setItem(KEY(handle), JSON.stringify(list));
}
export function ensureDefaultCompanion(handle: string): UserCompanion[] {
  const list = loadUserCompanions(handle);
  if (list.length === 0) {
    const first: UserCompanion = { id: `cmp-${Date.now()}`, name: `${handle}'s Companion` };
    saveUserCompanions(handle, [first]);
    return [first];
  }
  return list;
}

