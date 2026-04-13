import '../stylesheets/Hero/HeroImage.css';

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

export default HeroImage;