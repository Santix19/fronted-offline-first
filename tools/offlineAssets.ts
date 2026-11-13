import type { Plugin } from 'vite';

/** Cache the entry and its static dependencies at install time, before the first offline reload.
 * Lazy 3D chunks stay lazy; they are cached only when used, with a still-image fallback offline. */
export function offlineAssets(): Plugin {
  return {
    name: 'offline-entry-assets',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = new Set<string>();
      const visit = (name: string) => {
        if (files.has(name)) return;
        files.add(name);
        const chunk = bundle[name];
        if (chunk?.type === 'chunk') chunk.imports.forEach(visit);
      };
      for (const item of Object.values(bundle)) {
        if (item.type === 'chunk' && item.isEntry) visit(item.fileName);
        if (/\.(css|woff2)$/.test(item.fileName)) files.add(item.fileName);
      }
      this.emitFile({ type: 'asset', fileName: 'offline-assets.json', source: JSON.stringify([...files].map((f) => `/${f}`)) });
    },
  };
}
