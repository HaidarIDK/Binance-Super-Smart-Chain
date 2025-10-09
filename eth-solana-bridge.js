// Ethereum to Solana Address Bridge
// Maps Ethereum addresses (0x...) to Solana addresses for BSSC

const crypto = require('crypto');
const fs = require('fs');
const bs58 = require('bs58').default;

// Address mapping storage
const addressMappings = new Map();

/**
 * Derive a Solana address from an Ethereum address
 * This creates a deterministic mapping so the same ETH address always maps to the same Solana address
 */
function ethAddressToSolanaAddress(ethAddress) {
    // Remove 0x prefix if present
    const cleanEthAddress = ethAddress.toLowerCase().replace('0x', '');
    
    // Check if we already have a mapping
    if (addressMappings.has(cleanEthAddress)) {
        return addressMappings.get(cleanEthAddress);
    }
    
    // Create deterministic Solana address from Ethereum address
    // Use SHA256 hash of the Ethereum address as seed
    const seed = crypto.createHash('sha256')
        .update(Buffer.from(cleanEthAddress, 'hex'))
        .digest();
    
    // Solana addresses are 32 bytes, we'll use the hash as the public key
    const solanaAddress = bs58.encode(seed);
    
    // Store mapping
    addressMappings.set(cleanEthAddress, solanaAddress);
    
    return solanaAddress;
}

/**
 * Convert Solana address back to Ethereum address (if it was derived from one)
 */
function solanaAddressToEthAddress(solanaAddress) {
    // Search through mappings
    for (const [ethAddr, solAddr] of addressMappings.entries()) {
        if (solAddr === solanaAddress) {
            return '0x' + ethAddr;
        }
    }
    return null; // Not a mapped address
}

/**
 * Check if an address is Ethereum format
 */
function isEthereumAddress(address) {
    return address.startsWith('0x') && address.length === 42;
}

/**
 * Check if an address is Solana format
 */
function isSolanaAddress(address) {
    return !address.startsWith('0x') && address.length >= 32 && address.length <= 44;
}

/**
 * Normalize address - convert ETH to Solana if needed
 */
function normalizeAddress(address) {
    if (isEthereumAddress(address)) {
        return ethAddressToSolanaAddress(address);
    }
    return address;
}

/**
 * Format address for display based on user's wallet type
 */
function formatAddressForUser(solanaAddress, preferEthFormat = false) {
    if (preferEthFormat) {
        const ethAddr = solanaAddressToEthAddress(solanaAddress);
        if (ethAddr) return ethAddr;
    }
    return solanaAddress;
}

/**
 * Save mappings to file
 */
function saveMappings(filename = 'address-mappings.json') {
    const mappingsObj = Object.fromEntries(addressMappings);
    fs.writeFileSync(filename, JSON.stringify(mappingsObj, null, 2));
}

/**
 * Load mappings from file
 */
function loadMappings(filename = 'address-mappings.json') {
    try {
        if (fs.existsSync(filename)) {
            const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
            Object.entries(data).forEach(([eth, sol]) => {
                addressMappings.set(eth, sol);
            });
            console.log('Loaded', addressMappings.size, 'address mappings');
        }
    } catch (error) {
        console.error('Error loading address mappings:', error.message);
    }
}

// Load mappings on startup
loadMappings();

// Auto-save mappings every 30 seconds
setInterval(() => saveMappings(), 30000);

module.exports = {
    ethAddressToSolanaAddress,
    solanaAddressToEthAddress,
    isEthereumAddress,
    isSolanaAddress,
    normalizeAddress,
    formatAddressForUser,
    saveMappings,
    loadMappings
};
