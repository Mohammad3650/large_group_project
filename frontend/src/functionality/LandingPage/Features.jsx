import "./stylesheets/Features.css";
import calendarImg from "../../assets/LandingPage/calendar.png";
import settingsImg from "../../assets/LandingPage/settings-64.png";
import balancedStudyImg from "../../assets/LandingPage/balancedstudy.png";
import checklistImg from "../../assets/LandingPage/checklist-59.png";
import timelineImg from "../../assets/LandingPage/timeline-74.png";






function Features() {
  return (
    <div className="features">
      <div className="features_container">
        <div className="features_header">
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



        <div className="features_grid">
          <div className="features_card">
            <img className="features_card_image" src={calendarImg} alt="Calendar feature"></img>
            <h2 className="features_card_title">Constraint-Aware Weekly Calendar</h2>
            <p className="features_card_text">
              Generates a realistic weekly timetable that respects your fixed
              commitments, sleep schedule, travel time, and daily study limits.
            </p>
          </div>


          <div className="features_card">
            <img className="features_card_image" src={settingsImg} alt="Calendar feature"></img>
            <h2 className="features_card_title">Set-Up Preferences</h2>
            <p className="features_card_text">
              Add your sleep window, commute time, and max study hours — we’ll
              use them every week.
            </p>
          </div>


          <div className="features_card">
            <img className="features_card_image" src={balancedStudyImg} alt="Calendar feature"></img>
            <h2 className="features_card_title">Balanced Study Allocation</h2>
            <p className="features_card_text">
              Distributes study sessions across the week to hit your goals
              without cramming everything into one day.
            </p>
          </div>



          <div className="features_card">
            <img className="features_card_image" src={checklistImg} alt="Calendar feature"></img>
            <h2 className="features_card_title">One-Click Replanning</h2>
            <p className="features_card_text">
              Changed your timetable or added a shift? Regenerate a new plan
              using your updated inputs.
            </p>
          </div>

          <div className="features_card">
            <img className="features_card_image" src={timelineImg} alt="Calendar feature"></img>
            <h2 className="features_card_title">Plan History by Week</h2>
            <p className="features_card_text">
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
