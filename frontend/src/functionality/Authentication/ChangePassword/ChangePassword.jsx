import { useNavigate } from 'react-router-dom';
import AuthCard from '../AuthComponents/AuthCard.jsx';
import AuthField from '../AuthComponents/AuthField.jsx';
import AuthErrorAlert from '../AuthComponents/AuthErrorAlert.jsx';
import AuthSuccessAlert from '../AuthComponents/AuthSuccessAlert.jsx';
import useChangePasswordForm from '../utils/Hooks/useChangePasswordForm.js';

function ChangePassword() {
    const navigate = useNavigate();

    const {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        message,
        errors,
        loading,
        handleSubmit
    } = useChangePasswordForm(navigate);

    return (
        <AuthCard
            title="Change Password"
            subtitle="Update your account password"
            footerText="Back to"
            footerLinkText="Settings"
            footerLinkTo="/settings"
        >
            <AuthErrorAlert messages={errors.global} />
            <AuthSuccessAlert message={message} />

            <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                    <AuthField
                        name="currentPassword"
                        label="Current password"
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        error={errors.fieldErrors.currentPassword}
                    />

                    <AuthField
                        name="newPassword"
                        label="New password"
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={setNewPassword}
                        error={errors.fieldErrors.newPassword}
                    />
                </div>

                <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-dark rounded-3" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </AuthCard>
    );
}

export default ChangePassword;
