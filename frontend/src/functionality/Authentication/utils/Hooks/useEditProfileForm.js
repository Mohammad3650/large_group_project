import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mapProfileFieldErrors } from '../profileErrorState';
import {
    createEmptyProfileFormData,
    fetchProfileFormData,
    saveProfileFormData,
    deleteProfileAccount
} from '../profileService';
import { EDIT_PROFILE_MESSAGES as MESSAGES } from '../../constants/editProfileConstants.js';
import { createInitialErrors, buildGlobalError } from '../errors.js';

/**
 * isUnauthorizedError checks if an error is an unauthorized error (401)
 * @param {Object} error 
 * @returns {boolean} - true if error is an unauthorized error, false otherwise
 */
function isUnauthorizedError(error) {
    return error?.response?.status === 401;
}

/**
 * Custom hook to manage the state and logic of the Edit Profile form, 
 * including loading existing data, handling form updates, submission, and account deletion.
 * 
 * @returns {Object} {{
 *  formData: Object,
 *  errors: { fieldErrors: Object<string, string[]>, global: string[] },
 *  successMessage: string,
 *  isLoading: boolean,
 *  isSaving: boolean,
 *  updateField: function(name: string, value: string): void,
 *  handleSubmit: function(event: React.FormEvent<HTMLFormElement>): Promise<void>,
 *  handleDeleteAccount: function(): Promise<void>,
 *  goToChangePassword: function(): void
 * }}
*/
function useEditProfileForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(createEmptyProfileFormData);
    const [errors, setErrors] = useState(createInitialErrors);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            try {
                const loadedFormData = await fetchProfileFormData();
                setFormData(loadedFormData);
            } catch (error) {
                if (isUnauthorizedError(error)) {
                    navigate('/login');
                    return;
                }

                setErrors(buildGlobalError(MESSAGES.loadFailed));
            } finally {
                setIsLoading(false);
            }
        }

        loadProfile();
    }, [navigate]);

    /**
     * Updates a field in the profile form data
     * @param {string} name - Field name
     * @param {string} value - New field value
     */
    function updateField(name, value) {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    /**
     * Clears success and error feedback
     */
    function clearFeedback() {
        setErrors(createInitialErrors());
        setSuccessMessage('');
    }

    /**
     * Navigates to the change password page
     */
    function goToChangePassword() {
        navigate('/change-password');
    }

    /**
     * Handles errors that occur during profile saving
     * @param {Object} error - The error object
     * @returns {void}
     */
    function handleSaveError(error) {
        if (isUnauthorizedError(error)) {
            navigate('/login');
            return;
        }

        const responseData = error?.response?.data;

        if (responseData && typeof responseData === 'object') {
            setErrors(mapProfileFieldErrors(responseData));
            return;
        }

        setErrors(buildGlobalError(MESSAGES.saveFailed));
    }

    /**
     * Submits updated profile data
     * @param {Object} event 
     * @returns {Promise<void>}
     */
    async function handleSubmit(event) {
        event.preventDefault();

        if (isSaving) {
            return;
        }

        setIsSaving(true);
        clearFeedback();

        try {
            const updatedFormData = await saveProfileFormData(formData);
            setFormData(updatedFormData);
            setSuccessMessage(MESSAGES.saveSuccess);
        } catch (error) {
            handleSaveError(error);
        } finally {
            setIsSaving(false);
        }
    }

    /**
     * Clears local auth/session data and redirects to homepage
     * on successful account deletion
     * @returns {Promise<void>}
     */
    function handleDeleteSuccess() {
        localStorage.clear();
        window.location.href = '/';
    }

    /**
     * Deletes the user's account after confirmation
     * @returns {Promise<void>}
     */
    async function handleDeleteAccount() {
        const confirmed = window.confirm(MESSAGES.deleteConfirmation);

        if (!confirmed) {
            return;
        }

        try {
            await deleteProfileAccount();
            handleDeleteSuccess();
        } catch {
            setErrors(buildGlobalError(MESSAGES.deleteFailed));
        }
    }

    return {
        formData,
        errors,
        successMessage,
        isLoading,
        isSaving,
        updateField,
        handleSubmit,
        handleDeleteAccount,
        goToChangePassword
    };
}

export default useEditProfileForm;