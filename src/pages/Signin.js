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

export function Signin(props) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [validIdentifier, setValidIdentifier] = useState(false);
  const [validPassword, setValidPassword] = useState(false);

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
          // Handle error or display appropriate message to the user
        }
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      // Handle error
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={{ span: 4, offset: 4 }}>
          <Form
            onSubmit={(evt) => {
              evt.preventDefault();
              signInHandler();
            }}
          >
            <h3>Sign In to your account</h3>
            <Form.Group>
              <Form.Label>Email or Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Email or username"
                onChange={(evt) => setIdentifier(evt.target.value)}
                value={identifier}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="minimum 8 characters"
                onChange={(evt) => setPassword(evt.target.value)}
                value={password}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="my-2 w-100"
              size="lg"
              disabled={!validIdentifier || !validPassword}
            >
              Sign in
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}