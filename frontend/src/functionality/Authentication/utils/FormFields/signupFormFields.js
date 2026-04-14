const signupFormFields = [
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'you@example.com',
        wrapperClassName: 'col-12'
    },
    {
        name: 'username',
        label: 'Username',
        type: 'text',
        placeholder: 'Choose a username',
        wrapperClassName: 'col-12'
    },
    {
        name: 'firstName',
        label: 'First name',
        type: 'text',
        placeholder: 'First name',
        wrapperClassName: 'col-12 col-md-6'
    },
    {
        name: 'lastName',
        label: 'Last name',
        type: 'text',
        placeholder: 'Last name',
        wrapperClassName: 'col-12 col-md-6'
    },
    {
        name: 'phoneNumber',
        label: 'Phone number',
        type: 'text',
        placeholder: 'e.g. 07123 456 789',
        wrapperClassName: 'col-12'
    },
    {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Create a password',
        wrapperClassName: 'col-12 col-md-6'
    },
    {
        name: 'confirmPassword',
        label: 'Confirm password',
        type: 'password',
        placeholder: 'Confirm password',
        wrapperClassName: 'col-12 col-md-6'
    }
];

export default signupFormFields;
