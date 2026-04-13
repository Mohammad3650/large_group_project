import './stylesheets/Features.css';
import calendarImg from '../../assets/LandingPage/calendar.png';
import settingsImg from '../../assets/LandingPage/settings-64.png';
import balancedStudyImg from '../../assets/LandingPage/balancedstudy.png';
import checklistImg from '../../assets/LandingPage/checklist-59.png';
import timelineImg from '../../assets/LandingPage/timeline-74.png';

/**
 * Feature card content displayed on the landing page.
 */

const FEATURES = [
    {
        image: calendarImg,
        alt: 'Weekly calendar illustration',
        title: 'Constraint-Aware Weekly Calendar',
        text: 'Generates a realistic weekly timetable that respects your fixed commitments, sleep schedule, travel time, and daily study limits.'
    },
    {
        image: settingsImg,
        alt: 'Preferences settings illustration',
        title: 'Set-Up Preferences',
        text: 'Add your sleep window, commute time, and max study hours — these preferences are applied consistently each week.'
    },
    {
        image: balancedStudyImg,
        alt: 'Balanced Study illustration',
        title: 'Balanced Study Allocation',
        text: 'Distributes study sessions across the week to hit your goals without overloading a single day.'
    },
    {
        image: checklistImg,
        alt: 'Checklist replanning illustration',
        title: 'Smart Replanning',
        text: 'Updated your timetable or added a new commitment? Instantly regenerate your schedule using your latest inputs.'
    },
    {
        image: timelineImg,
        alt: 'Timeline history illustration',
        title: 'Plan History by Week',
        text: 'Keep track of how your week-to-week schedule evolves as your workload changes. StudySync stores previous plans so you can look back and understand how your time was managed over the term.'
    }
];

/**
 * Displays the key features of StudySync in a grid layout.
 *
 * @returns {JSX.Element} Features section
 */
function Features() {
    return (
        <div className="features">
            <div className="features-container">
                <div className="features-header">
                    <h1>Why StudySync?</h1>
                    <p>
                        StudySync is designed to help university students manage their time more
                        effectively in courses with heavy coursework demands. By taking into account
                        lectures, labs, personal commitments, and individual study preferences, it
                        generates realistic weekly schedules. The system respects constraints such
                        as sleep, travel time, and daily study limits.
                    </p>
                </div>

                <div className="features-grid">
                    {FEATURES.map((feature) => (
                        <div className="features-card" key={feature.title}>
                            <img
                                className="features-card-image"
                                src={feature.image}
                                alt={feature.alt}
                            />
                            <h2 className="features-card-title">{feature.title}</h2>
                            <p className="features-card-text">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default Features;
