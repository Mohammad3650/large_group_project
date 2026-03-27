import { Link } from 'react-router-dom';
import './stylesheets/AuthCard.css';

/**
 * Reusable layout component for authentication pages.
 *
 * Responsibilities:
 * - displays a shared card layout for auth screens
 * - shows a page title and optional subtitle
 * - renders form/content passed in through children
 * - displays a footer with navigation link to another auth page
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Main heading shown at the top of the card
 * @param {string} [props.subtitle] - Optional supporting text under the title
 * @param {string} props.footerText - Text shown before the footer link
 * @param {string} props.footerLinkText - Clickable footer link text
 * @param {string} props.footerLinkTo - Route path for the footer link
 * @param {React.ReactNode} props.children - Content rendered inside the card body
 * @returns {JSX.Element} Shared authentication card layout
 */

function AuthCard({
    title,
    subtitle,
    footerText,
    footerLinkText,
    footerLinkTo,
    children
}) {
    return (
        <div className="auth-page">
            <div className="auth-shell">
                <div className="auth-card card border-0">
                    <div className="card-body py-4 px-5">
                        <div className="text-center mb-4 mt-2">
                            <h3 className="fw-bold mb-1">{title}</h3>

                            {subtitle && (
                                <p className="auth-subtitle mb-0">{subtitle}</p>
                            )}
                        </div>

                        {children}
                    </div>

                    <div className="auth-footer card-footer text-center border-0 pb-4">
                        <small>
                            {footerText}
                            <Link
                                to={footerLinkTo}
                                className="auth-link fw-semibold text-decoration-none ms-1"
                            >
                                {footerLinkText}
                            </Link>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthCard;
