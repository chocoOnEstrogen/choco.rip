import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Interface defining a single robots.txt rule
 * @property userAgent - The user agent string to apply the rule to
 * @property allow - Array of paths to explicitly allow
 * @property disallow - Array of paths to explicitly disallow
 * @property sitemap - URL to the sitemap file
 * @property crawlDelay - Delay between requests in seconds
 */
interface RobotsRule {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
  sitemap?: string;
  crawlDelay?: number;
}

/**
 * Interface defining the robots.txt configuration
 * @property rules - Array of robots rules to apply
 * @property outputPath - Path where robots.txt will be generated
 */
interface RobotsConfig {
  rules: RobotsRule[];
  outputPath?: string;
}

/**
 * Validates the robots.txt configuration
 * Ensures all required fields are present and of correct type
 */
class ConfigValidator {
  static validateConfig(config: any): RobotsConfig {
    const errors: string[] = [];

    if (!config.rules || !Array.isArray(config.rules)) {
      errors.push('rules is required and must be an array');
    } else {
      config.rules.forEach((rule: any, index: number) => {
        if (!rule.userAgent || typeof rule.userAgent !== 'string') {
          errors.push(`Rule ${index}: userAgent is required and must be a string`);
        }

        if (rule.allow && !Array.isArray(rule.allow)) {
          errors.push(`Rule ${index}: allow must be an array`);
        }

        if (rule.disallow && !Array.isArray(rule.disallow)) {
          errors.push(`Rule ${index}: disallow must be an array`);
        }

        if (rule.sitemap && typeof rule.sitemap !== 'string') {
          errors.push(`Rule ${index}: sitemap must be a string`);
        }

        if (rule.crawlDelay && (typeof rule.crawlDelay !== 'number' || rule.crawlDelay < 0)) {
          errors.push(`Rule ${index}: crawlDelay must be a non-negative number`);
        }
      });
    }

    if (config.outputPath && typeof config.outputPath !== 'string') {
      errors.push('outputPath must be a string');
    }

    if (errors.length > 0) {
      throw new Error(`Invalid config:\n${errors.join('\n')}`);
    }

    return config as RobotsConfig;
  }
}

/**
 * Generates robots.txt file from configuration
 * Handles file writing and error handling
 */
class RobotsGenerator {
  private config: RobotsConfig;

  constructor(config: RobotsConfig) {
    this.config = {
      outputPath: 'public/robots.txt',
      ...config
    };
  }

  /**
   * Generates the robots.txt content from the configuration
   * @returns Formatted robots.txt content
   */
  private generateRobotsTxt(): string {
    return this.config.rules.map(rule => {
      const parts = [`User-agent: ${rule.userAgent}`];

      if (rule.allow) {
        rule.allow.forEach(path => {
          parts.push(`Allow: ${path}`);
        });
      }

      if (rule.disallow) {
        rule.disallow.forEach(path => {
          parts.push(`Disallow: ${path}`);
        });
      }

      if (rule.sitemap) {
        parts.push(`Sitemap: ${rule.sitemap}`);
      }

      if (rule.crawlDelay !== undefined) {
        parts.push(`Crawl-delay: ${rule.crawlDelay}`);
      }

      return parts.join('\n');
    }).join('\n\n');
  }

  /**
   * Generates and writes the robots.txt file
   * @throws Error if file writing fails
   */
  async generate(): Promise<void> {
    try {
      const robotsTxt = this.generateRobotsTxt();
      await fs.promises.writeFile(this.config.outputPath!, robotsTxt, 'utf-8');
      console.log(`✅ robots.txt generated successfully at ${this.config.outputPath}`);
    } catch (error) {
      console.error('❌ Error generating robots.txt:', error);
      throw error;
    }
  }
}

/**
 * Main function to run the robots.txt generator
 * Reads config from file and generates robots.txt
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const configPath = args[0] || 'configs/robots.json';

    const configContent = await fs.promises.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const validatedConfig = ConfigValidator.validateConfig(config);

    const generator = new RobotsGenerator(validatedConfig);
    await generator.generate();
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { RobotsGenerator, ConfigValidator };