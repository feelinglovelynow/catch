/**
 * Log boundary + Log data + Log trace
 * @param { any } data - The information we would love to log
 * @returns { void }
 */
export function log(data) {
  console.log('---FLN LOG START---')
  console.log(data)
  console.trace()
  console.log('---FLN LOG END---')
}
