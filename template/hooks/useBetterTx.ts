'use client'

import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useSignTransaction } from '@mysten/dapp-kit'
import { useState, useCallback } from 'react'
import { getNetworkVariables, network, NetworkVariables, suiClient } from '@/contracts'
import { CreateSponsoredTransactionApiResponse, SponsorTxRequestBody } from '@/types/sponsorTx'
import { fromBase64, toBase64 } from '@mysten/sui/utils'
import { SuiTransactionBlockResponse, SuiTransactionBlockResponseOptions } from '@mysten/sui/client'

// 统一的类型定义
export type TransactionFunction<TArgs extends unknown[] = unknown[]> = (...args: TArgs) => Transaction
export type AsyncTransactionFunction<TArgs extends unknown[] = unknown[]> = (...args: TArgs) => Promise<Transaction>

export type BaseTransactionProps<TArgs extends unknown[] = unknown[]> = {
    tx: TransactionFunction<TArgs>
    options?: SuiTransactionBlockResponseOptions
    waitForTransaction?: boolean
}

export type AsyncTransactionProps<TArgs extends unknown[] = unknown[]> = {
    tx: AsyncTransactionFunction<TArgs>
    options?: SuiTransactionBlockResponseOptions
    waitForTransaction?: boolean
}

export type SponsorTransactionProps<TArgs extends unknown[] = unknown[]> = {
    tx: TransactionFunction<TArgs>
}

// 优化后的TransactionChain接口
interface TransactionChain<TResult = SuiTransactionBlockResponse | CreateSponsoredTransactionApiResponse | undefined> {
    beforeExecute: (callback: () => Promise<boolean | void>) => TransactionChain<TResult>
    onSuccess: (callback: (result: TResult) => void | Promise<void>) => TransactionChain<TResult>
    onError: (callback: (error: Error) => void) => TransactionChain<TResult>
    onSettled: (callback: (result: TResult) => void | Promise<void>) => TransactionChain<TResult>
    execute: () => Promise<TResult | void>
}

// 提取公共的回调管理器
class CallbackManager<TResult> {
    private successCallback?: (result: TResult) => void | Promise<void>
    private errorCallback?: (error: Error) => void
    private settledCallback?: (result: TResult) => void | Promise<void>
    private beforeExecuteCallback?: () => Promise<boolean | void>

    setBeforeExecute(callback: () => Promise<boolean | void>) {
        this.beforeExecuteCallback = callback
    }

    setOnSuccess(callback: (result: TResult) => void | Promise<void>) {
        this.successCallback = callback
    }

    setOnError(callback: (error: Error) => void) {
        this.errorCallback = callback
    }

    setOnSettled(callback: (result: TResult) => void | Promise<void>) {
        this.settledCallback = callback
    }

    async executeBeforeExecute(): Promise<boolean> {
        const validationResult = await this.beforeExecuteCallback?.()
        if (validationResult === false) {
            throw new Error('Validation failed in beforeExecute')
        }
        return true
    }

    async executeOnSuccess(result: TResult) {
        await this.successCallback?.(result)
    }

    executeOnError(error: Error) {
        this.errorCallback?.(error)
    }

    async executeOnSettled(result: TResult) {
        await this.settledCallback?.(result)
    }
}

// 提取公共的TransactionChain创建函数
function createTransactionChain<TResult>(
    executeFunction: () => Promise<TResult | void>
): TransactionChain<TResult> {
    const callbackManager = new CallbackManager<TResult>()

    const chain: TransactionChain<TResult> = {
        beforeExecute: (callback) => {
            callbackManager.setBeforeExecute(callback)
            return chain
        },
        onSuccess: (callback) => {
            callbackManager.setOnSuccess(callback)
            return chain
        },
        onError: (callback) => {
            callbackManager.setOnError(callback)
            return chain
        },
        onSettled: (callback) => {
            callbackManager.setOnSettled(callback)
            return chain
        },
        execute: async () => {
            try {
                await callbackManager.executeBeforeExecute()
                const result = await executeFunction()
                if (result) {
                    await callbackManager.executeOnSuccess(result)
                    await callbackManager.executeOnSettled(result)
                }
                return result
            } catch (error) {
                const typedError = error instanceof Error ? error : new Error(String(error))
                callbackManager.executeOnError(typedError)
                await callbackManager.executeOnSettled(undefined as TResult)
                throw typedError
            }
        }
    }

    return chain
}

// 提取公共的执行配置
const getExecuteOptions = (options?: SuiTransactionBlockResponseOptions) => ({
    showEffects: true,
    showRawEffects: true,
    ...options
})

export function useBetterSignAndExecuteTransaction<TArgs extends unknown[] = unknown[]>({
    tx,
    waitForTransaction = true,
    options
}: BaseTransactionProps<TArgs>) {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
        execute: async ({ bytes, signature }) =>
            await suiClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: getExecuteOptions(options)
            }),
    });
    const [isLoading, setIsLoading] = useState(false)

    const handleSignAndExecuteTransaction = useCallback((...args: TArgs): TransactionChain<SuiTransactionBlockResponse> => {
        const txInput = tx(...args)
        
        const executeFunction = async (): Promise<SuiTransactionBlockResponse | void> => {
            setIsLoading(true)
            try {
                return new Promise<SuiTransactionBlockResponse>((resolve, reject) => {
                    signAndExecuteTransaction({ transaction: txInput }, {
                        onSuccess: async (result) => {
                            try {
                                if (waitForTransaction) {
                                    await suiClient.waitForTransaction({ digest: result.digest })
                                }
                                resolve(result)
                            } catch (error) {
                                reject(error)
                            }
                        },
                        onError: reject,
                        onSettled: () => {
                            setIsLoading(false)
                        }
                    })
                })
            } catch (error) {
                setIsLoading(false)
                throw error
            }
        }

        return createTransactionChain(executeFunction)
    }, [tx, waitForTransaction, signAndExecuteTransaction])

    return { handleSignAndExecuteTransaction, isLoading }
}

export function useBetterSignAndExecuteTransactionAsync<TArgs extends unknown[] = unknown[]>({
    tx,
    waitForTransaction = true,
    options
}: AsyncTransactionProps<TArgs>) {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
        execute: async ({ bytes, signature }) =>
            await suiClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: getExecuteOptions(options)
            }),
    });
    const [isLoading, setIsLoading] = useState(false)

    const handleSignAndExecuteTransaction = useCallback((...args: TArgs): TransactionChain<SuiTransactionBlockResponse> => {
        const executeFunction = async (): Promise<SuiTransactionBlockResponse | void> => {
            setIsLoading(true)
            try {
                const txInput = await tx(...args)
                return new Promise<SuiTransactionBlockResponse>((resolve, reject) => {
                    signAndExecuteTransaction({ transaction: txInput }, {
                        onSuccess: async (result) => {
                            try {
                                if (waitForTransaction) {
                                    await suiClient.waitForTransaction({ digest: result.digest })
                                }
                                resolve(result)
                            } catch (error) {
                                reject(error)
                            }
                        },
                        onError: reject,
                        onSettled: () => {
                            setIsLoading(false)
                        }
                    })
                })
            } catch (error) {
                setIsLoading(false)
                throw error
            }
        }

        return createTransactionChain(executeFunction)
    }, [tx, waitForTransaction, signAndExecuteTransaction])

    return { handleSignAndExecuteTransaction, isLoading }
}

export function useBetterSignAndExecuteTransactionWithSponsor<TArgs extends unknown[] = unknown[]>(
    props: SponsorTransactionProps<TArgs>
) {
    const { mutateAsync: signTransactionBlock } = useSignTransaction()
    const [isLoading, setIsLoading] = useState(false)

    const handleSignAndExecuteTransactionWithSponsor = useCallback((
        network: "devnet" | "testnet" | "mainnet",
        sender: string,
        allowedAddresses?: string[],
        ...args: TArgs
    ): TransactionChain<CreateSponsoredTransactionApiResponse> => {
        
        const executeFunction = async (): Promise<CreateSponsoredTransactionApiResponse | void> => {
            setIsLoading(true)
            try {
                const txInput = props.tx(...args)
                const txBytesPromise = await txInput.build({
                    client: suiClient,
                    onlyTransactionKind: true,
                })
                const txBytes = await toBase64(txBytesPromise)

                const sponsorTxBody: SponsorTxRequestBody = {
                    network,
                    txBytes,
                    sender,
                    allowedAddresses,
                }

                const sponsorResponse = await fetch("/api/sponsored", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sponsorTxBody),
                }).then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`)
                    }
                    return res.json()
                }) as CreateSponsoredTransactionApiResponse

                const { bytes, digest: sponsorDigest } = sponsorResponse

                const { signature } = await signTransactionBlock({
                    transaction: Transaction.from(fromBase64(bytes)),
                    chain: `sui:${network}`,
                })

                const executeSponsoredTxBody = {
                    digest: sponsorDigest,
                    signature,
                }

                const executeSponsoredTxResponse = await fetch("/api/execute", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(executeSponsoredTxBody),
                }).then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`)
                    }
                    return res.json()
                }) as CreateSponsoredTransactionApiResponse

                return executeSponsoredTxResponse
            } finally {
                setIsLoading(false)
            }
        }

        return createTransactionChain(executeFunction)
    }, [props.tx, signTransactionBlock])

    return { handleSignAndExecuteTransactionWithSponsor, isLoading }
}

export function createBetterTxFactory<T extends Record<string, unknown>>(
    fn: (tx: Transaction, networkVariables: NetworkVariables, params: T) => Transaction
) {
    return (params: T) => {
        const tx = new Transaction();
        const networkVariables = getNetworkVariables(network);
        return fn(tx, networkVariables, params);
    };
}

export function createAsyncBetterTxFactory<T extends Record<string, unknown>>(
    fn: (tx: Transaction, networkVariables: NetworkVariables, params: T) => Promise<Transaction>
) {
    return async (params: T) => {
        const tx = new Transaction();
        const networkVariables = getNetworkVariables(network);
        return await fn(tx, networkVariables, params);
    };
}
