import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill/global';
import './stylesheets/Calendar.css';
import CalendarView from './CalendarView.jsx';
import CalendarPlaceholder from './CalendarPlaceholder.jsx';
import fetchGeneratedSchedule from '../../utils/Api/fetchGeneratedSchedule.js';
import saveGeneratedSchedule from '../../utils/Api/saveGeneratedSchedule.js';
import discardSchedule from '../../utils/Helpers/discardSchedule.js';

/**
 * Component for previewing a generated schedule before saving.
 * Allows users to review the schedule and choose to save it or cancel.
 *
 * @returns {JSX.Element} The rendered preview calendar component or a placeholder if loading.
 */
function PreviewCalendar() {
    const [blocks, setBlocks] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const result = fetchGeneratedSchedule();
        if (result) {
            setBlocks(result.blocks);
            setSchedule(result.schedule);
        }
    }, []);

    const handleSave = async () => {
        await saveGeneratedSchedule(schedule, navigate);
    };

    const handleLeave = () => {
        discardSchedule(navigate);
    };

    if (blocks === null) return null;

    return (
        <CalendarView
            blocks={blocks}
            setBlocks={setBlocks}
            title="Preview generated schedule"
            headerButtons={
                <>
                    <button onClick={handleSave}>Save Schedule</button>
                    <button onClick={handleLeave}>Cancel</button>
                </>
            }
            eventButtons={null}
        />
    );
}

export default PreviewCalendar;
