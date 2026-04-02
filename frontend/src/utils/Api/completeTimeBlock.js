import { api } from '../../api.js';

function completeTimeBlock(id) {
    if (!id) throw new Error('Invalid id');
    return api.patch(`/api/time-blocks/${id}/complete/`);
}

export default completeTimeBlock;
