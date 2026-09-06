import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'拼出中国 · 34省级政区拼图',description:'地理互动课堂：观察34个省级行政区的轮廓，拖拽吸附，拼出完整中国政区图。'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
