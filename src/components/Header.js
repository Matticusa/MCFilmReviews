import Navbar from "react-bootstrap/Navbar"
import Container from "react-bootstrap/Container"
import { Navigation } from "./Navigation"
import Col from 'react-bootstrap/Col';
import filmImage from "../images/film.png"
import '../styles/Header.css'

export function Header( props ) {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="Navbar">            
            <Container>
                <Navbar.Brand className="d-flex">
                <img
                    src={filmImage}
                    alt="Film Icon"
                    width="35"
                    height="35"
                    className="d-inline-block align-top"
                    style={{
                        marginRight: "3px",
                        marginTop: "0px",
                      }}
                />
                <h2 
                    className="mb-0 flex-grow-1"
                    style={{
                        marginRight: "20px",
                        marginTop: "0px",
                      }}
                    >
                    MCFilmReviews</h2>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-nav" />
                <Navbar.Collapse id="main-nav">
                <Navigation/>
                </Navbar.Collapse>
            </Container>
            
        </Navbar>
    )
}