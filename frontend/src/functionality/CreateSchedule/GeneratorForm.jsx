import GeneratorFormItem from './GeneratorFormItem.jsx';
import DateRangeInput from './DateRangeInput.jsx';
import TimeWindowInput from './TimeWindowInput.jsx';
import GlobalOptions from './GlobalOptions.jsx';
import FormActions from './FormActions.jsx';
import useGeneratorForm from './utils/Hooks/useGeneratorForm.js';
import './stylesheets/GeneratorForm.css';


/**
 * GeneratorForm renders schedule input fields and manages unscheduled block state.
 * Users can add / remove blocks, set week range, time windows, and global options.
 * @param {{onSubmit:function, loading:boolean, serverErrors:object, clearErrors:function}} props
 * @returns {JSX.Element}
 */
function GeneratorForm({ onSubmit, loading, serverErrors, clearErrors }) {
    const {
        weekStart,
        setWeekStart,
        weekEnd,
        setWeekEnd,
        evenSpread,
        handleEvenSpreadChange,
        includeScheduled,
        setIncludeScheduled,
        windows,
        updateWindow,
        blocks,
        updateBlock,
        deleteBlock,
        addBlock,
        handleSubmit,
    } = useGeneratorForm(onSubmit, loading, serverErrors, clearErrors);

    return (
        <form onSubmit={handleSubmit}>
            {serverErrors?.general && (
                <p className="error-text">{serverErrors.general[0]}</p>
            )}

            <DateRangeInput
                weekStart={weekStart}
                setWeekStart={setWeekStart}
                weekEnd={weekEnd}
                setWeekEnd={setWeekEnd}
                serverErrors={serverErrors}
            />

            <TimeWindowInput
                windows={windows}
                updateWindow={updateWindow}
                serverErrors={serverErrors}
            />

            {/* Global options */}
            <GlobalOptions
                evenSpread={evenSpread}
                handleEvenSpreadChange={handleEvenSpreadChange}
                includeScheduled={includeScheduled}
                setIncludeScheduled={setIncludeScheduled}
            />

            {blocks.map((block, index) => (
                <GeneratorFormItem
                    key={index}
                    block={block}
                    index={index}
                    serverErrors={serverErrors}
                    updateBlock={updateBlock}
                    deleteBlock={deleteBlock}
                    blocksLength={blocks.length}
                />
            ))}

            <FormActions
                addBlock={addBlock}
                handleSubmit={handleSubmit}
                loading={loading}
            />
        </form>
    );
}

export default GeneratorForm;
