import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill/global';
import './stylesheets/Calendar.css';

import useTimeBlocks from '../../utils/Hooks/useTimeBlocks.js';
import CalendarView from './CalendarView.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';
import useUsername from '../../utils/Hooks/useUsername.js';
import CalendarPlaceholder from './CalendarPlaceholder.jsx';
import CalendarEmptyState from './CalendarEmptyState.jsx';
import renderEventActions from './renderEventActions.jsx';

/**
 * Displays the user's calendar page.
 *
 * Fetches the user's time blocks and username, then renders either
 * a loading state, an empty state, or the populated calendar view.
 *
 * @returns {JSX.Element} Calendar page UI
 */

function Calendar() {
    const { blocks, setBlocks } = useTimeBlocks();
    const { username } = useUsername(true);

    if (blocks === null) return <CalendarPlaceholder />;

    if (blocks.length === 0) {
        return <CalendarEmptyState username={username} />;
    }

    return (
        <CalendarView
            blocks={blocks}
            setBlocks={setBlocks}
            username={username}
            headerButtons={<AddTaskButton />}
            eventButtons={renderEventActions}
        />
    );
}

export default Calendar;
