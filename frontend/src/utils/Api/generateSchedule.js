import { api } from '../../api.js';

/**
 * Generates a schedule
 *
 * @param {object} data - request payload
 * @returns {Promise}
 */
function generateSchedule(data) {
    return api.post(`/schedule/generates/`, data);
}

export default generateSchedule;
