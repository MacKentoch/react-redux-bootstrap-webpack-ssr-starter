// @flow weak


/**
 * when in a universal application, this function will help telling you if you can use window object (not server side)
 *
 * @export
 * @returns 
 */
export function isBrowserSide() {
  return typeof window === 'object';
}
