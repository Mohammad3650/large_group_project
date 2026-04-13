/**
 * Renders a single event detail row with an icon and value.
 *
 * @param {Object} props
 * @param {JSX.Element} props.icon - Icon shown next to the detail
 * @param {string} props.value - Text value of the detail
 * @returns {JSX.Element}
 */

function EventDetail({ icon, value }) {
    return (
        <div className="event-detail">
            <span className="event-detail-icon">{icon}</span>
            <span>{value}</span>
        </div>
    );
}

export default EventDetail;