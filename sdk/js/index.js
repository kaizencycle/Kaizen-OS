/**
 * Civic Protocol Core - JavaScript SDK
 * 
 * A JavaScript client library for interacting with the Civic Ledger API.
 * Provides easy-to-use methods for managing reflections, attestations, and votes.
 */

class CivicClient {
    /**
     * Initialize the Civic client
     * @param {string} baseUrl - Base URL of the Civic Ledger API
     * @param {string} apiKey - Optional API key for authentication
     */
    constructor(baseUrl = 'http://localhost:5411', apiKey = null) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.apiKey = apiKey;
        this.headers = {
            'Content-Type': 'application/json'
        };
        
        if (apiKey) {
            this.headers['X-API-Key'] = apiKey;
        }
    }

    /**
     * Make an HTTP request to the API
     * @param {string} method - HTTP method
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     */
    async _makeRequest(method, endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            method,
            headers: this.headers,
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(`API request failed: ${error.message}`);
        }
    }

    /**
     * Add a new reflection
     * @param {Object} reflectionData - Reflection data
     * @param {string} reflectionData.title - Reflection title
     * @param {string} reflectionData.body - Reflection content
     * @param {string[]} reflectionData.tags - List of tags
     * @param {string} reflectionData.visibility - Visibility level (private/public)
     * @param {string} reflectionData.companionId - Optional companion ID for AI-authored reflections
     * @returns {Promise<Object>} Created reflection object
     */
    async addReflection(reflectionData) {
        const data = {
            title: reflectionData.title,
            body: reflectionData.body,
            tags: reflectionData.tags || [],
            visibility: reflectionData.visibility || 'private',
            companion_id: reflectionData.companionId
        };

        return await this._makeRequest('POST', '/reflections', {
            body: JSON.stringify(data)
        });
    }

    /**
     * List reflections with optional filtering
     * @param {Object} options - Filtering options
     * @param {string} options.author - Filter by author citizen ID
     * @param {string} options.visibility - Filter by visibility level
     * @param {string[]} options.tags - Filter by tags
     * @param {number} options.limit - Maximum number of reflections to return
     * @param {number} options.offset - Number of reflections to skip
     * @returns {Promise<Object>} Dictionary containing reflections list and metadata
     */
    async listReflections(options = {}) {
        const params = new URLSearchParams();
        
        if (options.author) params.append('author', options.author);
        if (options.visibility) params.append('visibility', options.visibility);
        if (options.tags) params.append('tags', options.tags.join(','));
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());

        const queryString = params.toString();
        const endpoint = queryString ? `/reflections?${queryString}` : '/reflections';
        
        return await this._makeRequest('GET', endpoint);
    }

    /**
     * Get a specific reflection by ID
     * @param {string} refId - Reflection ID
     * @returns {Promise<Object>} Reflection object
     */
    async getReflection(refId) {
        return await this._makeRequest('GET', `/reflections/${refId}`);
    }

    /**
     * Add a new attestation
     * @param {Object} attestationData - Attestation data
     * @param {string} attestationData.subject - Citizen ID of the subject
     * @param {string} attestationData.type - Type of attestation
     * @param {string} attestationData.contentHash - Hash of content being attested
     * @param {string} attestationData.attester - Citizen ID of the attester
     * @param {Object} attestationData.metadata - Additional attestation metadata
     * @returns {Promise<Object>} Created attestation object
     */
    async addAttestation(attestationData) {
        const data = {
            subject: attestationData.subject,
            type: attestationData.type,
            content_hash: attestationData.contentHash,
            attester: attestationData.attester,
            metadata: attestationData.metadata
        };

        return await this._makeRequest('POST', '/attestations', {
            body: JSON.stringify(data)
        });
    }

    /**
     * List attestations with optional filtering
     * @param {Object} options - Filtering options
     * @param {string} options.attester - Filter by attester citizen ID
     * @param {string} options.subject - Filter by subject citizen ID
     * @param {string} options.type - Filter by attestation type
     * @param {number} options.limit - Maximum number of attestations to return
     * @param {number} options.offset - Number of attestations to skip
     * @returns {Promise<Object>} Dictionary containing attestations list and metadata
     */
    async listAttestations(options = {}) {
        const params = new URLSearchParams();
        
        if (options.attester) params.append('attester', options.attester);
        if (options.subject) params.append('subject', options.subject);
        if (options.type) params.append('type', options.type);
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());

        const queryString = params.toString();
        const endpoint = queryString ? `/attestations?${queryString}` : '/attestations';
        
        return await this._makeRequest('GET', endpoint);
    }

    /**
     * Cast a vote in the Agora governance system
     * @param {Object} voteData - Vote data
     * @param {string} voteData.proposalId - ID of the proposal
     * @param {string} voteData.choice - Vote choice (yes/no/abstain)
     * @param {string} voteData.voter - Citizen ID of the voter
     * @param {string} voteData.memo - Optional vote explanation
     * @returns {Promise<Object>} Vote object
     */
    async castVote(voteData) {
        const data = {
            proposal_id: voteData.proposalId,
            choice: voteData.choice,
            voter: voteData.voter,
            memo: voteData.memo
        };

        return await this._makeRequest('POST', '/agora/votes', {
            body: JSON.stringify(data)
        });
    }

    /**
     * List votes with optional filtering
     * @param {Object} options - Filtering options
     * @param {string} options.proposalId - Filter by proposal ID
     * @param {string} options.voter - Filter by voter citizen ID
     * @param {number} options.limit - Maximum number of votes to return
     * @returns {Promise<Object>} Dictionary containing votes list and metadata
     */
    async listVotes(options = {}) {
        const params = new URLSearchParams();
        
        if (options.proposalId) params.append('proposal_id', options.proposalId);
        if (options.voter) params.append('voter', options.voter);
        if (options.limit) params.append('limit', options.limit.toString());

        const queryString = params.toString();
        const endpoint = queryString ? `/agora/votes?${queryString}` : '/agora/votes';
        
        return await this._makeRequest('GET', endpoint);
    }

    /**
     * List civic cycles with optional filtering
     * @param {Object} options - Filtering options
     * @param {string} options.date - Filter by cycle date (YYYY-MM-DD)
     * @param {string} options.status - Filter by cycle status
     * @param {number} options.limit - Maximum number of cycles to return
     * @returns {Promise<Object>} Dictionary containing cycles list and metadata
     */
    async listCycles(options = {}) {
        const params = new URLSearchParams();
        
        if (options.date) params.append('date', options.date);
        if (options.status) params.append('status', options.status);
        if (options.limit) params.append('limit', options.limit.toString());

        const queryString = params.toString();
        const endpoint = queryString ? `/cycles?${queryString}` : '/cycles';
        
        return await this._makeRequest('GET', endpoint);
    }

    /**
     * Get GIC balance for an address
     * @param {string} address - Citizen or companion address
     * @returns {Promise<Object>} Balance object
     */
    async getBalance(address) {
        return await this._makeRequest('GET', `/balance/${address}`);
    }

    /**
     * Get GIC earning events for an address
     * @param {string} address - Citizen or companion address
     * @param {Object} options - Filtering options
     * @param {string} options.date - Filter by date (YYYY-MM-DD)
     * @param {number} options.limit - Maximum number of events to return
     * @returns {Promise<Object>} Dictionary containing earn events list and metadata
     */
    async getEarnEvents(address, options = {}) {
        const params = new URLSearchParams();
        params.append('address', address);
        
        if (options.date) params.append('date', options.date);
        if (options.limit) params.append('limit', options.limit.toString());

        const queryString = params.toString();
        const endpoint = `/earn/events?${queryString}`;
        
        return await this._makeRequest('GET', endpoint);
    }
}

// Convenience functions for quick usage
/**
 * Create a new Civic client instance
 * @param {string} baseUrl - Base URL of the Civic Ledger API
 * @param {string} apiKey - Optional API key for authentication
 * @returns {CivicClient} New client instance
 */
function createClient(baseUrl = 'http://localhost:5411', apiKey = null) {
    return new CivicClient(baseUrl, apiKey);
}

/**
 * Quickly add a reflection using the default client
 * @param {string} title - Reflection title
 * @param {string} body - Reflection content
 * @param {string[]} tags - List of tags
 * @param {string} visibility - Visibility level
 * @returns {Promise<Object>} Created reflection
 */
async function quickReflection(title, body, tags = [], visibility = 'private') {
    const client = createClient();
    return await client.addReflection({ title, body, tags, visibility });
}

/**
 * Quickly cast a vote using the default client
 * @param {string} proposalId - Proposal ID
 * @param {string} choice - Vote choice
 * @returns {Promise<Object>} Vote object
 */
async function quickVote(proposalId, choice) {
    const client = createClient();
    return await client.castVote({ proposalId, choice });
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = {
        CivicClient,
        createClient,
        quickReflection,
        quickVote
    };
} else if (typeof window !== 'undefined') {
    // Browser global
    window.CivicClient = CivicClient;
    window.createClient = createClient;
    window.quickReflection = quickReflection;
    window.quickVote = quickVote;
}

// Example usage (only runs in Node.js or when explicitly called)
if (typeof window === 'undefined' && typeof process !== 'undefined') {
    // Example usage of the Civic client
    async function example() {
        try {
            const client = new CivicClient();
            
            // Add a reflection
            const reflection = await client.addReflection({
                title: "Cycle 0 Hello",
                body: "We heal as we walk.",
                tags: ["hello", "cycle0"],
                visibility: "public"
            });
            console.log(`Created reflection: ${reflection.ref_id}`);
            
            // List reflections
            const reflections = await client.listReflections({ limit: 10 });
            console.log(`Found ${reflections.total} reflections`);
            
            // Get balance
            const balance = await client.getBalance("citizen_001");
            console.log(`Balance: ${balance.balance} GIC`);
            
        } catch (error) {
            console.error('Example failed:', error.message);
        }
    }
    
    // Run example if this file is executed directly
    if (require.main === module) {
        example();
    }
}
