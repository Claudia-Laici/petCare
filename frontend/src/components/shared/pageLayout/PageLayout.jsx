import Container from "react-bootstrap/Container";
import "./PageLayout.css";

const PageLayout = ({
  title,
  description,
  breadcrumb,
  action,
  stats,
  toolbar,
  filters,
  children,
  className = "",
  contentClassName = "",
  headerClassName = "",
}) => {
  return (
    <main
      className={`mt-5 d-flex page-layout ${className}`}
    >
      <Container>
        <header
          className={`page-layout-header ${headerClassName}`}
        >
          <div className="page-layout-heading">
            {breadcrumb && (
              <div className="page-layout-breadcrumb">
                {breadcrumb}
              </div>
            )}

            <h1 className="page-layout-title">
              {title}
            </h1>

            {description && (
              <p className="page-layout-description">
                {description}
              </p>
            )}
          </div>

          {action && (
            <div className="page-layout-actions">
              {action}
            </div>
          )}
        </header>

        {stats && (
          <section className="page-layout-stats">
            {stats}
          </section>
        )}

        {toolbar && (
          <section className="page-layout-toolbar">
            {toolbar}
          </section>
        )}

        {filters && (
          <section className="page-layout-filters">
            {filters}
          </section>
        )}

        <section
          className={`page-layout-content ${contentClassName}`}
        >
          {children}
        </section>
      </Container>
    </main>
  );
};

export default PageLayout;