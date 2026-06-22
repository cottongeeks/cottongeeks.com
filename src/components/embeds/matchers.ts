// URL matchers for the supported embed services. Each returns the value to pass
// as the component's `id` prop, or `undefined` when the URL isn't a match.
//
// Patterns adapted from astro-embed (MIT), originally from the eleventy embed
// plugins. The leading look-ahead/back-reference groups tolerate surrounding
// whitespace and optional `<a>` wrappers.

// Maps a URL to the value passed as a component's `id`, or undefined if no match.
type Matcher = (url: string) => string | undefined

// twitter.com / x.com status URLs -> the matched URL (used as the oEmbed lookup).
const twitterPattern =
  /(?=(\s*))\1(?:<a [^>]*?>)??(?=(\s*))\2(?:https?:)??(?:\/\/)??(?:w{3}\.)??(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]{1,15})?(?:\/(?:status)\/)(\d+)?(?:[^\s<>]*)(?=(\s*))\5(?:<\/a>)??(?=(\s*))\6/

export const twitterMatcher: Matcher = url => twitterPattern.exec(url)?.[0]

// youtube.com / youtu.be watch|embed|shorts URLs -> the 11-char video id.
const youtubePattern =
  /(?=(\s*))\1(?:<a [^>]*?>)??(?=(\s*))\2(?:https?:\/\/)??(?:w{3}\.)??(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|shorts\/)??([A-Za-z0-9-_]{11})(?:[^\s<>]*)(?=(\s*))\4(?:<\/a>)??(?=(\s*))\5/

export const youtubeMatcher: Matcher = url => youtubePattern.exec(url)?.[3]

// Ordered [matcher, componentName] pairs. Order matters when services could
// overlap: list more specific matchers first. (Currently non-overlapping.)
export const matchers: readonly (readonly [Matcher, string])[] = [
  [twitterMatcher, 'Tweet'],
  [youtubeMatcher, 'YouTube'],
]

export const componentNames: readonly string[] = matchers.map(([, name]) => name)
