import manifest from './image-manifest.json';

const sizes = {
  hero: '100vw',
  card: '(max-width: 370px) 90vw, (max-width: 760px) 44vw, 29vw',
  browse: '(max-width: 370px) 90vw, (max-width: 760px) 44vw, (max-width: 1100px) 35vw, 24vw',
  editorial: '(max-width: 760px) 90vw, 44vw',
  detail: '(max-width: 760px) 90vw, 560px',
  thumb: '96px',
};

export function imageProps(name, layout = 'card') {
  const asset = manifest[name];
  if (!asset) return { src: `/images/${name}.jpg`, decoding: 'async' };
  const fallback = asset.variants.at(-1);
  return {
    src: fallback.src,
    srcSet: asset.variants.map(variant => `${variant.src} ${variant.width}w`).join(', '),
    sizes: sizes[layout], width: asset.width, height: asset.height, decoding: 'async',
  };
}
