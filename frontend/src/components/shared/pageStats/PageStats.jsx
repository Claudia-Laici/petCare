import { Card, Row, Col } from "react-bootstrap";
import "./PageStats.css"

const PageStats = ({ stats }) => {
  return (
    <Row className="g-3">
      {stats.map((stat) => (
        <Col xs={12} sm={6} lg={4} key={stat.id}>
          <Card className="card-base border-0 shadow-sm rounded-4 p-3 h-100">
            <Card.Body className="p-1 d-flex flex-column">
              <div className="icon-dashboard d-inline-flex align-items-center justify-content-center rounded-3 mb-3">
                {stat.icon}
              </div>

              <div>
                <h3 className="fw-bold mb-1 text-dark fs-3">
                  {stat.loading ? "—" : stat.value}
                </h3>

                <p className="text-muted-small fw-medium mb-0">
                  {stat.label}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default PageStats;