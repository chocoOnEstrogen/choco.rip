import axios from "axios";
import { redis } from "./redis";

interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  license: {
    name: string;
  } | null;
  language: string | null;
  default_branch: string;
  size: number;
  visibility: string;
  has_issues: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  is_archived: boolean;
  is_disabled: boolean;
  pushed_at: string;
  clone_url: string;
  ssh_url: string;
  watchers_count: number;
  subscribers_count: number;
  network_count: number;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface GithubStats {
  totalStars: number;
  totalForks: number;
  totalIssues: number;
  languages: Record<string, number>;
  topics: string[];
}

export interface GithubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  created_at: string;
  email: string | null;
  blog: string | null;
  twitter_username: string | null;
  location: string | null;
  company: string | null;
  html_url: string;
  isCached?: boolean;
  metadata?: {
    fetchedAt: string;
    source: string;
    cacheKey: string;
  };
}

export interface GithubEvent {
  id: string;
  type: string;
  repo: {
    name: string;
  };
  payload: any;
  created_at: string;
}

export const getGithubRepos = async (username: string) => {
  const cacheKey = `github:repos:${username}`;
  
  try {
    // Try to get from cache first
    const cachedData = await redis.get<{ repos: GithubRepo[]; stats: GithubStats; tags: string[] }>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const response = await axios.get<GithubRepo[]>(
      `https://api.github.com/users/${username}/repos`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        params: {
          sort: "stars",
          per_page: 100
        }
      }
    );
    
    // Get all unique tags/topics
    const allTags = new Set(
      response.data.flatMap(repo => repo.topics)
    );

    // Calculate statistics
    const stats: GithubStats = {
      totalStars: response.data.reduce((acc, repo) => acc + repo.stargazers_count, 0),
      totalForks: response.data.reduce((acc, repo) => acc + repo.forks_count, 0),
      totalIssues: response.data.reduce((acc, repo) => acc + repo.open_issues_count, 0),
      languages: response.data.reduce((acc, repo) => {
        if (repo.language) {
          acc[repo.language] = (acc[repo.language] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      topics: Array.from(allTags)
    };
    
    const result = {
      repos: response.data,
      stats,
      tags: Array.from(allTags)
    };

    // Cache the result for 1 hour
    await redis.set(cacheKey, result, 3600);
    
    return result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch GitHub repos: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getRepoDetails = async (username: string, repoName: string) => {
  const cacheKey = `github:repo:${username}:${repoName}`;
  
  try {
    // Try to get from cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const response = await axios.get<GithubRepo>(
      `https://api.github.com/repos/${username}/${repoName}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        }
      }
    );

    // Cache the result for 1 hour
    await redis.set(cacheKey, response.data, 3600);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch repo details: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getRepoLanguages = async (username: string, repoName: string) => {
  const cacheKey = `github:languages:${username}:${repoName}`;
  
  try {
    // Try to get from cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const response = await axios.get<Record<string, number>>(
      `https://api.github.com/repos/${username}/${repoName}/languages`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        }
      }
    );

    // Cache the result for 1 hour
    await redis.set(cacheKey, response.data, 3600);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch repo languages: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getRepoContributors = async (username: string, repoName: string) => {
  const cacheKey = `github:contributors:${username}:${repoName}`;
  
  try {
    // Try to get from cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${username}/${repoName}/contributors`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        }
      }
    );

    // Cache the result for 1 hour
    await redis.set(cacheKey, response.data, 3600);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch repo contributors: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getGithubUser = async (username: string) => {
  const cacheKey = `github:user:${username}`;
  
  try {
    // Try to get from cache first
    const cachedData = await redis.get<GithubUser>(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        isCached: true,
        metadata: {
          fetchedAt: new Date().toISOString(),
          source: 'cache',
          cacheKey
        }
      }
    }

    const response = await axios.get<GithubUser>(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        }
      }
    );

    // Cache the result for 1 hour
    await redis.set(cacheKey, response.data, 3600);
    
    return {
      data: response.data,
      isCached: false,
      metadata: {
        fetchedAt: new Date().toISOString(),
        source: 'api',
        cacheKey
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch GitHub user: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getUserEvents = async (username: string) => {
  const cacheKey = `github:events:${username}`;
  
  try {
    // Try to get from cache first
    const cachedData = await redis.get<GithubEvent[]>(cacheKey);
    if (cachedData) {
      return {
        data: cachedData,
        isCached: true,
        metadata: {
          fetchedAt: new Date().toISOString(),
          source: 'cache',
          cacheKey
        }
      }
    }

    const response = await axios.get<GithubEvent[]>(
      `https://api.github.com/users/${username}/events`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        params: {
          per_page: 5
        }
      }
    );

    // Cache the result for 1 hour
    await redis.set(cacheKey, response.data, 3600);
    
    return {
      data: response.data,
      isCached: false,
      metadata: {
        fetchedAt: new Date().toISOString(),
        source: 'api',
        cacheKey
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch user events: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};
