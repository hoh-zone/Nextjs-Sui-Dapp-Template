// 示例：在 Next.js 应用中初始化解码器
// 这个文件展示了如何在不同的 Next.js 版本中初始化解码器

import { useEffect } from 'react'
import initializeAllDecoders from '../utils/registerDecoders'

// 方法 1：在 _app.tsx 中初始化 (Pages Router)
export function AppWithDecoders({ Component, pageProps }: any) {
    useEffect(() => {
        // 在客户端初始化解码器
        initializeAllDecoders()
    }, [])

    return <Component {...pageProps} />
}

// 方法 2：在 layout.tsx 中初始化 (App Router)
export function RootLayoutWithDecoders({
    children,
}: {
    children: React.ReactNode
}) {
    useEffect(() => {
        // 在客户端初始化解码器
        initializeAllDecoders()
    }, [])

    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

// 方法 3：创建一个专门的初始化组件
export function DecoderInitializer() {
    useEffect(() => {
        initializeAllDecoders()
    }, [])

    return null // 这个组件不渲染任何内容
}

// 方法 4：服务器端初始化（如果需要）
export async function initializeDecodersOnServer() {
    // 在服务器端初始化解码器
    // 注意：这通常在 Next.js 的服务器端组件或 API 路由中使用
    initializeAllDecoders()
}

// 使用示例：
/*
在 _app.tsx 中：
import { AppWithDecoders } from '../examples/nextjs-initialization.example'
export default AppWithDecoders

或者在 layout.tsx 中：
import { RootLayoutWithDecoders } from '../examples/nextjs-initialization.example'
export default RootLayoutWithDecoders

或者在任何组件中：
import { DecoderInitializer } from '../examples/nextjs-initialization.example'

function MyApp() {
    return (
        <>
            <DecoderInitializer />
            其他组件
        </>
    )
}
*/ 