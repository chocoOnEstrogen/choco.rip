import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import Compress from 'astro-compress';
import tailwind from '@astrojs/tailwind';
import vercel from "@astrojs/vercel";


// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), Compress({
    CSS: true,
    HTML: true,
    Image: false,
    JavaScript: true,
    SVG: false,
})],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  adapter: vercel(),
  output: "server",
});