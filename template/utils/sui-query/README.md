# Sui Query 

## 📁 文件结构

```
utils/
├── sui-query/
│   ├── decoders.ts       # 核心解码器系统（包含所有功能）
│   ├── query.ts          # 查询系统
│   ├── index.ts          # 统一导出
│   └── README.md         # 本文档
├── registerDecoders.ts   # 全局注册函数
└── index.ts              # 主导出文件

examples/
├── projectDecoders.example.ts      # 项目解码器示例
├── nextjs-initialization.example.tsx # Next.js 初始化示例
└── typeSafeQueryExamples.ts        # 类型安全查询示例
```

## 🚀 主要改进

### 1. **核心功能和示例分离**
- ✅ **核心功能**：在 `utils/sui-query/decoders.ts` 中
- ✅ **示例代码**：在 `examples/` 目录中
- ✅ **清晰的职责分离**

### 2. **全局注册机制**
- ✅ **全局注册函数**：`registerProjectDecoders()`
- ✅ **应用启动时注册**：在 `_app.tsx` 或 `layout.tsx` 中
- ✅ **统一管理**：所有解码器集中注册

### 3. **更好的类型安全**
- ✅ **完整的 TypeScript 支持**
- ✅ **编译时错误检查**
- ✅ **IDE 智能提示**

## 💡 使用方法

### 1. 创建项目解码器

```typescript
// myProject/decoders.ts
import { createTypeSafeDecoders, addProjectDecoder } from '@/utils'
import { bcs } from "@mysten/sui/bcs"

export const MyProjectDecoders = createTypeSafeDecoders({
    UserInfo: addProjectDecoder<UserInfo>('UserInfo', {
        id: bcs.u64(),
        name: bcs.string(),
        balance: bcs.u128()
    }, {
        expectedLength: [40, 48],
        priority: 2
    }),
    
    PoolConfig: addProjectDecoder<PoolConfig>('PoolConfig', {
        rate: bcs.u128(),
        cap: bcs.u64()
    })
})

export default MyProjectDecoders
```

### 2. 全局注册解码器

```typescript
// utils/registerDecoders.ts
import { registerProjectDecoders } from './sui-query'
import MyProjectDecoders from '../myProject/decoders'

export function initializeProjectDecoders() {
    registerProjectDecoders(MyProjectDecoders)
    console.log('✅ Project decoders registered')
}
```

### 3. 在 Next.js 应用中初始化

```typescript
// app/layout.tsx (App Router)
import { useEffect } from 'react'
import { initializeProjectDecoders } from '@/utils/registerDecoders'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initializeProjectDecoders()
    }, [])

    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
```

或者使用专门的初始化组件：

```typescript
// components/DecoderInitializer.tsx
import { useEffect } from 'react'
import { initializeProjectDecoders } from '@/utils/registerDecoders'

export function DecoderInitializer() {
    useEffect(() => {
        initializeProjectDecoders()
    }, [])

    return null
}

// 在任何地方使用
function MyApp() {
    return (
        <>
            <DecoderInitializer />
            {/* 其他组件 */}
        </>
    )
}
```

### 4. 使用类型安全的查询

```typescript
// 使用查询系统
import { QueryBuilder } from '@/utils'
import { MyProjectDecoders } from '../myProject/decoders'

export const getUserInfo = QueryBuilder.withArgs<[string], UserInfo>(
    'my_module',
    'get_user_info',
    (tx, userAddress) => [tx.pure.address(userAddress)],
    MyProjectDecoders.UserInfo  // 完全类型安全！
)

// 使用查询
const userInfo = await getUserInfo('0x123...')
if (userInfo) {
    console.log(userInfo.name, userInfo.balance)  // 类型安全的属性访问
}
```

## 🔧 核心 API

### 解码器创建函数

```typescript
// 创建单个解码器
addProjectDecoder<T>(name: string, fields: Record<string, any>, options?: {
    expectedLength?: number | number[]
    priority?: number
}): DecoderInfo<T>

// 创建类型安全的解码器集合
createTypeSafeDecoders<T>(decoders: T): T

// 全局注册解码器
registerProjectDecoders(decoders: Record<string, DecoderInfo>): void
```

### 查询构建器

```typescript
// 简单查询
QueryBuilder.simple<T>(module: string, functionName: string, decoder?: DecoderReference<T>)

// 带参数查询
QueryBuilder.withArgs<TArgs, TResult>(
    module: string, 
    functionName: string, 
    argumentsBuilder: (tx: Transaction, ...args: TArgs) => any[], 
    decoder?: DecoderReference<TResult>
)

// 异步参数查询
QueryBuilder.withAsyncArgs<TArgs, TResult>(
    module: string, 
    functionName: string, 
    argumentsBuilder: (tx: Transaction, ...args: TArgs) => Promise<any[]>, 
    decoder?: DecoderReference<TResult>
)
```

## 🎨 最佳实践

### 1. **项目结构**
```
myProject/
├── decoders.ts          # 项目解码器
├── queries.ts           # 项目查询函数
└── types.ts             # 类型定义
```

### 2. **解码器管理**
```typescript
// 为每个模块创建独立的解码器
export const PoolDecoders = createTypeSafeDecoders({
    // 池子相关的解码器
})

export const UserDecoders = createTypeSafeDecoders({
    // 用户相关的解码器
})
```

### 3. **查询组织**
```typescript
// 按模块组织查询
export const PoolQueries = {
    getConfig: QueryBuilder.simple('pool', 'get_config', PoolDecoders.Config),
    getUserInfo: QueryBuilder.withArgs('pool', 'get_user_info', ..., PoolDecoders.UserInfo)
}
```

## 📈 优势

1. **清晰的架构** - 核心功能和示例分离
2. **全局管理** - 统一的解码器注册机制
3. **类型安全** - 完整的 TypeScript 支持
4. **易于扩展** - 模块化的设计
5. **向后兼容** - 原有 API 保持不变

## 🔄 迁移指南

### 从旧版本迁移

1. **更新导入**：
   ```typescript
   // 旧版本
   import { ProjectDecoders } from '@/utils'
   
   // 新版本
   import { createTypeSafeDecoders, addProjectDecoder } from '@/utils'
   ```

2. **创建项目解码器**：
   ```typescript
   // 参考 examples/projectDecoders.example.ts
   export const MyProjectDecoders = createTypeSafeDecoders({
       // 你的解码器定义
   })
   ```

3. **添加全局注册**：
   ```typescript
   // utils/registerDecoders.ts
   import { registerProjectDecoders } from './sui-query'
   import MyProjectDecoders from '../myProject/decoders'
   
   export function initializeProjectDecoders() {
       registerProjectDecoders(MyProjectDecoders)
   }
   ```

4. **在应用中初始化**：
   ```typescript
   // 在 _app.tsx 或 layout.tsx 中
   useEffect(() => {
       initializeProjectDecoders()
   }, [])
   ```

## 📝 示例文件

- `examples/projectDecoders.example.ts` - 项目解码器示例
- `examples/nextjs-initialization.example.tsx` - Next.js 初始化示例
- `examples/typeSafeQueryExamples.ts` - 类型安全查询示例

## 🤝 总结

这次重构解决了：
- ✅ **架构清晰** - 核心功能和示例分离
- ✅ **全局管理** - 统一的注册机制
- ✅ **类型安全** - 完整的 TypeScript 支持
- ✅ **易于使用** - 在 Next.js 应用启动时一次性注册

现在你可以更好地组织和管理项目的解码器系统了！ 