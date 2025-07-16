import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 导出新的 sui-query 系统
export {
  // 基础解码器
  baseDecoders,
  BaseDecoders,
  DecoderRegistry,
  defaultDecoderRegistry,
  createStructDecoder,
  createDecoder,
  addProjectDecoder,
  createTypeSafeDecoders,
  registerProjectDecoders,
  createDecoderFactory,
  
  // 查询系统
  devInspectQuery,
  devInspectQueryAsync,
  createQuery,
  QueryBuilder,
  decoders,
  
  // 类型导出
  type Decoder,
  type DecoderInfo,
  type DecoderReference,
  type ResultSelector
} from './sui-query'

// 导出全局注册函数
export {
  initializeProjectDecoders,
  initializeCustomDecoders,
  initializeAllDecoders
} from './registerDecoders'

// 默认导出全局初始化函数
export { default as initializeDecoders } from './registerDecoders'