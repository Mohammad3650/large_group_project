const SAVE_STATUS_TEXT = {
    saving: 'Saving...',
    error: 'Error saving ✗',
    saved: 'Saved ✓'
};

function getNotesSaveStatusText(saveStatus) {
    return SAVE_STATUS_TEXT[saveStatus] || '\u00A0';
}

export default getNotesSaveStatusText;