import { createEmptyBlock } from "./createEmptyBlock";

/**
 * Adds a new block to the list.
 *
 * @param {Array} blocks - Existing blocks.
 * @returns {Array} Updated blocks.
 */
export function addBlockToList(blocks) {
    return [...blocks, createEmptyBlock()];
}