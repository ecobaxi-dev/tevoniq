import sharp from 'sharp';
import { SaxesParser } from 'saxes';
import { BadRequestException } from '@nestjs/common';
const tags = new Set([
  'svg',
  'g',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'defs',
  'linearGradient',
  'radialGradient',
  'stop',
  'title',
  'desc',
]);
const attributes = new Set([
  'xmlns',
  'viewBox',
  'width',
  'height',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'd',
  'points',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-dashoffset',
  'fill-rule',
  'clip-rule',
  'opacity',
  'fill-opacity',
  'stroke-opacity',
  'transform',
  'id',
  'offset',
  'stop-color',
  'stop-opacity',
  'gradientUnits',
  'gradientTransform',
  'spreadMethod',
  'fx',
  'fy',
  'preserveAspectRatio',
]);
const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
/** Rebuild a small static SVG vocabulary. Active, linked and CSS-based SVG is rejected. */
export function sanitizeSvg(bytes: Buffer, maxPixels: number) {
  const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  if (bytes.length > 1024 * 1024) throw new Error('SVG must be at most 1 MiB');
  const parser = new SaxesParser({ xmlns: false });
  parser.on('xmldecl', (declaration) => {
    if (declaration.encoding && !/^utf-8$/i.test(declaration.encoding))
      throw new Error('SVG must declare UTF-8 encoding');
  });
  let output = '',
    depth = 0,
    nodes = 0,
    root: Record<string, string> = {};
  const stack: string[] = [];
  parser.on('doctype', () => {
    throw new Error('SVG document types are forbidden');
  });
  parser.on('processinginstruction', () => {
    throw new Error('SVG processing instructions are forbidden');
  });
  parser.on('error', () => {
    throw new Error('Invalid SVG XML');
  });
  parser.on('opentag', (node) => {
    if (++nodes > 10000 || ++depth > 40) throw new Error('SVG is too complex');
    if (
      !tags.has(node.name) ||
      (depth === 1 && node.name !== 'svg') ||
      (depth > 1 && node.name === 'svg')
    )
      throw new Error('Only static SVG shapes and gradients are supported');
    if (depth === 1) root = node.attributes;
    output += '<' + node.name;
    for (const [name, value] of Object.entries(node.attributes)) {
      if (!attributes.has(name)) throw new Error('Unsupported SVG attribute: ' + name);
      if (name === 'xmlns') {
        if (value !== 'http://www.w3.org/2000/svg') throw new Error('Invalid SVG namespace');
      } else if (name === 'id') {
        if (!/^[A-Za-z][\w-]{0,79}$/.test(value)) throw new Error('Invalid SVG id');
      } else if (['fill', 'stroke', 'stop-color'].includes(name)) {
        if (
          !/^(?:none|transparent|currentColor|[a-zA-Z]{1,25}|#[a-fA-F0-9]{3,8}|rgba?\([\d.,%\s]+\)|url\(#[A-Za-z][\w-]{0,79}\))$/.test(
            value,
          )
        )
          throw new Error('Unsafe SVG paint');
      } else if (!/^[A-Za-z0-9\s.,+%()-]*$/.test(value) || value.length > 100000)
        throw new Error('Unsafe SVG attribute value');
      output += ' ' + name + '="' + escapeXml(value) + '"';
    }
    if (depth === 1 && !node.attributes.xmlns) output += ' xmlns="http://www.w3.org/2000/svg"';
    output += '>';
    stack.push(node.name);
  });
  const text = (value: string) => {
    if (value.trim() && !['title', 'desc'].includes(stack.at(-1) || ''))
      throw new Error('SVG text elements are unsupported; convert lettering to paths');
    output += escapeXml(value);
  };
  parser.on('text', text);
  parser.on('cdata', text);
  parser.on('closetag', (node) => {
    output += '</' + node.name + '>';
    stack.pop();
    depth--;
  });
  parser.write(source).close();
  if (!nodes) throw new Error('Empty SVG');
  const viewBox = root.viewBox
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const dimension = (value?: string) =>
    value && /^\d+(?:\.\d+)?(?:px)?$/.test(value) ? Number(value.replace('px', '')) : undefined;
  const width = dimension(root.width) ?? viewBox?.[2],
    height = dimension(root.height) ?? viewBox?.[3];
  if (
    !width ||
    !height ||
    !Number.isFinite(width * height) ||
    width > 10000 ||
    height > 10000 ||
    width * height > maxPixels ||
    width < 1 ||
    height < 1
  )
    throw new Error('SVG needs bounded width/height or viewBox');
  return { bytes: Buffer.from(output), width: Math.ceil(width), height: Math.ceil(height) };
}
export type PreparedFile = {
  name: string;
  bytes: Buffer;
  mime: string;
  width: number;
  height: number;
};
export async function prepareImage(
  bytes: Buffer,
  declared: string,
  maxPixels: number,
  protectedOriginal = false,
): Promise<PreparedFile[]> {
  try {
    if (declared === 'image/svg+xml') {
      const svg = sanitizeSvg(bytes, maxPixels);
      return [
        {
          name: 'original.svg',
          bytes: protectedOriginal ? bytes : svg.bytes,
          mime: declared,
          width: svg.width,
          height: svg.height,
        },
      ];
    }
    const metadata = await sharp(bytes, {
      limitInputPixels: maxPixels,
      failOn: 'warning',
    }).metadata();
    const formats: Record<string, [string, string]> = {
      jpeg: ['image/jpeg', 'jpg'],
      png: ['image/png', 'png'],
      webp: ['image/webp', 'webp'],
      heif: ['image/avif', 'avif'],
    };
    const format = formats[metadata.format || ''];
    if (
      !format ||
      format[0] !== declared ||
      (metadata.format === 'heif' && metadata.compression !== 'av1')
    )
      throw new Error('File contents do not match an allowed MIME type');
    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width * metadata.height > maxPixels ||
      (metadata.pages || 1) > 1
    )
      throw new Error('Oversized or animated images are not supported');
    // Decode fully, not just the header; originals remain byte-for-byte untouched.
    const normalized = await sharp(bytes, { limitInputPixels: maxPixels, failOn: 'warning' })
      .rotate()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const result: PreparedFile[] = [
      {
        name: 'original.' + format[1],
        bytes,
        mime: declared,
        width: metadata.width,
        height: metadata.height,
      },
    ];
    if (!protectedOriginal) {
      for (const [name, width] of [
        ['thumb', 320],
        ['medium', 960],
        ['large', 1600],
      ] as const) {
        if (name !== 'thumb' && normalized.info.width <= (name === 'large' ? 960 : 320)) continue;
        const derivative = await sharp(normalized.data, {
          raw: {
            width: normalized.info.width,
            height: normalized.info.height,
            channels: normalized.info.channels,
          },
        })
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer({ resolveWithObject: true });
        result.push({
          name: name + '.webp',
          bytes: derivative.data,
          mime: 'image/webp',
          width: derivative.info.width,
          height: derivative.info.height,
        });
      }
    }
    return result;
  } catch (e) {
    throw new BadRequestException(e instanceof Error ? e.message : 'Invalid image');
  }
}
