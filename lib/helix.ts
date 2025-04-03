import os from 'os';
import crypto from 'crypto';

/**
 * Helix - A high-performance distributed unique ID and token generator
 * 
 * Features:
 * - Generates unique, sortable, distributed IDs (Snowflake format)
 * - Creates secure, verifiable tokens with embedded metadata
 * - Handles clock drift and sequence overflow
 * - Provides instance isolation via worker IDs
 * - Supports ID/token decoding and validation
 * 
 * ID Structure (64 bits):
 * - 42 bits: Timestamp (milliseconds since custom epoch)
 * - 10 bits: Worker/Instance ID (supports up to 1024 instances)
 * - 12 bits: Sequence number (up to 4096 IDs per millisecond)
 * 
 * Token Format:
 * [Base64URL(Version + Data)][Base64URL(Entropy)][Base64URL(HMAC Signature)]
 * 
 * COPY FROM https://github.com/VTubersTV/node-utils/blob/master/src/classes/Helix.ts
 */

/**
 * Custom error class for Helix-specific errors
 */
export class HelixError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'HelixError';
    }
}

/**
 * Main Helix class for generating distributed IDs and secure tokens
 */
export class Helix {
    // Custom epoch (2015-01-01T00:00:00.000Z)
    private static readonly EPOCH = 1420070400000;

    // Bit allocation
    private static readonly TIMESTAMP_BITS = 42;
    private static readonly WORKER_ID_BITS = 10; 
    private static readonly SEQUENCE_BITS = 12;

    // Derived constants
    private static readonly MAX_WORKER_ID = (1 << Helix.WORKER_ID_BITS) - 1;
    private static readonly MAX_SEQUENCE = (1 << Helix.SEQUENCE_BITS) - 1;
    private static readonly TIMESTAMP_SHIFT = Helix.WORKER_ID_BITS + Helix.SEQUENCE_BITS;
    private static readonly WORKER_ID_SHIFT = Helix.SEQUENCE_BITS;

    // Token configuration
    private static readonly TOKEN_VERSION = 1;
    private static readonly TOKEN_SECRET = process.env.HELIX_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
    private static readonly TOKEN_HMAC_ALGO = 'sha256';
    private static readonly TOKEN_HMAC_LENGTH = 8;

    private readonly workerId: number;
    private sequence: number;
    private lastTimestamp: number;
    private readonly startTime: number;

    /**
     * Creates a new Helix instance
     * @param workerId Optional manual worker ID override (0-1023)
     * @throws {HelixError} If worker ID exceeds maximum allowed value
     */
    constructor(workerId?: number) {
        this.startTime = Date.now();
        this.sequence = 0;
        this.lastTimestamp = -1;

        // Allow manual worker ID override, otherwise auto-generate
        this.workerId = workerId ?? Helix.generateWorkerId();

        if (this.workerId > Helix.MAX_WORKER_ID) {
            throw new HelixError(
                `Worker ID ${this.workerId} exceeds maximum allowed value ${Helix.MAX_WORKER_ID}`
            );
        }
    }

    /**
     * Generates a unique 64-bit ID in Snowflake format
     * @returns A string representation of the generated ID
     */
    public generateId(): string {
        const id = this.nextId();
        return id.toString();
    }

    /**
     * Creates a secure token containing an ID and metadata
     * @param data Optional data to embed in the token
     * @returns A secure token string in the format: payload.entropy.signature
     */
    public generateToken(data?: Buffer | string | object): string {
        const id = this.nextId();
        return this.createToken(id, data);
    }

    /**
     * Core ID generation logic
     * @returns A unique 64-bit BigInt ID
     * @throws {HelixError} If clock drift is detected
     */
    private nextId(): bigint {
        let timestamp = Date.now();
        const drift = timestamp - this.startTime;

        if (drift < 0) {
            throw new HelixError(
                `Clock drift detected - system time moved backwards by ${-drift}ms`
            );
        }

        if (timestamp === this.lastTimestamp) {
            this.sequence = (this.sequence + 1) & Helix.MAX_SEQUENCE;
            if (this.sequence === 0) {
                timestamp = this.waitForNextMillis(timestamp);
            }
        } else {
            this.sequence = 0;
        }

        this.lastTimestamp = timestamp;

        return (BigInt(timestamp - Helix.EPOCH) << BigInt(Helix.TIMESTAMP_SHIFT)) |
               (BigInt(this.workerId) << BigInt(Helix.WORKER_ID_SHIFT)) |
               BigInt(this.sequence);
    }

    /**
     * Creates a secure token with embedded data
     * @param id The BigInt ID to embed in the token
     * @param data Optional data to embed in the token
     * @returns A secure token string in the format: payload.entropy.signature
     */
    private createToken(id: bigint, data?: Buffer | string | object): string {
        // Convert data to buffer if provided
        let dataBuffer: Buffer;
        if (data instanceof Buffer) {
            dataBuffer = data;
        } else if (typeof data === 'string') {
            dataBuffer = Buffer.from(data);
        } else if (data) {
            dataBuffer = Buffer.from(JSON.stringify(data));
        } else {
            dataBuffer = Buffer.alloc(0);
        }

        // Calculate total payload size
        const payloadSize = 1 + 8 + dataBuffer.length; // version + id + data
        const buffer = Buffer.alloc(payloadSize + 16); // payload + entropy

        let offset = 0;

        // Write token version (1 byte)
        buffer.writeUInt8(Helix.TOKEN_VERSION, offset++);

        // Write ID (8 bytes)
        buffer.writeBigUInt64BE(id, offset);
        offset += 8;

        // Write data if provided
        if (dataBuffer.length > 0) {
            dataBuffer.copy(buffer, offset);
            offset += dataBuffer.length;
        }

        // Write entropy (16 bytes)
        crypto.randomFillSync(buffer, offset, 16);

        // Generate HMAC signature
        const hmac = crypto.createHmac(Helix.TOKEN_HMAC_ALGO, Helix.TOKEN_SECRET)
            .update(buffer)
            .digest()
            .slice(0, Helix.TOKEN_HMAC_LENGTH);

        // Encode token parts
        const payload = buffer.slice(0, offset).toString('base64url');
        const entropy = buffer.slice(offset, offset + 16).toString('base64url');
        const signature = hmac.toString('base64url');

        return `${payload}.${entropy}.${signature}`;
    }

    /**
     * Decodes and validates a token, returning its components
     * @param token The token string to decode
     * @returns Object containing decoded token components
     * @throws {HelixError} If token format is invalid or signature verification fails
     */
    public static decodeToken(token: string): {
        id: string;
        version: number;
        data?: Buffer;
        timestamp: Date;
        workerId: number;
        sequence: number;
    } {
        const parts = token.split('.');
        
        if (parts.length !== 3) {
            throw new HelixError('Invalid token format');
        }

        try {
            const [payload, entropy, signature] = parts;

            // Reconstruct original buffer
            const payloadBuffer = Buffer.from(payload, 'base64url');
            const entropyBuffer = Buffer.from(entropy, 'base64url');
            const buffer = Buffer.concat([payloadBuffer, entropyBuffer]);

            // Verify signature
            const hmac = crypto.createHmac(Helix.TOKEN_HMAC_ALGO, Helix.TOKEN_SECRET)
                .update(buffer)
                .digest()
                .slice(0, Helix.TOKEN_HMAC_LENGTH);

            if (hmac.toString('base64url') !== signature) {
                throw new HelixError('Invalid token signature');
            }

            // Extract data
            const version = buffer.readUInt8(0);
            const id = buffer.readBigUInt64BE(1);
            
            // Extract any additional data
            const data = payloadBuffer.length > 9 ? payloadBuffer.slice(9) : undefined;

            // Decode the ID components
            const decoded = this.decodeId(id);

            return {
                version,
                id: id.toString(),
                data,
                ...decoded
            };
        } catch (err) {
            throw new HelixError('Failed to decode token');
        }
    }

    /**
     * Decodes a Snowflake ID into its components
     * @param id The BigInt ID to decode
     * @returns Object containing timestamp, worker ID and sequence number
     */
    public static decodeId(id: bigint): {
        timestamp: Date;
        workerId: number;
        sequence: number;
    } {
        const timestamp = Number(id >> BigInt(Helix.TIMESTAMP_SHIFT)) + Helix.EPOCH;
        const workerId = Number((id >> BigInt(Helix.WORKER_ID_SHIFT)) & BigInt(Helix.MAX_WORKER_ID));
        const sequence = Number(id & BigInt(Helix.MAX_SEQUENCE));

        return {
            timestamp: new Date(timestamp),
            workerId,
            sequence
        };
    }

    /**
     * Waits until the next millisecond
     * @param currentTime Current timestamp in milliseconds
     * @returns Next millisecond timestamp
     */
    private waitForNextMillis(currentTime: number): number {
        let timestamp = Date.now();
        while (timestamp <= currentTime) {
            timestamp = Date.now();
        }
        return timestamp;
    }

    /**
     * Generates a deterministic worker ID based on environment
     * @returns A worker ID between 0 and MAX_WORKER_ID
     */
    private static generateWorkerId(): number {
        try {
            // Try Vercel deployment ID first
            const vercelId = process.env.VERCEL_DEPLOYMENT_ID;
            if (vercelId) {
                return this.hashToWorkerId(vercelId);
            }

            // Try Kubernetes pod name
            const podName = process.env.KUBERNETES_POD_NAME;
            if (podName) {
                return this.hashToWorkerId(podName);
            }

            // Fallback to hostname + PID + uptime + memory usage for better uniqueness
            const hostIdentifier = `${os.hostname()}:${process.pid}:${os.uptime()}:${process.memoryUsage().heapUsed}`;
            return this.hashToWorkerId(hostIdentifier);

        } catch (error) {
            // Ultimate fallback - random but stable for process lifetime
            // Use a more cryptographically secure method
            const buffer = crypto.randomBytes(4);
            return buffer.readUInt32BE(0) & Helix.MAX_WORKER_ID;
        }
    }

    /**
     * Converts a string input into a valid worker ID
     * @param input String to hash into a worker ID
     * @returns A worker ID between 0 and MAX_WORKER_ID
     */
    private static hashToWorkerId(input: string): number {
        const hash = crypto.createHash('sha256').update(input).digest();
        return hash.readUInt32BE(0) & Helix.MAX_WORKER_ID;
    }
}