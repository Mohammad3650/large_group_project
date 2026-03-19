import "./stylesheets/Card.css";

/*
  Card Component

  - Displays a single testimonial (avatar, rating, review, name).
  - Reusable UI component used in the landing page.
  - Data is passed via props for flexibility.
  - Presentational only (no state or logic).
*/

function Card(props) {
  return (
    //outer wrapper for spacing/layout
    <div className="card">
      <div className="card_container">
        {/* avatar*/}
        <div className="card_avatar">{props.avatar}</div>

        {/* content section*/}
        <div className="card_content">
          {/*star rating*/}
          <h5 className="card_stars">{props.stars}</h5>
          <p className="card_text">{props.review}</p>

          {/* name of the review*/}
          <h4 className="card_title">
            {" "}
            <i>{props.name} </i>
          </h4>
        </div>
      </div>
    </div>
  );
}

export default Card;
