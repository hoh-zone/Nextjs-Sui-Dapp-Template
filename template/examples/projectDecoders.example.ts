import { bcs } from "@mysten/sui/bcs"
import { 
    addProjectDecoder, 
    createTypeSafeDecoders,
    type DecoderInfo
} from '../utils/sui-query/decoders'

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

// 示例：创建类型安全的项目解码器
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

// 示例：如何添加更多解码器
export const ExtendedProjectDecoders = createTypeSafeDecoders({
    // 继承原有的解码器
    ...ProjectDecoders,
    
    // 添加新的解码器
    UserHealthInfo: addProjectDecoder<{
        liquidation_price: string
        health_factor: string
        max_borrow_amount: string
    }>('UserHealthInfo', {
        liquidation_price: bcs.u128(),
        health_factor: bcs.u128(),
        max_borrow_amount: bcs.u128()
    }, {
        expectedLength: [48, 56],
        priority: 2
    }),
    
    // 更多项目特定的解码器...
})

// 导出给全局注册使用
export default ProjectDecoders 