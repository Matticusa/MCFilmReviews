import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { useState, useEffect, useContext } from "react";
import { FBAuthContext } from "../contexts/FBAuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FBDbContext } from "../contexts/FBDbContext";
import profilePicture from "../images/profile.jpg"
import passwordPicture from "../images/lock.jpg"

import '../styles/logging.css';

export function Signin(props) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [validIdentifier, setValidIdentifier] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const FBAuth = useContext(FBAuthContext);
  const FBDb = useContext(FBDbContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (identifier.trim().length > 0) {
      setValidIdentifier(true);
    } else {
      setValidIdentifier(false);
    }
  }, [identifier]);

  useEffect(() => {
    if (password.length >= 8) {
      setValidPassword(true);
    } else {
      setValidPassword(false);
    }
  }, [password]);

  const signInHandler = async () => {
    try {
      setAuthError("");
      if (identifier.includes("@")) {
        // Email sign-in
        const authCredential = await signInWithEmailAndPassword(FBAuth, identifier, password);
        const user = authCredential.user;
        console.log(user);
        navigate("/");
      } else {
        // Username sign-in
        const usernamesRef = collection(FBDb, "usernames");
        const q = query(usernamesRef, where("name", "==", identifier));
        const querySnapshot = await getDocs(q);
        console.log("Query Snapshot:", querySnapshot);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const email = userDoc.data().email;
          const authCredential = await signInWithEmailAndPassword(FBAuth, email, password);
          const user = authCredential.user;
          console.log(user);
          navigate("/");
        } else {
          // User with the entered username not found
          setAuthError("User credentials incorrect...");
        }
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      setAuthError("User credentials incorrect...");
    }
  };

  return (
    <Container className="signup-col">
      <Row>
        <Col className="signup-col" md={{ span: 4, offset: 4 }}>
          <Form
            onSubmit={(evt) => {
              evt.preventDefault();
              signInHandler();
            }}
          ><p></p>
            <h3>Sign In to your account</h3>
            <Form.Group style={{ position: "relative" }}>
            <img
              src={profilePicture}
              alt="Profile"
              style={{
                position: "absolute",
                left: "0px",
                top: "52px",
                transform: "translateY(-50%)",
                width: "35px",
                height: "35px",
                borderRadius: "25%",
                objectFit: "cover",
              }}
            />
              <Form.Label>Email or Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Email or username"
                onChange={(evt) => setIdentifier(evt.target.value)}
                value={identifier}
                style={{
                  paddingLeft: "40px",
                  border: "3px solid #ccc" // Default border color (gray)
                }}
              />
            </Form.Group>
            <Form.Group style={{ position: "relative" }}>
            <img
                src={passwordPicture}
                alt="Password"
                style={{
                position: "absolute",
                left: "0px",
                top: "52px",
                transform: "translateY(-50%)",
                width: "35px",
                height: "35px",
                borderRadius: "25%",
                objectFit: "cover",
                }}
                />
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Minimum 8 characters"
                onChange={(evt) => setPassword(evt.target.value)}
                value={password}
                style={{
                  paddingLeft: "40px",
                  border: "3px solid #ccc" // Default border color (gray)
                }}
              />
            </Form.Group>
            <Button
              variant="outline-dark"
              type="submit"
              className="my-2 w-100"
              size="lg"
              style={{ opacity: (!validIdentifier || !validPassword) ? 0.3 : 1, cursor: (!validIdentifier || !validPassword) ? 'not-allowed' : 'pointer' }}
              disabled={!validIdentifier || !validPassword}>
              Sign in
            </Button>
          </Form>
          {authError && (
            <p style={{ color: "white", fontSize: "20px" }}><center>{authError}</center></p>
          )}
        </Col>
      </Row>
    </Container>
  );
}