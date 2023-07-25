
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import '../styles/About.css'; 

export function Contact() {
  

  return (
    <Container className='AboutCont'>
      <Col md="6" className="d-flex align-items-center">
        <div>
          <center><h1>Contact MCFilmReviews</h1></center>
          <h5>We can be contacted at the following email address: mcfilmreviews@rocketship.com</h5>
        </div>
      </Col>
    </Container>
  );
}