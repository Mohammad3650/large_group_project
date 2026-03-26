//Import images used for each feature card
import "./stylesheets/Features.css";
import calendarImg from "../../assets/LandingPage/calendar.png";
import settingsImg from "../../assets/LandingPage/settings-64.png";
import balancedStudyImg from "../../assets/LandingPage/balancedstudy.png";
import checklistImg from "../../assets/LandingPage/checklist-59.png";
import timelineImg from "../../assets/LandingPage/timeline-74.png";

/*
  Features Component

  - Displays key features of StudySync in a grid layout.
  - Helps communicate the system’s value to users.
  - Uses static content and imported assets.
  - Presentational only (no state or logic).
*/

function Features() {
  return (
    <div className="features">
      {/* Main container for layout and width control */}
      <div className="features-container">
        <div className="features-header">
          <h1>Why StudySync?</h1>
          <p>
            StudySync is designed to help university students manage their time
            more effectively in courses with heavy coursework demands. By taking
            into account lectures, labs, personal commitments, and individual
            study preferences, it generates realistic weekly schedules. The
            system respects constraints such as sleep, travel time, and daily
            study limits.
          </p>
        </div>

        {/* Grid layout containing individual feature cards */}
        <div className="features-grid">
          {/* Feature 1 */}
          <div className="features-card">
            <img
              className="features-card-image"
              src={calendarImg}
              alt="Weekly calendar illustration"
            />
            <h2 className="features-card-title">
              Constraint-Aware Weekly Calendar
            </h2>
            <p className="features-card-text">
              Generates a realistic weekly timetable that respects your fixed
              commitments, sleep schedule, travel time, and daily study limits.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="features-card">
            <img
              className="features-card-image"
              src={settingsImg}
              alt="Preferences settings illustration"
            />
            <h2 className="features-card-title">Set-Up Preferences</h2>
            <p className="features-card-text">
              Add your sleep window, commute time, and max study hours — we’ll
              use them every week.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="features-card">
            <img
              className="features-card-image"
              src={balancedStudyImg}
              alt="Balanced Study illustration"
            />
            <h2 className="features-card-title">Balanced Study Allocation</h2>
            <p className="features-card-text">
              Distributes study sessions across the week to hit your goals
              without cramming everything into one day.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="features-card">
            <img
              className="features-card-image"
              src={checklistImg}
              alt="Checklist replanning illustration"
            />
            <h2 className="features-card-title">One-Click Replanning</h2>
            <p className="features-card-text">
              Changed your timetable or added a shift? Regenerate a new plan
              using your updated inputs.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="features-card">
            <img
              className="features-card-image"
              src={timelineImg}
              alt="Timeline history illustration"
            />
            <h2 className="features-card-title">Plan History by Week</h2>
            <p className="features-card-text">
              Keep track of how your week-to-week schedule evolves as your
              workload changes. StudySync stores previous plans so you can look
              back and understand how your time was managed over the term.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Features;
