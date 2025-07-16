import { registerProjectDecoders } from './sui-query'
import ProjectDecoders from '../examples/projectDecoders.example'

// 全局注册项目解码器
// 这个函数应该在应用启动时调用，比如在 _app.tsx 或 layout.tsx 中
export function initializeProjectDecoders() {
    // 注册项目特定的解码器
    registerProjectDecoders(ProjectDecoders)
    
    console.log('✅ Project decoders registered successfully')
}

// 可选：如果你有多个项目或模块，可以分别注册
export function initializeCustomDecoders() {
    // 示例：注册其他模块的解码器
    // registerProjectDecoders(AnotherModuleDecoders)
    // registerProjectDecoders(ThirdPartyDecoders)
}

// 统一初始化函数
export function initializeAllDecoders() {
    initializeProjectDecoders()
    initializeCustomDecoders()
}

// 默认导出
export default initializeAllDecoders 