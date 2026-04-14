import { useState } from 'react';
import TimeBlockForm from './TimeBlockForm.jsx';
import GeneratorForm from './GeneratorForm.jsx';
import { useCreateTimeBlock } from './utils/Hooks/useCreateTimeBlock.js';
import { useGenerateSchedule } from './utils/Hooks/useGenerateSchedule.js';
import './stylesheets/CreateSchedule.css';

const TABS = [
    { id: 'time-block', label: 'Task' },
    { id: 'generate', label: 'Generate' }
];

/**
 * CreateSchedule component with tabs for the manual task creation or schedule generation.
 * @returns {JSX.Element} The create schedule page.
 */
function CreateSchedule() {
    const [activeTab, setActiveTab] = useState('time-block');

    const {
        handleCreate,
        loading: createLoading,
        serverErrors: createErrors,
        setServerErrors: clearCreateErrors
    } = useCreateTimeBlock();

    const {
        handleGenerate,
        loading: generateLoading,
        serverErrors: generateErrors,
        setServerErrors: clearGenerateErrors
    } = useGenerateSchedule();

    return (
        <div>
            <div className="page-center">
                <div className="time-block-form-card">
                    <h2>Create Schedule</h2>

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


                    {activeTab === 'time-block' && (
                        <TimeBlockForm
                            onSubmit={handleCreate}
                            loading={createLoading}
                            serverErrors={createErrors}
                            clearErrors={() => clearCreateErrors([])}
                        />
                    )}

                    {activeTab === 'generate' && (
                        <div className="tab-panel">
                            <GeneratorForm
                                onSubmit={handleGenerate}
                                loading={generateLoading}
                                serverErrors={generateErrors}
                                clearErrors={() => clearGenerateErrors({})}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateSchedule;
