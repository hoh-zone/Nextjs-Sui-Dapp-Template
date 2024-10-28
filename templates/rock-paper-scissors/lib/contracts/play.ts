import {Transaction} from "@mysten/sui/transactions";
import {FUNCTION, RANDOM, EVENT} from "@/config/key";
import {
    UseMutateAsyncFunction,
    SuiTransactionBlockResponse,
    UseSignAndExecuteTransactionError,
    UseSignAndExecuteTransactionArgs
} from "./type"

type ParsedJson = {
    chosen: number
}

export default async function play(signAndExecuteTransaction: UseMutateAsyncFunction<SuiTransactionBlockResponse, UseSignAndExecuteTransactionError, UseSignAndExecuteTransactionArgs, unknown>) {
    const tx = new Transaction();
    tx.moveCall({
        target: FUNCTION,
        arguments: [
            tx.object(RANDOM)
        ],
    });
    const response = await signAndExecuteTransaction({transaction: tx});
    let chosen = 0;
    response.events?.forEach(event => {
        if (event.type === EVENT) {
            chosen = (event.parsedJson as ParsedJson).chosen;
        }
    });
    return chosen;
}