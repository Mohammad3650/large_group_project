/**
 * Determines whether a mouse event occurred outside a referenced element.
 *
 * @param {{ current: Element|null }} ref - React ref object pointing to the element
 * @param {MouseEvent} event - The mouse event to check
 * @returns {boolean} True if the click was outside the element, false otherwise
 */
function isClickOutside(ref, event) {
    return ref.current !== null && !ref.current.contains(event.target);
}

export default isClickOutside;
