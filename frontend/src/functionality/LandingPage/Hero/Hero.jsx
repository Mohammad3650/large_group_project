import '../stylesheets/Hero/Hero.css';
import { useNavigate } from 'react-router-dom';
import useAuthStatus from '../../Authentication/utils/authStatus.js';
import getHeroButtons from '../utils/Helpers/getHeroButtons.js';
import HeroContent from './HeroContent.jsx';
import HeroImage from './HeroImage.jsx';

/**
 * Displays the hero section of the landing page.
 *
 * @returns {JSX.Element} Hero section
 */
function Hero() {
    const isLoggedIn = useAuthStatus();
    const navigate = useNavigate();

    const buttons = getHeroButtons(isLoggedIn);

    return (
        <section className="hero">
            <div className="hero-content">
                <HeroContent buttons={buttons} onNavigate={navigate} />
                <HeroImage />
            </div>
        </section>
    );
}

export default Hero;