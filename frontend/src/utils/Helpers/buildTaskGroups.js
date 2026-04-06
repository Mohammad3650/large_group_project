import handleCompleteTask from './handleCompleteTask.js';
import handleUndoCompleteTask from './handleUndoCompleteTask.js';
import handleUndoCompletePinnedTask from './handleUndoCompletePinnedTask.js';
import handlePinTask from './handlePinTask.js';
import handleUnpinTask from './handleUnpinTask.js';

/**
 * Builds the task group configuration array used by the Dashboard to render each TaskGroup.
 * Each entry contains the group's title, variant, filtered task array, state setter,
 * and the relevant action callbacks.
 *
 * @param {Object} filteredTasks - Filtered task arrays for each group
 * @param {Array} filteredTasks.filteredPinned - Filtered pinned tasks
 * @param {Array} filteredTasks.filteredOverdue - Filtered overdue tasks
 * @param {Array} filteredTasks.filteredToday - Filtered today's tasks
 * @param {Array} filteredTasks.filteredTomorrow - Filtered tomorrow's tasks
 * @param {Array} filteredTasks.filteredWeek - Filtered next 7 days' tasks
 * @param {Array} filteredTasks.filteredBeyondWeek - Filtered tasks beyond the next 7 days
 * @param {Array} filteredTasks.filteredCompleted - Filtered completed tasks
 * @param {Object} setters - State setter functions for each task group
 * @param {Function} setters.setPinnedTasks
 * @param {Function} setters.setOverdueTasks
 * @param {Function} setters.setTodayTasks
 * @param {Function} setters.setTomorrowTasks
 * @param {Function} setters.setWeekTasks
 * @param {Function} setters.setBeyondWeekTasks
 * @param {Function} setters.setCompletedTasks
 * @returns {Array<Object>} Array of task group configuration objects
 */
function buildTaskGroups(filteredTasks, setters) {
    const {
        filteredPinned, filteredOverdue, filteredToday, filteredTomorrow,
        filteredWeek, filteredBeyondWeek, filteredCompleted,
    } = filteredTasks;

    const {
        setPinnedTasks, setOverdueTasks, setTodayTasks, setTomorrowTasks,
        setWeekTasks, setBeyondWeekTasks, setCompletedTasks,
    } = setters;

    const dateGroupSetters = { setOverdueTasks, setTodayTasks, setTomorrowTasks, setWeekTasks, setBeyondWeekTasks };

    return [
        {
            title: 'Pinned',
            variant: 'pinned',
            tasks: filteredPinned,
            setTasks: setPinnedTasks,
            onComplete: (task) => handleCompleteTask(task, setPinnedTasks, setCompletedTasks),
            onUndoComplete: (task) => handleUndoCompletePinnedTask(task, { setPinnedTasks }),
            onUnpin: (task) => handleUnpinTask(task, { setPinnedTasks, setCompletedTasks, ...dateGroupSetters }),
        },
        {
            title: 'Overdue',
            variant: 'overdue',
            tasks: filteredOverdue,
            setTasks: setOverdueTasks,
            onComplete: (task) => handleCompleteTask(task, setOverdueTasks, setCompletedTasks),
            onPin: (task) => handlePinTask(task, setOverdueTasks, setPinnedTasks),
        },
        {
            title: 'Today',
            variant: 'today',
            tasks: filteredToday,
            setTasks: setTodayTasks,
            onComplete: (task) => handleCompleteTask(task, setTodayTasks, setCompletedTasks),
            onPin: (task) => handlePinTask(task, setTodayTasks, setPinnedTasks),
        },
        {
            title: 'Tomorrow',
            variant: 'tomorrow',
            tasks: filteredTomorrow,
            setTasks: setTomorrowTasks,
            onComplete: (task) => handleCompleteTask(task, setTomorrowTasks, setCompletedTasks),
            onPin: (task) => handlePinTask(task, setTomorrowTasks, setPinnedTasks),
        },
        {
            title: 'Next 7 Days',
            variant: 'week',
            tasks: filteredWeek,
            setTasks: setWeekTasks,
            onComplete: (task) => handleCompleteTask(task, setWeekTasks, setCompletedTasks),
            onPin: (task) => handlePinTask(task, setWeekTasks, setPinnedTasks),
        },
        {
            title: 'After Next 7 Days',
            variant: 'beyond',
            tasks: filteredBeyondWeek,
            setTasks: setBeyondWeekTasks,
            onComplete: (task) => handleCompleteTask(task, setBeyondWeekTasks, setCompletedTasks),
            onPin: (task) => handlePinTask(task, setBeyondWeekTasks, setPinnedTasks),
        },
        {
            title: 'Completed',
            variant: 'completed',
            tasks: filteredCompleted,
            setTasks: setCompletedTasks,
            onUndoComplete: (task) => handleUndoCompleteTask(task, { setCompletedTasks, ...dateGroupSetters }),
            onPin: (task) => handlePinTask(task, setCompletedTasks, setPinnedTasks),
        },
    ];
}

export default buildTaskGroups;
