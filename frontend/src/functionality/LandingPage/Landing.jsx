import Hero from './Hero/Hero.jsx';
import Card from './Card';
import Features from './Features';
import getTestimonials from './utils/Helpers/getTestimonials.js';
import './stylesheets/Landing.css';

/**
 * Displays the landing page for StudySync.
 *
 * @returns {JSX.Element} The landing page
 */
function Landing() {
    const testimonials = getTestimonials();

    return (
        <div className="landing">
            <Hero />
            <Features />

            <div className="landing-testimonials-wrapper">
                <div className="landing-testimonials">
                    <h2 className="landing-testimonials-title">Student Testimonials</h2>

                    <div className="testimonials-grid">
                        {testimonials.map((testimonial) => (
                            <div className="testimonial-item" key={testimonial.name}>
                                <Card
                                    avatar={testimonial.avatar}
                                    name={testimonial.name}
                                    stars={testimonial.stars}
                                    review={testimonial.review}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Landing;