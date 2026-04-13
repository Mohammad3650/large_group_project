import './stylesheets/Hero.css';
import { useNavigate } from 'react-router-dom';
import useAuthStatus from '../../utils/Auth/authStatus';

import heroPicLight from '../../assets/LandingPage/heropicture.png';
import heroPicDark from '../../assets/LandingPage/heropicture_dark.png';

/**
 * Returns the hero image for the current theme.
 *
 * @returns {string} Hero image path
 */

function getHeroImage() {
    const isDarkTheme = document.body.classList.contains('dark-theme');
    return isDarkTheme ? heroPicLight : heroPicDark;
}

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

/**
 * Renders the action buttons displayed in the hero section.
 *
 * @param {Object} props
 * @param {Array<Object>} props.buttons - Button configuration objects
 * @param {Function} props.onNavigate - Navigation handler
 * @returns {JSX.Element} Hero action buttons
 */
function HeroButtons({ buttons, onNavigate }) {
    return (
        <div className="hero-buttons">
            {buttons.map((button) => (
                <button
                    key={button.label}
                    className={`hero-button ${button.style}`}
                    onClick={() => onNavigate(button.path)}
                >
                    {button.label}
                </button>
            ))}
        </div>
    );
}

/**
 * Renders the text content shown on the left side of the hero section.
 *
 * @param {Object} props
 * @param {Array<Object>} props.buttons - Button configuration objects
 * @param {Function} props.onNavigate - Navigation handler
 * @returns {JSX.Element} Hero text content
 */
function HeroContent({ buttons, onNavigate }) {
    return (
        <div className="hero-left">
            <div className="hero-quote">
                <span className="hero-text-top">Plan your study.</span>
                <br />
                <span className="hero-text-bottom">Live your life.</span>
            </div>
            <HeroButtons buttons={buttons} onNavigate={onNavigate} />
        </div>
    );
}

/**
 * Renders the image shown on the right side of the hero section.
 *
 * @param {Object} props
 * @param {string} props.heroImage - Hero image source
 * @returns {JSX.Element} Hero image section
 */

function HeroImage({ heroImage }) {
    return (
        <div className="hero-right">
            <img className="hero-image" src={heroImage} alt="StudySync hero" />
        </div>
    );
}

/**
 * Displays the hero section of the landing page.
 *
 * @returns {JSX.Element} Hero section
 */
function Hero() {
    const isLoggedIn = useAuthStatus();
    const navigate = useNavigate();

    const heroImage = getHeroImage();
    const buttons = getHeroButtons(isLoggedIn);

    return (
        <section className="hero">
            <div className="hero-content">
                <HeroContent buttons={buttons} onNavigate={navigate} />
                <HeroImage heroImage={heroImage} />
            </div>
        </section>
    );
}

export default Hero;
