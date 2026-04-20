/* ============================================================
   Auto-load all images under src/uploads/{roomId}/
   Drop any .jpg/.jpeg/.png/.webp/.gif into a room folder and
   it'll show up on that room's board the next time the app
   creates a new starter board for it.
============================================================ */

// Vite globs these at build time. The `?url` query returns a hashed URL string.
const modules = import.meta.glob(
  './uploads/*/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP,GIF}',
  { eager: true, query: '?url', import: 'default' }
);

// Build a map: { 'zuzu-bath': [{ src, filename }, ...], ... }
const byRoom = {};
for (const [path, url] of Object.entries(modules)) {
  // path looks like './uploads/zuzu-bath/foo.png'
  const match = path.match(/\.\/uploads\/([^/]+)\/([^/]+)$/);
  if (!match) continue;
  const [, roomId, filename] = match;
  (byRoom[roomId] ||= []).push({ src: url, filename });
}

// Sort each room's photos by filename for deterministic order
Object.values(byRoom).forEach((list) =>
  list.sort((a, b) => a.filename.localeCompare(b.filename))
);

export const UPLOADS_BY_ROOM = byRoom;

// Flat list of all image URLs (used by the "Add photo" modal's uploaded tab)
export const UPLOADED_IMAGES = Object.values(byRoom)
  .flat()
  .map((p) => p.src);
