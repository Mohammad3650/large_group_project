import { useParams } from 'react-router-dom';
import TimeBlockForm from './TimeBlockForm';
import useEditTimeBlock from '../utils/Hooks/useEditTimeBlock';
import useEditTimeBlockNavigation from '../utils/Hooks/useEditTimeBlockNavigation';

const FETCH_ERROR = 'Unable to load this time block.';
const UPDATE_ERROR = 'Failed to update time block.';

 /**
 * EditTimeBlock component
 *
 * Responsible only for the edit flow:
 * - retrieves time block data via a custom hook
 * - passes data into the form component
 * - handles user actions (submit / cancel) via hooks
 *
 * All business logic (API + navigation) is abstracted into hooks.
 *
 * @returns {JSX.Element} The edit form or a loading/error state
 */

function EditTimeBlock() {
    const { id } = useParams();
    const { goSuccess, goCancel } = useEditTimeBlockNavigation(id);

    const {
    initialData,
    loading,
    serverErrors,
    update,
    clearErrors
    } = useEditTimeBlock(id);

    async function handleUpdate(dataList) {
        const success = await update(dataList[0]);

        if (success) {
            goSuccess();
        }
    }

    function handleCancel(){
        clearErrors();
        goCancel();
    }

    if (loading) return <p>Loading...</p>;

    if (!initialData) return <p>{FETCH_ERROR}</p>;

    return (
        <div className="page-center">
            <div className="time-block-form-card">
                <h2>Edit Task</h2>
                <TimeBlockForm
                    onSubmit={handleUpdate}
                    onCancel={handleCancel}
                    initialData={initialData}
                    loading={loading}
                    serverErrors={serverErrors}
                    clearErrors={clearErrors}
                />
            </div>
        </div>
    );
}

export default EditTimeBlock;