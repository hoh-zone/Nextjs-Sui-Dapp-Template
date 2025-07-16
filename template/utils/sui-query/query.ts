import { Transaction } from "@mysten/sui/transactions"
import { suiClient, getNetworkVariables, network } from '@/contracts'
import { normalizeSuiAddress } from "@mysten/sui/utils"
import { baseDecoders, defaultDecoderRegistry, type Decoder, type DecoderInfo } from './decoders'

// 查询结果选择器类型
export type ResultSelector = (results: any[]) => number[] | null

// 联合类型：支持直接的解码器对象或字符串名称
export type DecoderReference<T> = DecoderInfo<T> | Decoder<T> | string

// 通用的直接查询函数
export async function devInspectQuery<T = any>(
    builder: (tx: Transaction) => Transaction,
    decoder?: DecoderReference<T>,
    resultSelector?: ResultSelector
): Promise<T | null> {
    try {
        const tx = new Transaction();
        const queryTx = builder(tx);

        const response = await suiClient.devInspectTransactionBlock({
            transactionBlock: queryTx,
            sender: normalizeSuiAddress("0x0")
        });

        if (response.effects?.status?.status === "failure") {
            return null;
        }
        if (response.error) {
            throw new Error(`Execution error: ${JSON.stringify(response.error)}`);
        }
        if (response.effects?.status?.status !== "success") {
            throw new Error(`Transaction failed: ${JSON.stringify(response.effects?.status?.error)}`);
        }

        // 查找返回数据
        let returnData: number[] | null = null;
        if (resultSelector) {
            returnData = resultSelector(response.results ?? []);
        } else {
            returnData = findReturnData(response.results ?? [], decoder);
        }

        if (returnData) {
            return decodeData(returnData, decoder);
        }
        return null;
    } catch (error) {
        console.error("❌ Query failed:", error);
        return null;
    }
}

// 异步版本的查询函数
export async function devInspectQueryAsync<T = any>(
    builder: (tx: Transaction) => Promise<Transaction>,
    decoder?: DecoderReference<T>,
    resultSelector?: ResultSelector
): Promise<T | null> {
    try {
        const tx = new Transaction();
        const queryTx = await builder(tx);

        const response = await suiClient.devInspectTransactionBlock({
            transactionBlock: queryTx,
            sender: normalizeSuiAddress("0x0")
        });

        if (response.error) {
            throw new Error(`Execution error: ${JSON.stringify(response.error)}`);
        }
        if (response.effects?.status?.status !== "success") {
            throw new Error(`Transaction failed: ${JSON.stringify(response.effects?.status?.error)}`);
        }

        let returnData: number[] | null = null;
        if (resultSelector) {
            returnData = resultSelector(response.results ?? []);
        } else {
            returnData = findReturnData(response.results ?? [], decoder);
        }

        if (returnData) {
            return decodeData(returnData, decoder);
        }
        return null;
    } catch (error) {
        console.error("❌ Query failed:", error);
        return null;
    }
}

// 查找返回数据的辅助函数
function findReturnData<T>(
    results: any[], 
    decoder?: DecoderReference<T>
): number[] | null {
    if (!decoder) {
        // 如果没有指定解码器，返回第一个可用的数据
        for (const res of results) {
            for (const rv of res.returnValues ?? []) {
                if (rv[0]?.length > 0) {
                    return rv[0];
                }
            }
        }
        return null;
    }

    // 如果是 DecoderInfo 对象
    if (typeof decoder === 'object' && 'decoder' in decoder) {
        const decoderInfo = decoder as DecoderInfo<T>;
        
        for (const res of results) {
            for (const rv of res.returnValues ?? []) {
                if (rv[0]?.length > 0) {
                    const dataLength = rv[0].length;
                    const { expectedLength } = decoderInfo;
                    
                    if (expectedLength === undefined) {
                        return rv[0];
                    }
                    
                    if (Array.isArray(expectedLength)) {
                        if (expectedLength.includes(dataLength)) {
                            return rv[0];
                        }
                    } else if (expectedLength === dataLength) {
                        return rv[0];
                    }
                }
            }
        }
        return null;
    }

    // 如果是字符串类型的解码器名称
    if (typeof decoder === 'string') {
        const decoderInfo = defaultDecoderRegistry.get(decoder);
        if (!decoderInfo) {
            console.warn(`❌ Decoder '${decoder}' not found in registry`);
            return null;
        }

        for (const res of results) {
            for (const rv of res.returnValues ?? []) {
                if (rv[0]?.length > 0) {
                    const dataLength = rv[0].length;
                    const { expectedLength } = decoderInfo;
                    
                    if (expectedLength === undefined) {
                        return rv[0];
                    }
                    
                    if (Array.isArray(expectedLength)) {
                        if (expectedLength.includes(dataLength)) {
                            return rv[0];
                        }
                    } else if (expectedLength === dataLength) {
                        return rv[0];
                    }
                }
            }
        }
        return null;
    }

    // 如果是函数类型的解码器，返回第一个可用的数据
    for (const res of results) {
        for (const rv of res.returnValues ?? []) {
            if (rv[0]?.length > 0) {
                return rv[0];
            }
        }
    }

    return null;
}

// 解码数据的辅助函数
function decodeData<T>(
    data: number[], 
    decoder?: DecoderReference<T>
): T {
    if (!decoder) {
        return data as T;
    }

    // 如果是 DecoderInfo 对象
    if (typeof decoder === 'object' && 'decoder' in decoder) {
        return (decoder as DecoderInfo<T>).decoder(data);
    }

    // 如果是字符串类型的解码器名称
    if (typeof decoder === 'string') {
        const decoderInfo = defaultDecoderRegistry.get(decoder);
        if (!decoderInfo) {
            console.warn(`❌ Decoder '${decoder}' not found in registry`);
            return data as T;
        }
        return decoderInfo.decoder(data);
    }

    // 如果是函数类型的解码器
    if (typeof decoder === 'function') {
        return (decoder as Decoder<T>)(data);
    }

    return data as T;
}

// 创建查询函数的工厂函数
export function createQuery<TArgs extends any[], TResult>(
    module: string,
    functionName: string,
    argumentsBuilder: (tx: Transaction, ...args: TArgs) => any[] | Promise<any[]>,
    decoder?: DecoderReference<TResult>
) {
    return async (...args: TArgs): Promise<TResult | null> => {
        const networkVariables = getNetworkVariables(network);
        
        // 检查 argumentsBuilder 是否是异步函数
        const isAsync = argumentsBuilder.constructor.name === 'AsyncFunction';
        
        if (isAsync) {
            return devInspectQueryAsync(
                async (tx) => {
                    const txArgs = await (argumentsBuilder as any)(tx, ...args);
                    tx.moveCall({
                        package: networkVariables.Package,
                        module: module,
                        function: functionName,
                        arguments: txArgs,
                    });
                    return tx;
                },
                decoder
            );
        } else {
            return devInspectQuery(
                (tx) => {
                    const txArgs = (argumentsBuilder as any)(tx, ...args);
                    tx.moveCall({
                        package: networkVariables.Package,
                        module: module,
                        function: functionName,
                        arguments: txArgs,
                    });
                    return tx;
                },
                decoder
            );
        }
    };
}

// 类型安全的查询构建器
export const QueryBuilder = {
    // 简单的查询（不需要参数）
    simple: <T>(
        module: string,
        functionName: string,
        decoder?: DecoderReference<T>
    ) => createQuery(module, functionName, () => [], decoder),

    // 带参数的查询
    withArgs: <TArgs extends any[], TResult>(
        module: string,
        functionName: string,
        argumentsBuilder: (tx: Transaction, ...args: TArgs) => any[],
        decoder?: DecoderReference<TResult>
    ) => createQuery(module, functionName, argumentsBuilder, decoder),

    // 异步参数的查询
    withAsyncArgs: <TArgs extends any[], TResult>(
        module: string,
        functionName: string,
        argumentsBuilder: (tx: Transaction, ...args: TArgs) => Promise<any[]>,
        decoder?: DecoderReference<TResult>
    ) => createQuery(module, functionName, argumentsBuilder, decoder)
};

// 导出基础解码器以保持向后兼容
export const decoders = {
    ...Object.fromEntries(
        Object.entries(baseDecoders).map(([key, info]) => [key, info.decoder])
    )
};

// 导出类型
export type { Decoder, DecoderInfo } from './decoders'; 