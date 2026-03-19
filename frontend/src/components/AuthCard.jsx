import { Link } from "react-router-dom";

function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
  children,
}) {
  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body py-4 px-5">
            <div className="text-center mb-4 mt-2">
              <h3 className="fw-bold mb-1">{title}</h3>
              {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
            </div>
            {children}
          </div>

          <div className="card-footer text-center bg-white border-0 pb-4">
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