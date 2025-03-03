/* eslint-disable @typescript-eslint/no-misused-promises */
'use client'

import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useSignTransaction } from '@mysten/dapp-kit'
import { type SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard'
import { useState } from 'react'
import { suiClient } from '@/contracts/index'
import type { CreateSponsoredTransactionApiResponse, SponsorTxRequestBody } from '@/types/sponsorTx'
import { fromBase64, toBase64 } from '@mysten/sui/utils'
import axios from 'axios'


export type BetterSignAndExecuteTransactionProps<TArgs extends unknown[] = unknown[]> = {
    tx: (...args: TArgs) => Transaction
    waitForTx?: boolean
}

export type BetterSignAndExecuteTransactionWithSponsorProps<TArgs extends unknown[] = unknown[]> = {
    tx: (...args: TArgs) => Transaction
}

interface TransactionChain {
    onSuccess: (callback: (result: SuiSignAndExecuteTransactionOutput | CreateSponsoredTransactionApiResponse | undefined) => void | Promise<void>) => TransactionChain
    onError: (callback: (error: Error) => void) => TransactionChain
    onSettled: (callback: (result: SuiSignAndExecuteTransactionOutput | CreateSponsoredTransactionApiResponse | undefined) => void | Promise<void>) => TransactionChain
    execute: () => Promise<void | CreateSponsoredTransactionApiResponse>
}

export function useBetterSignAndExecuteTransaction<TArgs extends unknown[] = unknown[]>({ tx, waitForTx = true }: BetterSignAndExecuteTransactionProps<TArgs>) {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
    const [isLoading, setIsLoading] = useState(false)

    const handleSignAndExecuteTransaction = (...args: TArgs): TransactionChain => {
        const txInput = tx(...args)
        let successCallback: ((result: SuiSignAndExecuteTransactionOutput | undefined) => void | Promise<void>) | undefined
        let errorCallback: ((error: Error) => void) | undefined
        let settledCallback: ((result: SuiSignAndExecuteTransactionOutput | undefined) => void | Promise<void>) | undefined

        const chain: TransactionChain = {
            onSuccess: (callback) => {
                successCallback = callback
                return chain
            },
            onError: (callback) => {
                errorCallback = callback
                return chain
            },
            onSettled: (callback) => {
                settledCallback = callback
                return chain
            },
            execute: async () => {
                setIsLoading(true)
                signAndExecuteTransaction({ transaction: txInput }, {
                    onSuccess: async (result) => {
                        if (waitForTx) {
                            await suiClient.waitForTransaction({ digest: result.digest })
                        }
                        await successCallback?.(result)
                    },
                    onError: (error) => {
                        errorCallback?.(error)
                    },
                    onSettled: async (result) => {
                        await settledCallback?.(result)
                        setIsLoading(false)
                    }
                })
            }
        }

        return chain
    }

    return { handleSignAndExecuteTransaction, isLoading }
}

export function useBetterSignAndExecuteTransactionWithSponsor<TArgs extends unknown[] = unknown[]>(props: BetterSignAndExecuteTransactionWithSponsorProps<TArgs>) {
    const { mutateAsync: signTransactionBlock } = useSignTransaction()
    const [isLoading, setIsLoading] = useState(false)

    const handleSignAndExecuteTransactionWithSponsor = (
        network: "mainnet" | "testnet",
        sender: string,
        allowedAddresses?: string[],
        ...args: TArgs
    ): TransactionChain => {
        let successCallback: ((result: CreateSponsoredTransactionApiResponse) => void | Promise<void>) | undefined
        let errorCallback: ((error: Error) => void) | undefined
        let settledCallback: ((result: CreateSponsoredTransactionApiResponse | undefined) => void | Promise<void>) | undefined

        const chain: TransactionChain = {
            onSuccess: (callback) => {
                successCallback = callback
                return chain
            },
            onError: (callback) => {
                errorCallback = callback
                return chain
            },
            onSettled: (callback) => {
                settledCallback = callback
                return chain
            },
            execute: async () => {
                setIsLoading(true)
                try {
                    const txInput = props.tx(...args)
                    const txBytesPromise = await txInput.build({
                        client: suiClient,
                        onlyTransactionKind: true,
                    })
                    const txBytes = toBase64(txBytesPromise)

                    const sponsorTxBody: SponsorTxRequestBody = {
                        network,
                        txBytes,
                        sender,
                        allowedAddresses,
                    }

                    const { data: sponsorResponse } = await axios.post<CreateSponsoredTransactionApiResponse>("/api/sponsored", sponsorTxBody)

                    const { bytes, digest: sponsorDigest } = sponsorResponse

                    const { signature } = await signTransactionBlock({
                        transaction: Transaction.from(fromBase64(bytes)),
                        chain: `sui:${network}`,
                    })

                    const executeSponsoredTxBody = {
                        digest: sponsorDigest,
                        signature,
                    }

                    const { data: executeSponsoredTxResponse } = await axios.post<CreateSponsoredTransactionApiResponse>("/api/execute", executeSponsoredTxBody)

                    await successCallback?.(executeSponsoredTxResponse)
                    await settledCallback?.(executeSponsoredTxResponse)
                    return executeSponsoredTxResponse
                } catch (error) {
                    const typedError = error instanceof Error ? error : new Error(String(error))
                    errorCallback?.(typedError)
                    await settledCallback?.(undefined)
                } finally {
                    setIsLoading(false)
                }
            }
        }

        return chain
    }

    return { handleSignAndExecuteTransactionWithSponsor, isLoading }
}


