/** A page of this website (such as /shop) or a secure web address. */
export function isSafeBannerLink(value: string): boolean {
  // "//host" and "/\host" are treated by browsers as another website.
  return /^\/(?![/\\])/.test(value) || /^https:\/\/[^\s]+$/i.test(value);
}
