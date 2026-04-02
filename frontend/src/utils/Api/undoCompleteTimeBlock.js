import { api } from '../../api.js';

function undoCompleteTimeBlock(id) {
    if (!id) throw new Error('Invalid id');
    return api.patch(`/api/time-blocks/${id}/undo-complete/`);
}

export default undoCompleteTimeBlock;
