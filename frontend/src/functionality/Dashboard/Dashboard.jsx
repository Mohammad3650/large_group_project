import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import TaskGroup from './TaskGroup.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';
import NotesSection from './NotesSection.jsx';
import useTimeBlocks from '../../utils/Hooks/useTimeBlocks.js';
import handleExportCsv from '../../utils/Api/handleExportCsv.js';
import SubscriptionForm from './SubscriptionForm.jsx';
import SubscriptionList from './SubscriptionList.jsx';
import createCalendarSubscription from '../../utils/Api/createCalendarSubscription.js';
import deleteCalendarSubscription from '../../utils/Api/deleteCalendarSubscription.js';
import getCalendarSubscriptions from '../../utils/Api/getCalendarSubscriptions.js';
import handleExportIcs from '../../utils/Api/handleExportIcs.js';
import refreshCalendarSubscription from '../../utils/Api/refreshCalendarSubscription.js';
import useTasksByDateGroup from '../../utils/Hooks/useTasksByDateGroup.js';
import './stylesheets/Dashboard.css';

/**
 * Dashboard component - main page displayed after successful login.
 * Displays tasks grouped by day sections (overdue, today, tomorrow, next 7 days) alongside a notes section.
 * @returns {JSX.Element} The dashboard page
 */
function Dashboard() {
    const nav = useNavigate();
    const [message, setMessage] = useState('Loading...');
    const [subscriptionFeedback, setSubscriptionFeedback] = useState('');
    const [subscriptionFeedbackType, setSubscriptionFeedbackType] = useState('');
    const [subscriptions, setSubscriptions] = useState([]);
    const [showSubscriptions, setShowSubscriptions] = useState(true);
    const [pageError, setPageError] = useState('');

    const { blocks, refetchBlocks, error: blocksError } = useTimeBlocks();

    const {
        overdueTasks,
        setOverdueTasks,
        todayTasks,
        setTodayTasks,
        tomorrowTasks,
        setTomorrowTasks,
        weekTasks,
        setWeekTasks,
        beyondWeekTasks,
        setBeyondWeekTasks,
        totalTasks
    } = useTasksByDateGroup(blocks);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const response = await api.get('/dashboard/');
                setMessage(response.data.message);
            } catch (err) {
                if (err?.response?.status === 401) {
                    nav('/login');
                } else {
                    setPageError('Failed to load dashboard');
                }
            }
        }

        fetchDashboard();
    }, [nav]);

    useEffect(() => {
        async function fetchSubscriptions() {
            try {
                const data = await getCalendarSubscriptions();
                setSubscriptions(data);
            } catch {
                setPageError('Failed to load calendar subscriptions');
            }
        }

        fetchSubscriptions();
    }, []);

    useEffect(() => {
        document.body.classList.add('dashboard-page');
        window.scrollTo(0, 0);

        const handleResize = () => window.scrollTo(0, 0);
        window.addEventListener('resize', handleResize);

        return () => {
            document.body.classList.remove('dashboard-page');
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    async function handleImportSubscription(payload) {
        try {
            setSubscriptionFeedback('');
            setSubscriptionFeedbackType('');

            const responseData = await createCalendarSubscription(payload);

            setSubscriptions((currentSubscriptions) => [
                responseData.subscription,
                ...currentSubscriptions
            ]);

            setSubscriptionFeedback(
                responseData.message || 'Timetable imported successfully.'
            );
            setSubscriptionFeedbackType('success');

            await refetchBlocks();
        } catch (requestError) {
            const detail =
                requestError?.response?.data?.source_url?.[0] ||
                requestError?.response?.data?.name?.[0] ||
                requestError?.response?.data?.message ||
                requestError?.response?.data?.detail ||
                'Failed to import timetable';

            setSubscriptionFeedback(detail);
            setSubscriptionFeedbackType('error');
        }
    }

    async function handleRefreshSubscription(subscriptionId) {
        try {
            setSubscriptionFeedback('');
            setSubscriptionFeedbackType('');

            const responseData =
                await refreshCalendarSubscription(subscriptionId);

            setSubscriptions((currentSubscriptions) =>
                currentSubscriptions.map((subscription) =>
                    subscription.id === subscriptionId
                        ? responseData.subscription
                        : subscription
                )
            );

            setSubscriptionFeedback(
                responseData.message || 'Timetable subscription refreshed successfully.'
            );
            setSubscriptionFeedbackType('success');

            await refetchBlocks();
        } catch (requestError) {
            const detail =
                requestError?.response?.data?.source_url?.[0] ||
                requestError?.response?.data?.name?.[0] ||
                requestError?.response?.data?.message ||
                requestError?.response?.data?.detail ||
                'Failed to refresh timetable subscription';

            setSubscriptionFeedback(detail);
            setSubscriptionFeedbackType('error');
        }
    }

    async function handleDeleteSubscription(subscriptionId) {
        try {
            setSubscriptionFeedback('');
            setSubscriptionFeedbackType('');

            await deleteCalendarSubscription(subscriptionId);

            setSubscriptions((currentSubscriptions) =>
                currentSubscriptions.filter(
                    (subscription) => subscription.id !== subscriptionId
                )
            );

            setSubscriptionFeedback('Calendar subscription deleted successfully.');
            setSubscriptionFeedbackType('success');

            await refetchBlocks();
        } catch (requestError) {
            const detail =
                requestError?.response?.data?.message ||
                requestError?.response?.data?.detail ||
                'Failed to delete timetable subscription';

            setSubscriptionFeedback(detail);
            setSubscriptionFeedbackType('error');
        }
    }

    useEffect(() => {
        if (!subscriptionFeedback) return;

        const timer = setTimeout(() => {
            setSubscriptionFeedback('');
            setSubscriptionFeedbackType('');
        }, 5000);

        return () => clearTimeout(timer);
    }, [subscriptionFeedback]);

    if (blocksError) {
    return <p>{blocksError}</p>;
    }
    
    return (
        <>
            <div className="dashboard-content">
                <div className="task-section">
                    <h1>{message}</h1>
                    
                    {pageError && <p className="subscription-error-text">{pageError}</p>}

                    <div className="dashboard-header-actions">
                        <div className="dashboard-add-task">
                            <AddTaskButton />
                        </div>

                        <div className="export-buttons">
                            <button
                                type="button"
                                className="export-csv-button"
                                onClick={() => handleExportCsv(setPageError)}
                            >
                                Export CSV
                            </button>

                            <button
                                type="button"
                                className="export-csv-button"
                                onClick={() => handleExportIcs(setPageError)}
                            >
                                Export ICS
                            </button>
                        </div>
                    </div>

                    <div
                        className="day-section"
                        onClick={() => setShowSubscriptions((prev) => !prev)}
                    >
                        <span
                            className={`arrow ${showSubscriptions ? 'open' : 'closed'}`}
                        >
                            ^
                        </span>
                        <h5>Timetable subscriptions</h5>
                    </div>

                    {showSubscriptions && (
                        <div className="subscription-section">
                            {subscriptionFeedback && subscriptionFeedbackType === 'error' && (
                                <p className="subscription-error-text">{subscriptionFeedback}</p>
                            )}

                            {subscriptionFeedback && subscriptionFeedbackType === 'success' && (
                                <p className="subscription-success-text">{subscriptionFeedback}</p>
                            )}

                            <SubscriptionForm
                                onImport={handleImportSubscription}
                                feedbackMessage={subscriptionFeedback}
                                feedbackType={subscriptionFeedbackType}
                            />
                            <SubscriptionList
                                subscriptions={subscriptions}
                                onRefresh={handleRefreshSubscription}
                                onDelete={handleDeleteSubscription}
                            />
                        </div>
                    )}
                    {totalTasks === 0 && (
                        <p className="no-tasks-message">
                            🎉 Congrats, you have no tasks!
                        </p>
                    )}
                    <TaskGroup
                        title="Overdue"
                        tasks={overdueTasks}
                        setTasks={setOverdueTasks}
                        overdue={true}
                    />
                    <TaskGroup
                        title="Today"
                        tasks={todayTasks}
                        setTasks={setTodayTasks}
                    />
                    <TaskGroup
                        title="Tomorrow"
                        tasks={tomorrowTasks}
                        setTasks={setTomorrowTasks}
                    />
                    <TaskGroup
                        title="Next 7 Days"
                        tasks={weekTasks}
                        setTasks={setWeekTasks}
                    />
                    <TaskGroup
                        title="After Next 7 Days"
                        tasks={beyondWeekTasks}
                        setTasks={setBeyondWeekTasks}
                    />
                </div>
                <NotesSection />
            </div>
        </>
    );
}

export default Dashboard;
