import './stylesheets/Card.css';
/*
  Card Component
  - Displays a single testimonial (avatar, rating, review, name).
  - Reusable UI component used in the landing page.
  - Data is passed via props for flexibility.
  - Presentational only (no state or logic).
*/

function Card({avatar="", stars="", review = "", name=""}) {
    return (
        //outer wrapper for spacing/layout
        <div className="testimonial-card">
            <div className="card-container">
                {/* avatar*/}
                <div className="card-avatar">{avatar}</div>

                {/* content section*/}
                <div className="card-content">
                    {/*star rating*/}
                    <h5 className="card-stars">{stars}</h5>
                    <p className="card-text">{review}</p>

                    {/* name of the review*/}
                    <h4 className="card-title">
                        <i>{name} </i>
                    </h4>
                </div>
            </div>
        </div>
    );
}

export default Card;
