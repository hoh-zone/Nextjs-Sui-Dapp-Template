interface ContractConfig {
    [key: string]: string
}

export function getContractConfig(network: 'testnet' | 'mainnet'): ContractConfig {
    try {
        // Try to load requested network config first
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const contractModule = require(`./contracts_${network}`)
        return contractModule[network]
    } catch (error) {
        // If mainnet config fails, try testnet as fallback
        if (network === 'mainnet') {
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const testnetModule = require('./contracts_testnet')
                return testnetModule.testnet as unknown as ContractConfig
            } catch (testnetError) {
                throw new Error('Failed to load both mainnet and testnet configs', { cause: testnetError })
            }
        }
        // If testnet config fails, throw error
        throw new Error('Failed to load testnet config', { cause: error })
    }
}