import { mkdir, writeFile } from 'node:fs/promises';
const images = {
  hero: ['1600210492486-724fe5c67fb0', 2200],
  studio: ['1600607687920-4e2a09cf159d', 1400],
  project: ['1600566753086-00f18fb6b3ea', 1400],
  sofa: ['1555041469-a586c61ea9bc', 900],
  chair: ['1567538096630-e0c55bd6374c', 900],
  lounge: ['1598300042247-d088f8ab3a91', 900],
  lamp: ['1507473885765-e6ed057f782c', 900],
  table: ['1499933374294-4584851497cc', 900],
  room: ['1616486338812-3dadae4b4ace', 1400],
  dining: ['1617806118233-18e1de247200', 900],
};
await mkdir('public/images', { recursive: true });
for (const [name, [id, width]] of Object.entries(images)) {
  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=85`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    await writeFile(`public/images/${name}.jpg`, bytes);
    console.log(`${name}: ${bytes.length} bytes`);
  } catch (error) { console.error(`${name}: ${error.message}`); process.exitCode = 1; }
}
await writeFile('public/images/SOURCES.json', JSON.stringify(Object.fromEntries(Object.entries(images).map(([name, [id]]) => [name, `https://images.unsplash.com/photo-${id}`])), null, 2));
