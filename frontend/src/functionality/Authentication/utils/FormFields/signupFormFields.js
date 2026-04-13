const signupFormFields = [
    {
        name: 'email',
        propName: 'email',
        errorKey: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'you@example.com',
        wrapperClassName: 'col-12'
    },
    {
        name: 'username',
        propName: 'username',
        errorKey: 'username',
        label: 'Username',
        type: 'text',
        placeholder: 'Choose a username',
        wrapperClassName: 'col-12'
    },
    {
        name: 'firstName',
        propName: 'firstName',
        errorKey: 'first_name',
        label: 'First name',
        type: 'text',
        placeholder: 'First name',
        wrapperClassName: 'col-12 col-md-6'
    },
    {
        name: 'lastName',
        propName: 'lastName',
        errorKey: 'last_name',
        label: 'Last name',
        type: 'text',
        placeholder: 'Last name',
        wrapperClassName: 'col-12 col-md-6'
    },
    {
        name: 'phoneNumber',
        propName: 'phoneNumber',
        errorKey: 'phone_number',
        label: 'Phone number',
        type: 'text',
        placeholder: 'e.g. 07123 456 789',
        wrapperClassName: 'col-12'
    },
    {
        name: 'password',
        propName: 'password',
        errorKey: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Create a password',
        wrapperClassName: 'col-12 col-md-6'
    },
    {
        name: 'confirmPassword',
        propName: 'confirmPassword',
        errorKey: 'confirmPassword',
        label: 'Confirm password',
        type: 'password',
        placeholder: 'Confirm password',
        wrapperClassName: 'col-12 col-md-6'
    }
];

export default signupFormFields;