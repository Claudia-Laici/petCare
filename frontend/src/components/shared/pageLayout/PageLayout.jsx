import Container from "react-bootstrap/Container";
import "./PageLayout.css";

const PageLayout = ({
  title,
  description,
  action,
  stats,
  filters,
  children,
}) => {
  return (
    <Container className="px-4 py-4">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1 page-layout-title">
            {title}
          </h1>

          {description && (
            <p className="text-muted mb-0">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      {stats && (
        <section className="mb-4">
          {stats}
        </section>
      )}

      {filters && (
        <section className="mb-4">
          {filters}
        </section>
      )}

      <section>
        {children}
      </section>
    </Container>
  );
};

export default PageLayout;