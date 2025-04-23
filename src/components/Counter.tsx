'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <button
        onClick={() => setCount(count - 1)}
        className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
      >
        -
      </button>
      <span className="text-xl font-medium">{count}</span>
      <button
        onClick={() => setCount(count + 1)}
        className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
      >
        +
      </button>
    </div>
  )
}
