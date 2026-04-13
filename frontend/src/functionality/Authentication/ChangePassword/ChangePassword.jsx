import AuthCard from '../AuthComponents/AuthCard.jsx';
import AuthField from '../AuthComponents/AuthField.jsx';
import useChangePasswordForm from '../utils/Hooks/useChangePasswordForm.js';
import AuthSubmitButton from '../AuthComponents/AuthSubmitButton.jsx';
import StatusAlerts from '../AuthComponents/StatusAlert.jsx';

function ChangePassword() {
    const {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        message,
        errors,
        loading,
        handleSubmit
    } = useChangePasswordForm();

    return (
        <AuthCard
            title="Change Password"
            subtitle="Update your account password"
            footerText="Back to"
            footerLinkText="Settings"
            footerLinkTo="/settings"
        >
            <StatusAlerts
                errors={errors.global}
                successMessage={message}
            />

            <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                    <AuthField
                        name="currentPassword"
                        label="Current password"
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        error={
                            errors.fieldErrors
                                .currentPassword
                        }
                    />

                    <AuthField
                        name="newPassword"
                        label="New password"
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={setNewPassword}
                        error={
                            errors.fieldErrors.newPassword
                        }
                    />
                </div>

                <div className="d-grid mt-4">
                    <AuthSubmitButton
                        loading={loading}
                        text="Update Password"
                        loadingText="Updating..."
                    />
                </div>
            </form>
        </AuthCard>
    );
}

export default ChangePassword;
