import '../stylesheets/Hero/Hero.css';
import { useNavigate } from 'react-router-dom';
import useAuthStatus from '../../Authentication/utils/authStatus.js';
import getHeroImage from '../utils/Helpers/getHeroImage.js';
import getHeroButtons from '../utils/Helpers/getHeroButtons.js';
import HeroContent from './HeroContent.jsx';
import HeroImage from './HeroImage.jsx';

/**
 * Displays the hero section of the landing page.
 *
 * @param {Object} props
 * @param {string} props.theme - The current theme mode ('light' or 'dark')
 * @returns {JSX.Element} Hero section
 */
function Hero({ theme }) {
    const isLoggedIn = useAuthStatus();
    const navigate = useNavigate();

    const heroImage = getHeroImage(theme);
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