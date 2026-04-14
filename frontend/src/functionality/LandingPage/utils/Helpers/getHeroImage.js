import heroPicLight from '../../../../assets/LandingPage/heropicture.png';
import heroPicDark from '../../../../assets/LandingPage/heropicture_dark.png';

/**
 * Returns the hero image for the current theme.
 *
 * @param {string} theme - The current theme mode ('light' or 'dark')
 * @returns {string} Hero image path
 */
function getHeroImage(theme) {
    return theme === 'dark' ? heroPicDark : heroPicLight;
}

export default getHeroImage;