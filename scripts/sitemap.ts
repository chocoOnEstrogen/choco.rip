import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { promisify } from "util";
import { exec } from "child_process";
import { loadEnv } from "./helpers/env";

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternateRefs?: Array<{
    href: string;
    hreflang: string;
    xhtml?: boolean;
    media?: string;
  }>;
}

interface SitemapOptions {
  baseUrl: string;
  outputPath?: string;
  excludePaths?: string[];
  includeDynamicRoutes?: boolean;
  dynamicRoutes?: string[];
  lastModified?: boolean;
  changeFrequency?: SitemapEntry['changeFrequency'];
  priority?: number;
  alternateRefs?: SitemapEntry['alternateRefs'];
}

class ConfigValidator {
  private static readonly validChangeFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

  static validateConfig(config: any): SitemapOptions {
    const errors: string[] = [];

    if (!config.baseUrl || typeof config.baseUrl !== 'string') {
      errors.push('baseUrl is required and must be a string');
    }

    if (config.outputPath && typeof config.outputPath !== 'string') {
      errors.push('outputPath must be a string');
    }

    if (config.excludePaths && !Array.isArray(config.excludePaths)) {
      errors.push('excludePaths must be an array');
    }

    if (config.includeDynamicRoutes && typeof config.includeDynamicRoutes !== 'boolean') {
      errors.push('includeDynamicRoutes must be a boolean');
    }

    if (config.dynamicRoutes && !Array.isArray(config.dynamicRoutes)) {
      errors.push('dynamicRoutes must be an array');
    }

    if (config.lastModified && typeof config.lastModified !== 'boolean') {
      errors.push('lastModified must be a boolean');
    }

    if (config.changeFrequency && !this.validChangeFrequencies.includes(config.changeFrequency)) {
      errors.push(`changeFrequency must be one of: ${this.validChangeFrequencies.join(', ')}`);
    }

    if (config.priority && (typeof config.priority !== 'number' || config.priority < 0 || config.priority > 1)) {
      errors.push('priority must be a number between 0 and 1');
    }

    if (config.alternateRefs && !Array.isArray(config.alternateRefs)) {
      errors.push('alternateRefs must be an array');
    }

    if (errors.length > 0) {
      throw new Error(`Invalid config:\n${errors.join('\n')}`);
    }

    return config as SitemapOptions;
  }
}

class SitemapGenerator {
  private options: SitemapOptions;
  private entries: SitemapEntry[] = [];

  constructor(options: SitemapOptions) {
    this.options = {
      outputPath: 'public/sitemap.xml',
      excludePaths: [],
      includeDynamicRoutes: false,
      dynamicRoutes: [],
      lastModified: true,
      changeFrequency: 'weekly',
      priority: 0.7,
      ...options
    };
  }

  private async scanDirectory(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('_') && !entry.name.startsWith('.') && entry.name !== 'api') {
          files.push(...await this.scanDirectory(fullPath));
        }
      } else if (entry.name === 'page.tsx') {
        const relativePath = path.relative(path.join(__dirname, '../app'), dir);
        const route = relativePath
          .replace(/\\/g, '/');
        
        if (!this.options.excludePaths?.includes(route)) {
          files.push(route);
        }
      }
    }

    return files;
  }

  private async getDynamicParams(route: string): Promise<{ [key: string]: string }[]> {
    try {
      // Import the page module using proper file URL format
      const pagePath = path.join(__dirname, '../app', route, 'page.tsx');
      const fileUrl = `file://${pagePath.replace(/\\/g, '/')}`;
      const pageModule = await import(fileUrl);

      // Check if generateStaticParams exists
      if (typeof pageModule.generateStaticParams === 'function') {
        return await pageModule.generateStaticParams();
      }
    } catch (error) {
      console.warn(`⚠️ Could not get dynamic params for ${route}:`, error);
    }
    return [];
  }

  private async generateEntry(route: string): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = [];
    
    // Check if route is dynamic (contains [param])
    if (route.includes('[') && route.includes(']')) {
      const dynamicParams = await this.getDynamicParams(route);
      
      for (const params of dynamicParams) {
        let dynamicRoute = route;
        for (const [key, value] of Object.entries(params)) {
          dynamicRoute = dynamicRoute.replace(`[${key}]`, value);
        }
        
        const url = dynamicRoute === '' 
          ? this.options.baseUrl 
          : `${this.options.baseUrl}/${dynamicRoute}`;
        
        const entry: SitemapEntry = { url };

        if (this.options.lastModified) {
          entry.lastModified = new Date().toISOString();
        }

        if (this.options.changeFrequency) {
          entry.changeFrequency = this.options.changeFrequency;
        }

        if (this.options.priority) {
          entry.priority = this.options.priority;
        }

        if (this.options.alternateRefs) {
          entry.alternateRefs = this.options.alternateRefs;
        }

        entries.push(entry);
      }
    } else {
      const url = route === '' 
        ? this.options.baseUrl 
        : `${this.options.baseUrl}/${route}`;
      
      const entry: SitemapEntry = { url };

      if (this.options.lastModified) {
        entry.lastModified = new Date().toISOString();
      }

      if (this.options.changeFrequency) {
        entry.changeFrequency = this.options.changeFrequency;
      }

      if (this.options.priority) {
        entry.priority = this.options.priority;
      }

      if (this.options.alternateRefs) {
        entry.alternateRefs = this.options.alternateRefs;
      }

      entries.push(entry);
    }

    return entries;
  }

  private generateSitemapXML(): string {
    const entries = this.entries.map(entry => {
      const parts = [`<url>`];
      parts.push(`  <loc>${this.escapeXML(entry.url)}</loc>`);
      
      if (entry.lastModified) {
        parts.push(`  <lastmod>${entry.lastModified}</lastmod>`);
      }
      
      if (entry.changeFrequency) {
        parts.push(`  <changefreq>${entry.changeFrequency}</changefreq>`);
      }
      
      if (entry.priority) {
        parts.push(`  <priority>${entry.priority}</priority>`);
      }

      if (entry.alternateRefs) {
        entry.alternateRefs.forEach(ref => {
          const attrs = [
            `href="${this.escapeXML(ref.href)}"`,
            `hreflang="${this.escapeXML(ref.hreflang)}"`,
            ref.xhtml ? 'xhtml="true"' : '',
            ref.media ? `media="${this.escapeXML(ref.media)}"` : ''
          ].filter(Boolean);
          parts.push(`  <xhtml:link rel="alternate" ${attrs.join(' ')} />`);
        });
      }
      
      parts.push(`</url>`);
      return parts.join('\n');
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>`;
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  async generate(): Promise<void> {
    try {
      const appDir = path.join(__dirname, '../app');
      const routes = await this.scanDirectory(appDir);
      
      for (const route of routes) {
        const entries = await this.generateEntry(route);
        this.entries.push(...entries);
      }

      if (this.options.includeDynamicRoutes && this.options.dynamicRoutes) {
        for (const route of this.options.dynamicRoutes) {
          const entries = await this.generateEntry(route);
          this.entries.push(...entries);
        }
      }

      const sitemap = this.generateSitemapXML();
      await fs.promises.writeFile(this.options.outputPath!, sitemap, 'utf-8');
      console.log(`✅ Sitemap generated successfully at ${this.options.outputPath}`);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error generating sitemap:', error);
      throw error;
    }
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const configPath = args[0] || 'configs/sitemap.json';

    const configContent = await fs.promises.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const validatedConfig = ConfigValidator.validateConfig(config);

    const generator = new SitemapGenerator(validatedConfig);
    await generator.generate();
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { SitemapGenerator, ConfigValidator };
