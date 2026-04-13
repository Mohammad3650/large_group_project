import './stylesheets/Card.css';

/**
 * Displays a single testimonial card.
 *
 * @param {Object} props
 * @param {JSX.Element|string} props.avatar - Avatar content shown for the testimonial
 * @param {string} props.stars - Star rating text
 * @param {string} props.review - Review content
 * @param {string} props.name - Reviewer name
 * @returns {JSX.Element} Testimonial card
 */

function Card({ avatar = '', stars = '', review = '', name = '' }) {
    return (
        <div className="testimonial-card">
            <div className="card-container">
                <div className="card-avatar">{avatar}</div>

                <div className="card-content">
                    <h5 className="card-stars">{stars}</h5>
                    <p className="card-text">{review}</p>
                    <h4 className="card-title">
                        <i>{name} </i>
                    </h4>
                </div>
            </div>
        </div>
    );
}

export default Card;
