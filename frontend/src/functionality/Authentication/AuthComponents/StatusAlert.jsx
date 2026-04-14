import AuthErrorAlert from './AuthErrorAlert.jsx';
import AuthSuccessAlert from './AuthSuccessAlert.jsx';

function StatusAlerts({ errors, successMessage }) {
    return (
        <>
            <AuthSuccessAlert message={successMessage} />
            <AuthErrorAlert messages={errors.global} />
        </>
    );
}

export default StatusAlerts;
