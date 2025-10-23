import { ReactNode } from 'react'

type Props = { title: string; children: ReactNode }
export default function SealCard({ title, children }: Props) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  )
}
