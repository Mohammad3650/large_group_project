import { useEffect, useState } from 'react';
import { getInitialBlocks } from '../Helpers/getInitialBlocks';
import { getInitialDate } from '../Helpers/getInitialDate';
import { createAddBlockHandler } from '../Helpers/createAddBlockHandler';
import { createDeleteBlockHandler } from '../Helpers/createDeleteBlockHandler';
import { createUpdateBlockHandler } from '../Helpers/createUpdateBlockHandler';
import { createSubmitHandler } from '../Helpers/createSubmitHandler';
import { createUpdateDateHandler } from '../Helpers/createUpdateDateHandler';
/**
 * Encapsulates all TimeBlockForm state and behaviour.
 *
 * @param {Object} props
 * @param {Function} props.onSubmit
 * @param {Function} props.clearErrors
 * @param {Object|null} props.initialData
 * @returns {Object} Form state and handlers.
 */
function useTimeBlockForm({ onSubmit, clearErrors, initialData }) {
    const [date, setDate] = useState(getInitialDate(initialData) || '');
    const [blocks, setBlocks] = useState(getInitialBlocks(initialData) || []);

    useEffect(() => {
        setDate(getInitialDate(initialData) || '');
        setBlocks(getInitialBlocks(initialData) || []);
    }, [initialData]);

    return {
        date,
        blocks,
        updateDate: createUpdateDateHandler(setDate, clearErrors),
        addBlock: createAddBlockHandler(setBlocks, clearErrors),
        updateBlock: createUpdateBlockHandler(setBlocks, clearErrors),
        deleteBlock: createDeleteBlockHandler(setBlocks, clearErrors),
        submitForm: createSubmitHandler(blocks, date, onSubmit),
        isEditMode: Boolean(initialData)
    };
}

export default useTimeBlockForm;