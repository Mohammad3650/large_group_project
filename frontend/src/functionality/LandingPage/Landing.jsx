import Hero from './Hero';
import Card from './Card';
import Features from './Features';
import './stylesheets/Landing.css';

const TESTIMONIALS = [
    {
        avatar: 'OK',
        name: 'Omar Kassam',
        stars: '⭐⭐⭐⭐⭐',
        review: '“StudySync helped me actually plan my week instead of just hoping for the best. It’s simple and clear.”'
    },
    {
        avatar: 'IA',
        name: 'Ijaj Ahmed',
        stars: '⭐⭐⭐⭐⭐',
        review: '“I used to miss deadlines all the time. Having everything in one place made a huge difference.”'
    },
    {
        avatar: 'HK',
        name: 'Hamza Khan',
        stars: '⭐⭐⭐⭐⭐',
        review: '“Perfect for university life. I like that it focuses on planning, not distractions or unnecessary clutter.”'
    },
    {
        avatar: 'MI',
        name: 'Mohammed Islam',
        stars: '⭐⭐⭐⭐⭐',
        review: '“Straightforward, easy to use, and actually helpful. Exactly what I needed as a student.”'
    },
    {
        avatar: 'AS',
        name: 'Abdulrahman Sharif',
        stars: '⭐⭐⭐⭐',
        review: '“Using StudySync made my weeks feel more organised, and far less chaotic.”'
    },
    {
        avatar: 'NA',
        name: 'Nabil Ahmed',
        stars: '⭐⭐⭐⭐⭐',
        review: '“It’s really helped me balance lectures, coursework, and revision without feeling overwhelmed.”'
    }
];

/**
 * Displays the landing page for StudySync.
 *
 * @returns {JSX.Element} Landing page
 */
function Landing() {
    return (
        <div className="landing">
            <Hero />
            <Features />

            <div className="landing-testimonials-wrapper">
                <div className="landing-testimonials">
                    <h2 className="landing-testimonials-title">Student Testimonials</h2>

                    <div className="testimonials-grid">
                        {TESTIMONIALS.map((testimonial) => (
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
