/**
 * Returns the hero button configuration for the current user state.
 *
 * @param {boolean} isLoggedIn - Whether the user is authenticated
 * @returns {Array<Object>} Hero button configuration
 */
function getHeroButtons(isLoggedIn) {
    return isLoggedIn
        ? [
            { label: 'Dashboard', path: '/dashboard', style: 'black' },
            { label: 'Calendar', path: '/calendar', style: 'white' }
        ]
        : [
            { label: 'Sign Up', path: '/signup', style: 'black' },
            { label: 'Login', path: '/login', style: 'white' }
        ];
}

export default getHeroButtons;