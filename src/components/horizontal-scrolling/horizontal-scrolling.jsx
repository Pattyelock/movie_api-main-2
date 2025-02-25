import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export const HorizontalScrolling = ({ children }) => {
  return (
    <Row>
      {/* Container with horizontal scrolling */}
      <Col md={12} className="scrolling-movies-container">
        <div className="scrolling-movies-scroll">
          {children}
        </div>
      </Col>
    </Row>
  )
}