import { bcs } from "@mysten/sui/bcs"
import { defaultDecoderRegistry, createStructDecoder, createDecoder, type DecoderInfo } from './decoders'

// 项目特定的类型定义
export interface UserPoolReserveInformationView {
    timestamp_index: string
    collateral: string
    debt: string
    accumulated_interest: string
    claimable_collateral: string
}

export interface UserPoolConfig {
    premium_interest_rate: string
    ltv: string
    liquidation_threshold: string
    recovery_ltv: string
    liquidate_buffer: string
}

// 类型安全的项目解码器 - 统一使用 createTypeSafeDecoders
export const ProjectDecoders = createTypeSafeDecoders({
    UserPoolReserveInformationView: addProjectDecoder<UserPoolReserveInformationView>(
        'UserPoolReserveInformationView',
        {
            timestamp_index: bcs.u64(),
            collateral: bcs.u128(),
            debt: bcs.u128(),
            accumulated_interest: bcs.u128(),
            claimable_collateral: bcs.u128(),
        },
        {
            expectedLength: [40, 48, 56],
            priority: 2
        }
    ),
    
    UserPoolConfig: addProjectDecoder<UserPoolConfig>(
        'UserPoolConfig',
        {
            premium_interest_rate: bcs.u128(),
            ltv: bcs.u128(),
            liquidation_threshold: bcs.u128(),
            recovery_ltv: bcs.u128(),
            liquidate_buffer: bcs.u128(),
        },
        {
            expectedLength: [80, 88, 96],
            priority: 2
        }
    )
} as const)

// 导出解码器的类型，用于类型检查
export type ProjectDecoderKeys = keyof typeof ProjectDecoders

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

// 示例：如何添加新的项目解码器
/*
export const MyProjectDecoders = createTypeSafeDecoders({
    MyStruct: addProjectDecoder<MyStruct>('MyStruct', {
        field1: bcs.u64(),
        field2: bcs.string(),
        field3: bcs.bool()
    }, {
        expectedLength: [32, 40],
        priority: 2
    }),
    
    AnotherStruct: addProjectDecoder<AnotherStruct>('AnotherStruct', {
        value: bcs.u128(),
        flag: bcs.bool()
    })
})
*/ 