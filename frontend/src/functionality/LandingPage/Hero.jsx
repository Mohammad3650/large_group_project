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

function getHeroImage(theme) {
    return theme === 'dark' ? heroPicDark : heroPicLight;
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
 * Displays the hero section of the landing page.
 *
 * @returns {JSX.Element} Hero section
 */
function Hero({ theme }) {
    const isLoggedIn = useAuthStatus();
    const navigate = useNavigate();

    const heroImage = getHeroImage(theme);
    const buttons = getHeroButtons(isLoggedIn);

    return (
        <div className="hero">
            <div className="hero-content">
                <div className="hero-left">
                    <div className="hero-quote">
                        <span className="hero-text-top">Plan your study.</span>
                        <br />
                        <span className="hero-text-bottom">Live your life.</span>
                    </div>

                    <div className="hero-buttons">
                        {buttons.map((button) => (
                            <button
                                key={button.label}
                                className={`hero-button ${button.style}`}
                                onClick={() => navigate(button.path)}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="hero-right">
                    <img className="hero-image" src={heroImage} alt="StudySync hero" />
                </div>
            </div>
        </div>
    );
}

export default Hero;
