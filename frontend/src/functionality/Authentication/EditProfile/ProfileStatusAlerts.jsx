function ProfileStatusAlerts({ errors, successMessage }) {
    return (
        <>
            {successMessage && (
                <div className="alert alert-success text-center">
                    {successMessage}
                </div>
            )}

            {errors.global.length > 0 && (
                <div className="alert alert-danger text-center">
                    {errors.global.map((error) => (
                        <div key={error}>{error}</div>
                    ))}
                </div>
            )}
        </>
    );
}

export default ProfileStatusAlerts;