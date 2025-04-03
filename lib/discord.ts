export function buildEmbed(options: {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  thumbnail?: {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  image?: {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  footer?: {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  timestamp?: Date | string;
  url?: string;
}): Record<string, any> {
  const embed: Record<string, any> = {};

  if (options.title) embed.title = options.title;
  if (options.description) embed.description = options.description;
  if (options.color) embed.color = options.color;
  if (options.fields) embed.fields = options.fields;
  if (options.thumbnail) embed.thumbnail = options.thumbnail;
  if (options.image) embed.image = options.image;
  if (options.author) embed.author = options.author;
  if (options.footer) embed.footer = options.footer;
  if (options.timestamp) {
    embed.timestamp = options.timestamp instanceof Date 
      ? options.timestamp.toISOString() 
      : options.timestamp;
  }
  if (options.url) embed.url = options.url;

  return embed;
}