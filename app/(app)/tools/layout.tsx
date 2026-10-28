import type { ReactNode } from 'react'

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <div className="dark">{children}</div>
}
