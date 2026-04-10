/**
 * Returns the CSS title class for a task group based on its variant.
 *
 * @param {string} variant - The task group variant
 * @returns {string} The CSS class name, or an empty string if no special class applies
 */
function getTitleClass(variant) {
    if (variant === 'overdue') return 'overdue-title';
    if (variant === 'completed') return 'completed-title';
    if (variant === 'pinned') return 'pinned-title';
    return '';
}

export default getTitleClass;
