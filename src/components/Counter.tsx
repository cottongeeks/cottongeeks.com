'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
      <button
        onClick={() => setCount(count - 1)}
        className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
      >
        -
      </button>
      <span className="text-xl font-medium text-white">{count}</span>
      <button
        onClick={() => setCount(count + 1)}
        className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
      >
        +
      </button>
    </div>
  )
}
