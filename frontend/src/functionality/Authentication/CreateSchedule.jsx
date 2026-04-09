import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import TimeBlockForm from '../../components/timeBlockForm.jsx';
import GeneratorForm from '../../components/GeneratorForm.jsx';
import generateSchedule from '../../utils/Api/generateSchedule.js';

const TABS = [
    { id: 'timeblock', label: 'Time Block' },
    { id: 'generate', label: 'Generate' }
];

/**
 * CreateSchedule component with tabs for manual time block creation or schedule generation.
 * @returns {JSX.Element}
 */
function CreateSchedule() {
    const navigate = useNavigate();
    const [serverErrors, setServerErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('timeblock');

    async function handleCreate(dataList) {
        if (loading) return;

        setServerErrors([]);
        setLoading(true);

        const errors = [];
        let allSuccess = true;
        let createdBlockId = null;

        for (const data of dataList) {
            // ensure previousely allowed to be "" for start_time and end_time are now null for error handling
            const cleanedData = {
                ...data,
                start_time: data.start_time === '' ? null : data.start_time,
                end_time: data.end_time === '' ? null : data.end_time
            };

            try {
                const res = await api.post('/api/time-blocks/', cleanedData);
                errors.push({});
                if (!createdBlockId) createdBlockId = res.data.id;
            } catch (err) {
                console.log('ERROR RESPONSE:', err.response?.data);
                errors.push(err.response?.data || {});
                allSuccess = false;
            }
        }

        setServerErrors(errors);
        setLoading(false);

        if (allSuccess)
            navigate('/successful-timeblock', {
                state: { id: createdBlockId }
            });
    }

    /**
     * Generate schedule via API, store result in session, and navigate to preview.
     * @param {object} data
     */
    async function handleGenerate(data) {
        if (loading) return;

        setServerErrors({});
        setLoading(true);

        let allSuccess = true;
        let response = null;

        try {
            response = await generateSchedule(data);

            const events = response.data?.events || [];

            if (events.length === 0) {
                setServerErrors({
                    general: [
                        'No feasible schedule could be generated with the given constraints.'
                    ]
                });
                return;
            }
            setServerErrors({});
            sessionStorage.setItem(
                'generatedSchedule',
                JSON.stringify(response.data)
            );
            navigate('/preview-calendar');
        } catch (err) {
            console.log('ERROR RESPONSE:', err.response?.data);

            setServerErrors(err.response?.data || {});
            allSuccess = false;
        } finally {
            setLoading(false);
        }
        console.log(response);
    }

    return (
        <div>
            <div className="page-center">
                <div className="time-block-form-card">
                    <h2>Create Schedule</h2>

                    {/* Tab Bar */}
                    <div className="tab-bar">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'tab-btn--active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {success && <p>{success}</p>}

                    {activeTab === 'timeblock' && (
                        <TimeBlockForm
                            onSubmit={handleCreate}
                            loading={loading}
                            serverErrors={serverErrors}
                            clearErrors={() => setServerErrors([])}
                        />
                    )}

                    {activeTab === 'generate' && (
                        <div className="tab-panel">
                            <GeneratorForm
                                onSubmit={handleGenerate}
                                loading={loading}
                                serverErrors={serverErrors}
                                clearErrors={() => setServerErrors({})}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateSchedule;
