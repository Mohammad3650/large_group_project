import '../stylesheets/Hero/HeroImage.css';
import heroPic from '../../../assets/LandingPage/hero.png';

/**
 * Renders the image shown on the right side of the hero section.
 *
 * @returns {JSX.Element} Hero image section
 */
function HeroImage() {
    return (
        <div className="hero-right">
            <img className="hero-image" src={heroPic} alt="StudySync hero" />
        </div>
    );
}

export default HeroImage;