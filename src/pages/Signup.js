import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { useState, useEffect, useContext } from "react";
import { FBAuthContext } from "../contexts/FBAuthContext";
import { FBDbContext } from "../contexts/FBDbContext";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export function Signup(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mpassword, setMpassword] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [matchPassword, setMatchPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [validUserName, setValidUserName] = useState(false);
  const [userNameFeedback, setUserNameFeedback] = useState();

  const FBAuth = getAuth();
  const FBDb = useContext(FBDbContext);
  const navigate = useNavigate();

  const allowedChars = "abcdefghijklmnopqrstuvwxyz1234567890_-";
  let timer;

  const checkUser = async (user) => {
    try {
      const ref = doc(FBDb, "usernames", user);
      const docSnap = await getDoc(ref);
      console.log("Firebase Firestore query executed");
      if (docSnap.exists()) {
        setUserNameFeedback("Username is already taken");
        setValidUserName(false);
      } else {
        setUserNameFeedback(null);
        setValidUserName(true);
      }
    } catch (error) {
      console.log("Firebase Firestore query error:", error);
      // Handle the error and display an appropriate message to the user
    }
  };
  
  useEffect(() => {
    let userLength = false;
    let illegalChars = [];
  
    if (userName.length < 5) {
      userLength = false;
    } else {
      userLength = true;
    }
  
    const chars = Array.from(userName);
    chars.forEach((chr) => {
      if (!allowedChars.includes(chr)) {
        illegalChars.push(chr);
      }
    });
  
    if (userLength && illegalChars.length === 0) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log("checkUser called");
        checkUser(userName);
      }, 1500);
    }
  }, [userName]);

  useEffect(() => {
    if (email.indexOf("@") > 0) {
      setValidEmail(true);
    } else {
      setValidEmail(false);
    }
  }, [email]);

  useEffect(() => {
    if (password.length >= 8) {
      setValidPassword(true);
    } else {
      setValidPassword(false);
    }
  }, [password]);

  useEffect(() => {
    if (password && password === mpassword) {
      setMatchPassword(true);
    } else {
      setMatchPassword(false);
    }
  }, [password, mpassword]);

  const AddUserName = async () => {
    const user = FBAuth.currentUser;
    const uid = user.uid;
  
    await setDoc(doc(FBDb, "usernames", userName), {
      name: userName,
      uid: uid,
    });
  };

  const SignUpHandler = () => {
  createUserWithEmailAndPassword(FBAuth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Set the display name
      updateProfile(user, {
        displayName: userName
      })
        .then(() => {
          // Log the user document data
          AddUserName();
          console.log("User document data:", user);
          navigate("/");
        })
        .catch((error) => {
          console.error("Error setting display name:", error);
        });
    })
    .catch((error) => {
      console.error(error.code, error.message);
    });
};

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={{ span: 4, offset: 4 }}>
          <Form
            onSubmit={(evt) => {
              evt.preventDefault();
              SignUpHandler();
            }}
          >
            <h3>Sign up for an account</h3>
            <Form.Group>
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Valid Email Address"
                onChange={(evt) => setEmail(evt.target.value)}
                value={email}
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
            <Form.Group>
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="minimum 8 characters"
                onChange={(evt) => setMpassword(evt.target.value)}
                value={mpassword}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Username"
                onChange={(evt) => {
                setUserName(evt.target.value);
                console.log(evt.target.value);
              }}
  value={userName}
/>
              {userNameFeedback && (
                <p className="text-danger">{userNameFeedback}</p>
              )}
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="my-2 w-100"
              size="lg"
              disabled={
                !validEmail || !validPassword || !matchPassword || !validUserName
              }
            >
              Sign up
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
