import { buildTimeBlockPayload } from "./buildTimeBlockPayload";

/**
 * Creates a submit handler.
 *
 * @param {Array} blocks - Current block list.
 * @param {string} date - Current date value.
 * @param {Function} onSubmit - Parent submit function.
 * @returns {Function} Submit handler.
 */
export function createSubmitHandler(blocks, date, onSubmit) {
    return function submitForm(event) {
        event.preventDefault();
        onSubmit(buildTimeBlockPayload(blocks, date));
    };
}