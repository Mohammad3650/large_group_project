import AuthErrorAlert from './AuthErrorAlert';
import AuthSuccessAlert from './AuthSuccessAlert';

function StatusAlerts({ errors, successMessage }) {
    return (
        <>
            <AuthSuccessAlert message={successMessage} />
            <AuthErrorAlert messages={errors.global} />
        </>
    );
}

export default StatusAlerts;
