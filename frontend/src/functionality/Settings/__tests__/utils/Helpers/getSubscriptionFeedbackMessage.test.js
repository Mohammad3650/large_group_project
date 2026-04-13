import { describe, it, expect } from 'vitest';
import getSubscriptionFeedbackMessage from '../../../utils/Helpers/getSubscriptionFeedbackMessage.js';

describe('getSubscriptionFeedbackMessage', () => {
    it('returns the source_url validation message when present', () => {
        const error = {
            response: {
                data: {
                    source_url: ['Invalid ICS URL.']
                }
            }
        };

        expect(getSubscriptionFeedbackMessage(error)).toBe('Invalid ICS URL.');
    });

    it('returns the name validation message when source_url is absent', () => {
        const error = {
            response: {
                data: {
                    name: ['Name is required.']
                }
            }
        };

        expect(getSubscriptionFeedbackMessage(error)).toBe('Name is required.');
    });

    it('returns the backend message when validation arrays are absent', () => {
        const error = {
            response: {
                data: {
                    message: 'Subscription import failed.'
                }
            }
        };

        expect(getSubscriptionFeedbackMessage(error)).toBe(
            'Subscription import failed.'
        );
    });

    it('returns the backend detail when message is absent', () => {
        const error = {
            response: {
                data: {
                    detail: 'Request could not be processed.'
                }
            }
        };

        expect(getSubscriptionFeedbackMessage(error)).toBe(
            'Request could not be processed.'
        );
    });

    it('returns the fallback message when no known backend message exists', () => {
        expect(getSubscriptionFeedbackMessage({})).toBe(
            'Failed to import timetable.'
        );
    });
});