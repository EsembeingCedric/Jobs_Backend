const AVATAR_BASE = "https://i.pravatar.cc";

export function avatarFor(user, size = 150) {
  if (user?.avatar) return user.avatar;
  const seed = user?.id || user?.email || "0";
  return `${AVATAR_BASE}/${size}?u=${encodeURIComponent(seed)}`;
}
