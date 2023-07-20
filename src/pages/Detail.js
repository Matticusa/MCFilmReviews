import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, getDocs, collection, addDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';

import { FBDbContext } from '../contexts/FBDbContext';
import { FBStorageContext } from '../contexts/FBStorageContext';
import { FBAuthContext } from '../contexts/FBAuthContext';

import '../styles/Detail.css';

export function Detail() {
  const { filmId } = useParams();
  const [filmData, setFilmData] = useState();
  const [auth, setAuth] = useState();
  const [filmReviews, setFilmReviews] = useState([]);
  const [reviewed, setReviewed] = useState(false);
  const [averageStars, setAverageStars] = useState(0);
  const [loading, setLoading] = useState(true);

  const FBDb = useContext(FBDbContext);
  const FBStorage = useContext(FBStorageContext);
  const FBAuth = useContext(FBAuthContext);

  onAuthStateChanged(FBAuth, (user) => {
    if (user) {
      // user is signed in
      setAuth(user);
    } else {
      // user is not signed in
      setAuth(null);
    }
  });

  const getReviews = async () => {
    const path = `films/${filmId}/reviews`;
    const querySnapshot = await getDocs(collection(FBDb, path));
    const reviews = [];
    let userReviewed = false;
    querySnapshot.forEach((item) => {
      const review = item.data();
      review.id = item.id;
      reviews.push(review);
      if (review.userid === auth?.uid) {
        userReviewed = true;
      }
    });
    setFilmReviews(reviews);
    setReviewed(userReviewed);
  };

  const ReviewForm = () => {
    const [stars, setStars] = useState(5);
    const [submitted, setSubmitted] = useState(false);

    const submitHandler = (event) => {
      event.preventDefault();
      setSubmitted(true);
      const data = new FormData(event.target);
      const reviewTitle = data.get('title');
      const reviewBody = data.get('body');
      const reviewStars = parseFloat(data.get('stars')) || stars;

      const reviewUserId = data.get('uid');
      const reviewUsername = data.get('username');

      const review = {
        title: reviewTitle,
        content: reviewBody,
        stars: Number(reviewStars),
        userid: reviewUserId,
        username: reviewUsername,
      };

      addDoc(collection(FBDb, `films/${filmId}/reviews`), review).then(() => {
        getReviews();
      });
    };

    const SubmitAlert = (props) => {
      if (props.show) {
        return <Alert variant="success">Thanks for your review</Alert>;
      } else {
        return null;
      }
    };

    if (auth && !reviewed) {
      return (
        <Form onSubmit={submitHandler}>
          <h4>Add a review for this film</h4>
          {/* Review form contents */}
          <SubmitAlert show={submitted} />
        </Form>
      );
    } else {
      return null;
    }
  };

  const Image = (props) => {
    const [imgPath, setImgPath] = useState();
    const imgRef = ref(FBStorage, `film_cover/${props.path}`);
    getDownloadURL(imgRef).then((url) => setImgPath(url));

    return <img src={imgPath} className="img-fluid" alt="Film Cover" />;
  };

  useEffect(() => {
    const getFilmData = async () => {
      const filmRef = doc(FBDb, 'films', filmId);
      const filmDoc = await getDoc(filmRef);
      if (filmDoc.exists()) {
        setFilmData(filmDoc.data());
        getReviews();
      } else {
        // no film exists with the ID
      }
    };

    getFilmData();
  }, [FBDb, filmId]);

  useEffect(() => {
    const calculateAverageStars = () => {
      if (filmReviews.length === 0) {
        setAverageStars(0);
      } else {
        const totalStars = filmReviews.reduce((sum, review) => sum + review.stars, 0);
        const average = totalStars / filmReviews.length;
        setAverageStars(average);
      }
    };

    calculateAverageStars();
  }, [filmReviews]);

  useEffect(() => {
    if (filmData) {
      setLoading(false);
    }
  }, [filmData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container className='MovDetail'>
      
      <Row className="my-3">
        <Col md="4">
          <p></p><Image path={filmData.image} />
        </Col>
        <Col md="8">
          <h1>{filmData.title}</h1>
          <p>Average user review score: {averageStars.toFixed(1)} ({filmReviews.length} reviews)</p>
          <h4>Directed by {filmData.director}</h4>
          <h5>{filmData.year} - {filmData.genre}</h5>
          <p>{filmData.summary}</p>
          <h5>Produced by {filmData.producer}</h5>
          <h5>Starring {filmData.actors}</h5>
          <Row className="my-3">
            <div className="col-1">
              <h6>IMDB:</h6>
            </div>
            <div className="col-5">
              <a href={filmData.imdb} className="wave-link">
                &nbsp; {filmData.imdb}
                <svg
                  className="link__graphic link__graphic--slide"
                  width="300%"
                  height="100%"
                  viewBox="0 0 1200 60"
                  preserveAspectRatio="none"
                >
                  <path d="M0,56.5c0,0,298.666,0,399.333,0C448.336,56.5,513.994,46,597,46c77.327,0,135,10.5,200.999,10.5c95.996,0,402.001,0,402.001,0"></path>
                </svg>
              </a>
            </div>
          </Row>
          <h5>Rated {filmData.classification}</h5>
          <h5>{filmData.time} minutes</h5>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <ReviewForm />
        </Col>
      </Row>
      <Row>{filmReviews.map((item) => (
        <Col md="3" key={item.id}>
          <Card className='review-card'>
            <Card.Body>
              <Card.Title>
                <h5>{item.title}</h5>
              </Card.Title>
              <Card.Text className='review-content'>
                <strong>Reviewed by: {item.username}</strong><br />                
                <strong>{item.stars} stars</strong><br />
                {item.content}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
      </Row>
    <p> </p>
    </Container>
  );
}