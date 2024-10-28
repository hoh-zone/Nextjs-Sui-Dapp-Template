import {UseMutateFunction, UseMutateAsyncFunction} from "@tanstack/react-query";
import {SuiTransactionBlockResponse} from "@mysten/sui/client";
import type { SuiSignAndExecuteTransactionInput } from '@mysten/wallet-standard';
import { PartialBy } from "@mysten/dapp-kit/dist/cjs/types/utilityTypes";
import { WalletFeatureNotSupportedError, WalletNoAccountSelectedError, WalletNotConnectedError } from "@mysten/dapp-kit/dist/cjs/errors/walletErrors";
import {Transaction} from "@mysten/sui/transactions";

type UseSignAndExecuteTransactionError = WalletFeatureNotSupportedError | WalletNoAccountSelectedError | WalletNotConnectedError | Error;
type UseSignAndExecuteTransactionArgs = PartialBy<Omit<SuiSignAndExecuteTransactionInput, 'transaction'>, 'account' | 'chain'> & {
    transaction: Transaction | string;
};

export type {
    UseMutateFunction,
    UseMutateAsyncFunction,
    SuiTransactionBlockResponse,
    UseSignAndExecuteTransactionError,
    UseSignAndExecuteTransactionArgs,

}