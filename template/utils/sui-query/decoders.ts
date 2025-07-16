import { bcs } from "@mysten/sui/bcs"

// 基础解码器类型定义
export type Decoder<T = any> = (data: number[]) => T

// 解码器信息接口
export interface DecoderInfo<T = any> {
    decoder: Decoder<T>
    expectedLength?: number | number[]
    priority?: number
}

// 基础解码器实现
const createBaseDecoders = () => ({
    u128: {
        decoder: (data: number[]) => bcs.u128().parse(new Uint8Array(data)).toString(),
        expectedLength: 16,
        priority: 1
    },
    u64: {
        decoder: (data: number[]) => Number(bcs.u64().parse(new Uint8Array(data))),
        expectedLength: 8,
        priority: 1
    },
    u32: {
        decoder: (data: number[]) => Number(bcs.u32().parse(new Uint8Array(data))),
        expectedLength: 4,
        priority: 1
    },
    u8: {
        decoder: (data: number[]) => Number(bcs.u8().parse(new Uint8Array(data))),
        expectedLength: 1,
        priority: 1
    },
    bool: {
        decoder: (data: number[]) => bcs.bool().parse(new Uint8Array(data)),
        expectedLength: 1,
        priority: 1
    },
    address: {
        decoder: (data: number[]) => bcs.Address.parse(new Uint8Array(data)),
        expectedLength: 32,
        priority: 1
    },
    string: {
        decoder: (data: number[]) => bcs.string().parse(new Uint8Array(data)),
        expectedLength: undefined,
        priority: 2
    }
} as const)

// 基础解码器实例
export const baseDecoders = createBaseDecoders()

// 类型安全的解码器注册中心
export class DecoderRegistry {
    private decoders: Map<string, DecoderInfo> = new Map()

    constructor() {
        // 注册基础解码器
        Object.entries(baseDecoders).forEach(([name, info]) => {
            this.decoders.set(name, info)
        })
    }

    // 注册新的解码器
    register<T>(name: string, decoder: Decoder<T>, options?: {
        expectedLength?: number | number[]
        priority?: number
    }) {
        this.decoders.set(name, {
            decoder,
            expectedLength: options?.expectedLength,
            priority: options?.priority ?? 3
        })
    }

    // 批量注册解码器
    registerBatch(decoders: Record<string, DecoderInfo>) {
        Object.entries(decoders).forEach(([name, info]) => {
            this.decoders.set(name, info)
        })
    }

    // 获取解码器
    get(name: string): DecoderInfo | undefined {
        return this.decoders.get(name)
    }

    // 获取所有解码器
    getAll(): Map<string, DecoderInfo> {
        return new Map(this.decoders)
    }

    // 根据数据长度自动推断解码器
    inferDecoder(dataLength: number): DecoderInfo | null {
        const candidates = Array.from(this.decoders.values())
            .filter(info => {
                if (info.expectedLength === undefined) return true
                if (Array.isArray(info.expectedLength)) {
                    return info.expectedLength.includes(dataLength)
                }
                return info.expectedLength === dataLength
            })
            .sort((a, b) => (a.priority || 3) - (b.priority || 3))

        return candidates[0] || null
    }
}

// 创建默认的解码器注册中心
export const defaultDecoderRegistry = new DecoderRegistry()

// 创建 BCS 结构体解码器的辅助函数
export function createStructDecoder<T>(
    name: string,
    fields: Record<string, any>,
    options?: {
        expectedLength?: number | number[]
        priority?: number
    }
): DecoderInfo<T> {
    const structBcs = bcs.struct(name, fields)
    return {
        decoder: (data: number[]) => structBcs.parse(new Uint8Array(data)) as T,
        expectedLength: options?.expectedLength,
        priority: options?.priority ?? 3
    }
}

// 类型安全的解码器创建函数
export function createDecoder<T>(
    parser: (data: Uint8Array) => T,
    options?: {
        expectedLength?: number | number[]
        priority?: number
    }
): DecoderInfo<T> {
    return {
        decoder: (data: number[]) => parser(new Uint8Array(data)),
        expectedLength: options?.expectedLength,
        priority: options?.priority ?? 3
    }
}

// 便捷的解码器添加函数
export function addProjectDecoder<T>(
    name: string,
    fields: Record<string, any>,
    options?: {
        expectedLength?: number | number[]
        priority?: number
    }
): DecoderInfo<T> {
    const decoderInfo = createStructDecoder<T>(name, fields, options)
    
    // 注册到全局注册中心
    defaultDecoderRegistry.register(name, decoderInfo.decoder, {
        expectedLength: decoderInfo.expectedLength,
        priority: decoderInfo.priority
    })
    
    return decoderInfo
}

// 创建类型安全的解码器集合
export function createTypeSafeDecoders<T extends Record<string, DecoderInfo>>(
    decoders: T
): T {
    // 注册所有解码器到全局注册中心
    Object.entries(decoders).forEach(([name, decoderInfo]) => {
        defaultDecoderRegistry.register(name, decoderInfo.decoder, {
            expectedLength: decoderInfo.expectedLength,
            priority: decoderInfo.priority
        })
    })
    
    return decoders
}

// 全局注册函数 - 用于应用启动时注册所有项目解码器
export function registerProjectDecoders(
    decoders: Record<string, DecoderInfo>
) {
    defaultDecoderRegistry.registerBatch(decoders)
}

// 类型安全的解码器工厂函数
export function createDecoderFactory<T extends Record<string, DecoderInfo>>(
    decoders: T
): T {
    return createTypeSafeDecoders(decoders)
} 