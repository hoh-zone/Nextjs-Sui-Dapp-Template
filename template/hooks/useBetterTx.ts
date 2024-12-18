'use client'

import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { useState } from 'react'

export type BetterSignAndExecuteTransactionProps<TArgs extends unknown[] = unknown[]> = {
    tx: (...args: TArgs) => Transaction
    onSuccess?: () => void
    onError?: (error: Error) => void
    onSettled?: () => void
}

export function useBetterSignAndExecuteTransaction<TArgs extends unknown[] = unknown[]>(props: BetterSignAndExecuteTransactionProps<TArgs>) {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
    const [isLoading, setIsLoading] = useState(false)

    const handleSignAndExecuteTransaction = async (...args: TArgs) => {
        const tx = props.tx(...args)
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

