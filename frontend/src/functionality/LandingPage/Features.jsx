import "./Features.css";
import calendarImg from "./photos/calendar.png";
import settingsImg from "./photos/settings-64.png";
import balancedStudyImg from "./photos/balancedstudy.png";
import checklistImg from "./photos/checklist-59.png";
import timelineImg from "./photos/timeline-74.png";

function Features() {
  return (
    <div className="featuresmaincard">
      <div className="featuresContainer">
        <div className="MainHeader">
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

        <div className="MainGrid">
          <div className="card">
            <img className="photo" src={calendarImg}></img>
            <h2>Constraint-Aware Weekly Calendar</h2>
            <p>
              Generates a realistic weekly timetable that respects your fixed
              commitments, sleep schedule, travel time, and daily study limits.
            </p>
          </div>

          <div className="card">
            <img className="photo" src={settingsImg}></img>
            <h2>Set-Up Preferences</h2>
            <p>
              Add your sleep window, commute time, and max study hours — we’ll
              use them every week.
            </p>
          </div>

          <div className="card">
            <img className="photo" src={balancedStudyImg}></img>
            <h2>Balanced Study Allocation</h2>
            <p>
              Distributes study sessions across the week to hit your goals
              without cramming everything into one day.
            </p>
          </div>

          <div className="card">
            <img className="photo" src={checklistImg}></img>
            <h2>One-Click Replanning</h2>
            <p>
              Changed your timetable or added a shift? Regenerate a new plan
              using your updated inputs.
            </p>
          </div>

          <div className="card">
            <img className="photo" src={timelineImg}></img>
            <h2>Plan History by Week</h2>
            <p>
              Keep track of how your week-to-week schedule evolves as 
              your workload changes.StudySync stores previous plans so 
              you can look back and understand how your time was managed 
              over the term.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Features;
