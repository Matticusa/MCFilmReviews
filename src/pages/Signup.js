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
import profilePicture from "../images/profile.jpg"
import emailPicture from "../images/email.png"
import passwordPicture from "../images/lock.jpg"
import tick from "../images/greentick.jpg"

import '../styles/logging.css';

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
  const [emailFeedback, setEmailFeedback] = useState();
  const [passwordFeedback, setPasswordFeedback] = useState();
  const [mpasswordFeedback, setMpasswordFeedback] = useState();
  const [usedIllegalChars, setUsedIllegalChars] = useState(false)
  const [shortUserName, setShortUserName] = useState(false)

  const FBAuth = getAuth();
  const FBDb = useContext(FBDbContext);
  const navigate = useNavigate();

  const allowedChars = "abcdefghijklmnopqrstuvwxyz1234567890_-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let timer;
// function to check Firebase if user already exists
  const checkUser = async (user) => {
    try {
      const ref = doc(FBDb, "usernames", user);
      const docSnap = await getDoc(ref);
      console.log("Firebase Firestore query executed");
      if (docSnap.exists()) {
        //user already exists
        setUserNameFeedback("Username is already taken");
        setValidUserName(false);
      } else {
        //user doesn't exist
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
    // check if the username is of a certain length
    if (userName.length === 0) {
      setUserNameFeedback(null);
      setValidUserName(false); // Set to false when the username is empty
    } else if (userName.length < 5) {
      userLength = false;
      setShortUserName(true);
      setUserNameFeedback("Username must be 5 characters or longer");
      setValidUserName(false); // Set to false when the username is too short
    } else {
      userLength = true;
      setShortUserName(false);
      setUserNameFeedback(null);
      setValidUserName(true); // Set to true when the username is long enough
    }
    // check if username is made of allowedChars
    const chars = Array.from(userName);
    chars.forEach((chr) => {
      if (!allowedChars.includes(chr)) {
        illegalChars.push(chr);
      }
    });
    // check if username does not exist in Firebase if the other two checks are true
    if (illegalChars.length > 0) {
      setUserNameFeedback("Username can only contain letters, numbers, - or _");
      setUsedIllegalChars(true);
      setValidUserName(false); // Set to false when the username contains illegal characters
    } else if (userLength) {
      clearTimeout(timer);
      timer = setTimeout(() => { checkUser(userName) }, 1500);
      setUserNameFeedback(null);
      setUsedIllegalChars(false);
    }
  }, [userName]);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(email) && email.length > 4;
  
    if (email.length < 5) {
      setEmailFeedback("");
    } else if (isValidEmail) {
      setValidEmail(true);
      setEmailFeedback(""); // Clear any previous error message
    } else {
      setValidEmail(false);
      setEmailFeedback("Invalid email address");
    }
  }, [email]);

  useEffect(() => {
    if (password.length === 0) {
      setPasswordFeedback("")
    }
    else if (password.length >= 8) {
      setValidPassword(true);
      setPasswordFeedback("")
    } else {
      setValidPassword(false);
      setPasswordFeedback("Password must be at least 8 characters")
    }
  }, [password]);

  useEffect(() => {
    if (mpassword.length === 0 && password.length < 8) {
      setMpasswordFeedback("");
    } else if (password && password === mpassword) {
      setMatchPassword(true);
      setMpasswordFeedback("");
    } else if (mpassword.length > 0 && password.length >= 8) {
      setMatchPassword(false);
      setMpasswordFeedback("Passwords do not match");
    } else {
      setMpasswordFeedback("");
    }
  }, [password, mpassword]);

  const AddUserName = async () => {
    const user = FBAuth.currentUser;
    const uid = user.uid;
    // store username, uid and email in FBDb
    await setDoc(doc(FBDb, "usernames", userName), {
      name: userName,
      uid: uid,
      email: email,
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
    <Container className="signup-col">
      <Row>
      <Col className="signup-col" md={{ span: 6, offset: 3 }} lg={{ span: 6, offset: 3}} xl={{ span: 4, offset: 4 }} rounded="md">
      <div style={{ height: "calc(100vh - 200px)", overflowY: "auto" }}>
        <row>
          <Form noValidate
            onSubmit={(evt) => {
              evt.preventDefault();
              SignUpHandler();
            }}
          ><p></p>
            <h3>Sign up for an account</h3>
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
            {validUserName && !shortUserName && !usedIllegalChars && (
              <img
              src={tick}
              alt="Tick"
              style={{
                position: "absolute",
                right: "5px", 
                top: "50px",
                transform: "translateY(-50%)",
                width: "20px", 
                height: "20px", 
              }}
            />
            )}
            <Form.Label>Username</Form.Label>
            <Form.Control
              className="grey-placeholder"
              type="text"
              placeholder="Enter Username"
              onChange={(evt) => {
              setUserName(evt.target.value);
              console.log(evt.target.value);
              }}
              value={userName}
              style={{
                paddingLeft: "40px",
                border: userName.length > 0
                  ? validUserName && !shortUserName && !usedIllegalChars
                  ? "3px solid darkgreen" // Green border when the username is valid
                  : "3px solid darkred" // Red border when the username is invalid
                  : "3px solid #ccc" // Default border color (gray)
              }}
            />
            {userNameFeedback && (
            <p style={{ color: "#FFFFFF", fontSize: "18px" }}>{userNameFeedback}</p>
            )}
            </Form.Group>
            <Form.Group style={{ position: "relative" }}>
              <img
                src={emailPicture}
                alt="Email"
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
                {validEmail && (
              <img
              src={tick}
              alt="Tick"
              style={{
                position: "absolute",
                right: "5px", 
                top: "50px",
                transform: "translateY(-50%)",
                width: "20px", 
                height: "20px",
              }}
            />
            )}
            <Form.Label>Email address</Form.Label>
            <Form.Control
              className="grey-placeholder"
              type="email"
              placeholder="Valid Email Address"
              onChange={(evt) => setEmail(evt.target.value)}
              value={email}
              style={{
                paddingLeft: "40px",
                border: email.length > 2
                ? validEmail
                ? "3px solid darkgreen" // Green border when email is valid
                : "3px solid darkred" // Red border when email is invalid
                : "3px solid #ccc" // Default border color (gray)
              }}
            />
            {emailFeedback && (
            <p style={{ color: "#FFFFFF", fontSize: "18px" }}>{emailFeedback}</p>
            )}
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
                {validPassword && (
              <img
              src={tick}
              alt="Tick"
              style={{
                position: "absolute",
                right: "5px", 
                top: "50px",
                transform: "translateY(-50%)",
                width: "20px", 
                height: "20px",
              }}
            />
            )}
              <Form.Label>Password</Form.Label>
              <Form.Control
                className="grey-placeholder"
                type="password"
                placeholder="Minimum 8 characters"
                onChange={(evt) => setPassword(evt.target.value)}
                value={password}
                style={{
                  paddingLeft: "40px",
                  border: password.length > 0
                  ? validPassword
                  ? "3px solid darkgreen" // Green border when email is valid
                  : "3px solid darkred" // Red border when email is invalid
                  : "3px solid #ccc" // Default border color (gray)
                }}
              />
              {passwordFeedback && (
            <p style={{ color: "#FFFFFF", fontSize: "18px" }}>{passwordFeedback}</p>
            )}
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
                {matchPassword && (
              <img
              src={tick}
              alt="Tick"
              style={{
                position: "absolute",
                right: "5px", 
                top: "50px",
                transform: "translateY(-50%)",
                width: "20px", 
                height: "20px",
              }}
            />
            )}
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                className="grey-placeholder"
                type="password"
                placeholder="Minimum 8 characters"
                onChange={(evt) => setMpassword(evt.target.value)}
                value={mpassword}
                style={{
                  paddingLeft: "40px",
                  border: mpassword.length > 0
                  ? matchPassword
                  ? "3px solid darkgreen" // Green border when email is valid
                  : "3px solid darkred" // Red border when email is invalid
                  : "3px solid #ccc" // Default border color (gray)
                }}
              />
              {mpasswordFeedback && (
            <p style={{ color: "#FFFFFF", fontSize: "18px" }}>{mpasswordFeedback}</p>
            )}
            </Form.Group>
            
            <Button
              variant="outline-dark"
              type="submit"
              className="my-2 w-100"
              size="lg"
              style={{ opacity: (!validEmail || !validPassword || !matchPassword || !validUserName) ? 0.3 : 1, cursor: (!validEmail || !validPassword || !matchPassword || !validUserName) ? 'not-allowed' : 'pointer' }}
              disabled={!validEmail || !validPassword || !matchPassword || !validUserName}>
            Sign up
            </Button>
          </Form>
          </row>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
