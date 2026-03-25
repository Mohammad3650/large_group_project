import { Link } from "react-router-dom";

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
    children,
}) {
    return (
        <div className="d-flex align-items-center justify-content-center auth-card-wrapper">
            <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                <div className="card shadow-lg border-0 rounded-4">
                    <div className="card-body py-4 px-5">
                        <div className="text-center mb-4 mt-2">
                            {/* Main card heading */}
                            <h3 className="fw-bold mb-1">{title}</h3>

                            {/* Optional subtitle shown only if provided */}
                            {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
                        </div>

                        {/* Page-specific content such as login or signup form */}
                        {children}
                    </div>

                    {/* Footer link for switching between auth pages */}
                    <div className="card-footer text-center bg-white border-0 pb-4 rounded-4">
                        <small className="text-muted">
                            {footerText}
                            <Link
                                to={footerLinkTo}
                                className="fw-semibold text-decoration-none ms-1"
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