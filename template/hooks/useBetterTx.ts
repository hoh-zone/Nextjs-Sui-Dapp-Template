'use client'

import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { useNetworkVariables } from "@/contracts";
import { useState } from 'react'

export type BetterSignAndExecuteTransactionProps<TArgs extends unknown[] = unknown[]> = {
    tx: (networkVariables: ReturnType<typeof useNetworkVariables>, ...args: TArgs) => Transaction
    onSuccess?: () => void
    onError?: (error: Error) => void
    onSettled?: () => void
}

export function useBetterSignAndExecuteTransaction<TArgs extends unknown[] = unknown[]>(props: BetterSignAndExecuteTransactionProps<TArgs>) {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
    const [isLoading, setIsLoading] = useState(false)
    const networkVariables = useNetworkVariables()

    const handleSignAndExecuteTransaction = async (...args: TArgs) => {
        const tx = props.tx(networkVariables, ...args)
        setIsLoading(true)
        await signAndExecuteTransaction({ transaction: tx }, {
            onSuccess: async () => {
                await props.onSuccess?.()
            }, onError: (error) => {
                props.onError?.(error)
                setIsLoading(false)
            },onSettled:()=>{
                props.onSettled?.()
                setIsLoading(false)
            }
        })
    }

    return { handleSignAndExecuteTransaction, isLoading }
}

