import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import TimeBlockForm from './TimeBlockForm';
import toLocalDateTime from '../utils/Formatters/toLocalDateTime.js';
import getUserTimezone from '../utils/Helpers/getUserTimezone.js';

const FETCH_ERROR = 'Unable to load this time block.';
const UPDATE_ERROR = 'Failed to update time block.';

/**
 * Converts an empty time string into null so the API receives a missing value in a consistent format.
 *
 * @param {string | null} value - The submitted time value.
 * @returns {string | null} The original time or null if empty.
 */

/**
 * Creates a standard error structure for failures that occur while loading the existing time block.
 *
 * @returns {{detail: string}[]} A server-style error array.
 */
function normaliseTime(value) {
    return value === '' ? null : value;
}

/**
 * Creates a standard error structure for failures that occur while updating the time block.
 *
 * Uses the server response if available, otherwise falls back to a generic update error message.
 *
 * @param {object} error - The error thrown by the API request.
 * @returns {object[]} A server-style error array.
 */
function createFetchError() {
    return [{ detail: FETCH_ERROR }];
}

/**
 * Creates a standard error structure for failures that occur while updating the time block.
 *
 * Uses the server response if available, otherwise falls back to a generic update error message.
 *
 * @param {object} error - The error thrown by the API request.
 * @returns {object[]} A server-style error array.
 */
function createUpdateError(error) {
    return [error.response?.data || { detail: UPDATE_ERROR }];
}

/**
 * Maps API time block data into the format expected by the form.
 *
 * It converts the stored date and times into the user's local date/time values before populating the form.
 *
 * @param {object} data - Time block data returned by the API.
 * @returns {object} Form-ready time block data.
 */
function mapTimeBlockToFormData(data) {
    const start = toLocalDateTime(data.date, data.start_time);
    const end = toLocalDateTime(data.date, data.end_time);

    return {
        id: data.id,
        date: start.localDate,
        name: data.name,
        location: data.location,
        block_type: data.block_type,
        description: data.description,
        start_time: start.localTime,
        end_time: end.localTime
    };
}

/**
 * Builds the payload sent to the API when updating a time block.
 *
 * This normalises optional time values and attaches the user's current timezone so the backend can interpret the data correctly.
 *
 * @param {object} block - The edited form data for the time block.
 * @returns {object} The cleaned API payload.
 */
function buildUpdatePayload(block) {
    return {
        ...block,
        start_time: normaliseTime(block.start_time),
        end_time: normaliseTime(block.end_time),
        timezone: getUserTimezone()
    };
}

/**
 * Fetches a time block by id and converts it into the structure required by the edit form.
 *
 * @param {string} id - The id of the time block to fetch.
 * @returns {Promise<object>} The formatted form data.
 */
async function fetchTimeBlock(id) {
    const response = await api.get(`/api/timeblocks/${id}/edit`);
    return mapTimeBlockToFormData(response.data);
}

/**
 * Sends an update request for a specific time block.
 *
 * @param {string} id - The id of the time block to update.
 * @param {object} block - The edited form data.
 * @returns {Promise<void>} Resolves when the update succeeds.
 */
async function updateTimeBlock(id, block) {
    const payload = buildUpdatePayload(block);
    await api.patch(`/api/timeblocks/${id}/edit/`, payload);
}


/**
 * Component for editing an existing time block.
 *
 * It loads the current time block data, displays it in the form,
 * submits any edits, and redirects to the success page after a
 * successful update.
 *
 * @returns {JSX.Element} The edit form or a loading/error message.
 */

function EditTimeBlock() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [initialData, setInitialData] = useState(null);
    const [serverErrors, setServerErrors] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadTimeBlock() {
            setIsFetching(true);
            setServerErrors([]);

            try {
                const data = await fetchTimeBlock(id);
                if (active){
                    setInitialData(data);
                }
            } catch {
                if (active){
                    setServerErrors(createFetchError());
                }
            } finally {
                if (active){
                    setIsFetching(false);
                }
            }
        }

        loadTimeBlock();
        return () => {
            active = false;
        };
    }, [id]);

    async function handleUpdate(dataList) {
        if (isSubmitting){
            return;
        }

        setIsSubmitting(true);
        setServerErrors([]);

        try {
            await updateTimeBlock(id, dataList[0]);
            navigate('/successful-timeblock', {
                state: { id, action: 'edited' }
            });
        } catch (error){
            setServerErrors(createUpdateError(error));
        } finally{
            setIsSubmitting(false);
        }
    }

    if (isFetching){
        return <p>Loading...</p>;
    }
    if (!initialData){
        return <p>{FETCH_ERROR}</p>;
    }

    return (
        <div className="page-center">
            <div className="time-block-form-card">
                <h2>Edit Time Block</h2>
                <TimeBlockForm
                    onSubmit={handleUpdate}
                    initialData={initialData}
                    loading={isSubmitting}
                    serverErrors={serverErrors}
                    clearErrors={() => setServerErrors([])}
                />
            </div>
        </div>
    );
}

export default EditTimeBlock;