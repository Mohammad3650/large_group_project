import { api } from '../api.js';

/**
 * Saves a generated schedule
 *
 * @param {object} data - request payload
 * @returns {Promise}
 */
function savePlan(data) {
    return api.post(`/api/plans/save/`, data);
}

export default savePlan;
