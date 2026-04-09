import { useState, useEffect } from 'react';
import getUserTimezone from '../Helpers/getUserTimezone';

/**
 * Encapsulates all state and logic for the TimeBlockForm.
 *
 * Responsibilities:
 * - Manage form state (date + blocks)
 * - Handle CRUD operations on blocks
 * - Format and submit data to parent component
 *
 * @param {Object|null} initialData - Existing block data (edit mode)
 * @param {Function} onSubmit - Function to send processed data
 * @param {Function} clearErrors - Clears server errors on user interaction
 */

export function useTimeBlockForm({ initialData, onSubmit, clearErrors }) {
    const emptyBlock = {
        name: '',
        location: '',
        block_type: 'study',
        description: '',
        start_time: '',
        end_time: ''
    };

    const [date, setDate] = useState(initialData?.date || '');
    const [blocks, setBlocks] = useState(
        initialData ? [buildBlockFromData(initialData)] : [emptyBlock]
    );

    useEffect(() => {
        if (initialData) {
            setDate(initialData.date || '');
            setBlocks([buildBlockFromData(initialData)]);
        }
    }, [initialData]);


    /**
     * Converts backend data into form-compatible block structure
     */
    function buildBlockFromData(data) {
        return {
            id: data.id,
            name: data.name,
            location: data.location,
            block_type: data.block_type,
            description: data.description,
            start_time: data.start_time || '',
            end_time: data.end_time || ''
        };
    }

    /**
     * Adds a new empty block to the list
     */
    function addBlock() {
        setBlocks(prev => [...prev, emptyBlock]);
        clearErrors();
    }

    /**
     * Updates a specific field of a block at a given index
     */
    function updateBlock(index, field, value) {
        setBlocks(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
        clearErrors();
    }

    /**
     * Removes a block by index
     */
    function deleteBlock(indexToDelete) {
        setBlocks(prev => prev.filter((_, i) => i !== indexToDelete));
        clearErrors();
    }

    /**
     * Handles form submission
     * - Prevents default form reload
     * - Attaches timezone for backend consistency
     * - Normalises block data into API-ready format
     */
    function handleSubmit(e) {
        e.preventDefault();
        const timezone = getUserTimezone();
        const dataList = blocks.map(block => ({
            id: block.id,
            date,
            name: block.name,
            location: block.location,
            description: block.description,
            block_type: block.block_type,
            start_time: block.start_time,
            end_time: block.end_time,
            timezone
        }));
        onSubmit(dataList);
    }

    return { date, setDate, blocks, addBlock, updateBlock, deleteBlock, handleSubmit };
}