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
        alt: 'Export schedule',
        title: 'Export Your Schedule',
        text: "Download your generated schedule as a CSV file for use in spreadsheets, or as an ICS file to import directly into Google Calendar, Outlook, or Apple Calendar."
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
        alt: 'Import a timetable',
        title: 'Import Your University Timetable',
        text: "Subscribe to your university's ICS or webcal feed to automatically pull your lectures and classes into StudySync. Refresh or remove subscriptions at any time from the settings page."
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
                        StudySync is an all-in-one academic planner built for university students.
                        Automatically generate a realistic weekly study schedule that respects your
                        lectures, sleep window, commute, and daily limits. Track your tasks on a
                        personal dashboard, view your timetable on an interactive calendar, import
                        your university timetable via a calendar subscription, and export your
                        schedule whenever you need it.
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
