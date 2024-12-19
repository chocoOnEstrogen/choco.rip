import { BskyAgent } from '@atproto/api'
import NodeCache = require('node-cache')

const cache = new NodeCache({ stdTTL: 300 }) // 5 minute cache

interface BProfileOptions {
	username: string
	limit: number
}

interface BskyResponse {
	posts: Post[]
	profile: Profile
	error: string | null
	cache_key: string
}

interface Post {
	uri: string
	cid: string
	author: Author
	record: Record
	embed?: Embed
	replyCount: number
	repostCount: number
	likeCount: number
	quoteCount: number
	indexedAt: string
	viewer: PostViewer
	labels: any[]
}

interface Author {
	did: string
	handle: string
	displayName: string
	avatar: string
	associated: {
		chat: {
			allowIncoming: string
		}
	}
	viewer: AuthorViewer
	labels: any[]
	createdAt: string
}

interface AuthorViewer {
	muted: boolean
	blockedBy: boolean
	following?: string
	followedBy?: string
}

interface Record {
	$type: string
	createdAt: string
	text: string
	langs?: string[]
	embed?: RecordEmbed
	facets?: Facet[]
	reply?: {
		parent: {
			cid: string
			uri: string
		}
		root: {
			cid: string
			uri: string
		}
	}
}

interface Facet {
	features: FacetFeature[]
	index: {
		byteEnd: number
		byteStart: number
	}
}

interface FacetFeature {
	$type: string
	uri?: string
	did?: string
	tag?: string
}

interface RecordEmbed {
	$type: string
	external?: {
		description: string
		thumb?: {
			$type: string
			ref: {
				$link: string
			}
			mimeType: string
			size: number
		}
		title: string
		uri: string
	}
	images?: EmbedImage[]
	media?: {
		$type: string
		external?: RecordEmbed['external']
	}
	record?: {
		$type: string
		record: {
			cid: string
			uri: string
		}
	}
}

interface EmbedImage {
	alt: string
	aspectRatio: {
		height: number
		width: number
	}
	image: {
		$type: string
		ref: {
			$link: string
		}
		mimeType: string
		size: number
	}
}

interface Embed {
	$type: string
	external?: {
		uri: string
		title: string
		description: string
		thumb: string
	}
	images?: {
		thumb: string
		fullsize: string
		alt: string
		aspectRatio: {
			height: number
			width: number
		}
	}[]
	record?: {
		record: EmbedRecord
	}
}

interface EmbedRecord {
	$type: string
	uri: string
	cid: string
	author: Author
	value: Record
	labels: any[]
	likeCount: number
	replyCount: number
	repostCount: number
	quoteCount: number
	indexedAt: string
	embeds: Embed[]
}

interface PostViewer {
	repost?: string
	like?: string
	threadMuted: boolean
	embeddingDisabled: boolean
	pinned?: boolean
}

interface Profile {
	did: string
	handle: string
	displayName: string
	avatar: string
	associated: {
		lists: number
		feedgens: number
		starterPacks: number
		labeler: boolean
		chat: {
			allowIncoming: string
		}
	}
	viewer: ProfileViewer
	labels: any[]
	createdAt: string
	description: string
	indexedAt: string
	banner: string
	followersCount: number
	followsCount: number
	postsCount: number
	pinnedPost?: {
		cid: string
		uri: string
	}
}

interface ProfileViewer {
	muted: boolean
	blockedBy: boolean
	knownFollowers: {
		count: number
		followers: Author[]
	}
}

export default class BskyService {
	private agent: BskyAgent
	private identifier: string
	private password: string

	constructor() {
		if (!process.env.BLUESKY_IDENTIFIER || !process.env.BLUESKY_PASSWORD) {
			throw new Error('BLUESKY_IDENTIFIER and BLUESKY_PASSWORD must be set')
		}

		this.agent = new BskyAgent({
			service: 'https://bsky.social',
		})

		this.identifier = process.env.BLUESKY_IDENTIFIER
		this.password = process.env.BLUESKY_PASSWORD
	}

	async login() {
		await this.agent.login({
			identifier: this.identifier,
			password: this.password,
		})
	}

	async getProfile(options: BProfileOptions) {
		try {
			const cacheKey = `bsky_profile_${options.username}_${options.limit}`
			const cached = cache.get(cacheKey)
			if (cached) return cached as BskyResponse

			const postsResponse = await this.agent.getAuthorFeed({
				actor: options.username,
				limit: options.limit,
			})

			const profileResponse = await this.agent.getProfile({
				actor: options.username,
			})

			const posts = postsResponse.data.feed.map((item) => item.post)
			const profile = profileResponse.data

			cache.set(cacheKey, { posts, profile })

			return {
				posts,
				profile,
				error: null,
				cache_key: cacheKey,
			}
		} catch (error) {
			return {
				posts: [],
				profile: null,
				error: (error as Error).message,
				cache_key: null,
			}
		}
	}
}
