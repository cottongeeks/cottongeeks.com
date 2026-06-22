// Shared fetch helpers for embed components.

// Small LRU cache so the same oEmbed/API endpoint is only hit once per build.
class LRU<K, V> extends Map<K, V> {
  constructor(private readonly maxSize: number) {
    super()
  }

  override get(key: K): V | undefined {
    const value = super.get(key)
    if (value !== undefined) this.#touch(key, value)
    return value
  }

  override set(key: K, value: V): this {
    this.#touch(key, value)
    // Evict the oldest entry once we exceed the cap.
    if (this.size > this.maxSize) {
      const oldest = this.keys().next().value
      if (oldest !== undefined) this.delete(oldest)
    }
    return this
  }

  // Re-insert a key so it becomes the most-recently-used entry.
  #touch(key: K, value: V): void {
    this.delete(key)
    super.set(key, value)
  }
}

// Indent continuation lines the way Astro formats its build log messages.
const formatError = (...lines: string[]): string => lines.join('\n         ')

// Factory for safe, caching fetchers: network/parse errors are logged and turned
// into `undefined` so a flaky embed can never fail the whole build.
export function makeSafeGetter<T>(
  handleResponse: (res: Response) => T | Promise<T>,
  { cacheSize = 1000 }: { cacheSize?: number } = {},
): (url: string) => Promise<T | undefined> {
  const cache = new LRU<string, T>(cacheSize)
  return async function safeGet(url: string): Promise<T | undefined> {
    try {
      const cached = cache.get(url)
      if (cached !== undefined) return cached
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          formatError(`Failed to fetch ${url}`, `Error ${response.status}: ${response.statusText}`),
        )
      }
      const result = await handleResponse(response)
      cache.set(url, result)
      return result
    } catch (e) {
      console.error(formatError('[error]  astro-embed', e instanceof Error ? e.message : String(e)))
      return undefined
    }
  }
}

// Fetch a URL and parse it as JSON, swallowing errors. Used by embed components.
export const safeGet = makeSafeGetter<Record<string, unknown>>(
  res => res.json() as Promise<Record<string, unknown>>,
)
