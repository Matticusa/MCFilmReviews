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
import { FilmReviewForm } from '../components/FilmReviewForm';

import { FBDbContext } from '../contexts/FBDbContext';
import { FBStorageContext } from '../contexts/FBStorageContext';
import { FBAuthContext } from '../contexts/FBAuthContext';

import '../styles/Detail.css';

export function Detail() {
  const { filmId } = useParams();
  const [filmData, setFilmData] = useState();
  const [auth, setAuth] = useState();
  const [filmReviews, setFilmReviews] = useState([]);
  const [userReviewed, setUserReviewed] = useState(false);
  const [averageStars, setAverageStars] = useState(0);
  const [loading, setLoading] = useState(true);

  const FBDb = useContext(FBDbContext);
  const FBStorage = useContext(FBStorageContext);
  const FBAuth = useContext(FBAuthContext);

  onAuthStateChanged(FBAuth, (user) => {
    if (user) {
      // user is signed in
      setAuth(user);
    } 
    else {
      // user is not signed in
      setAuth(null);
    }
  });

  const getReviews = async () => {
    const path = `films/${filmId}/reviews`;
    const querySnapshot = await getDocs(collection(FBDb, path));
    let reviews = [];
    querySnapshot.forEach((item) => {
      let review = item.data();
      review.id = item.id;
      reviews.push(review);
      if (review.userid === auth?.uid) {
        setUserReviewed(true);
      }
    });
    setFilmReviews(reviews);
  };

  const ReviewCollection = filmReviews.map((item) => (
    <Col xs="6" sm="6" md="4" lg="3" key={item.id}>
      <Card className='review-card'>
        <Card.Body>
          <Card.Title>
            <h5>{item.title}</h5>
          </Card.Title>
          <Card.Text className='review-content'>
            <strong>Reviewed by: {item.username}</strong><br />
            <strong>{item.stars} stars</strong><br />
            <p>{item.content}</p>
            
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  ));

  // function to handle review submission
  const handleSubmitReview = async (reviewData) => {
    // create a document inside firestore
    const path = `films/${filmId}/reviews`;
    const review = await addDoc(collection(FBDb, path), reviewData);
    // when the user submits a new review, refresh the reviews
    getReviews();
    localStorage.setItem('userReviewed', 'true')
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
    

    <div className="main-container d-flex justify-content-center align-items-center">
    <Container className="FilmDetail">
      
      <Row className="my-3">
        <Col xs={12} md={4}>
          <Image path={filmData.image} />
        </Col>
        <Col xs={12} md={8}>
          <h1>{filmData.title}</h1>
          <p>
            Average user review score: {averageStars.toFixed(1)} ({filmReviews.length} reviews)
          </p>
          <h4>Directed by {filmData.director}</h4>
          <h5>{filmData.year} - {filmData.genre}</h5>
          <p>{filmData.summary}</p>
          <h5>Produced by {filmData.producer}</h5>
          <h5>Starring {filmData.actors}</h5>
          <Row className="my-3 align-items-center">
            <div className="col-xl-1 col-lg-1 col-md-2 col-sm-2 col-1">
              <h6 style={{ marginBottom: '0', lineHeight: '1' }}>IMDB:</h6>
            </div>
            <div className="col-xl-5 col-lg-7 col-md-9 col-sm-10 col-10">
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
      <Row className='review-row'>
        <Col md="6">
          {/* Render the ReviewForm based on conditions */}
          {auth !== null && !userReviewed && (
            <FilmReviewForm filmId={filmId} user={auth} reviewed={userReviewed} handleSubmitReview={handleSubmitReview} />
          )}
        </Col>
      </Row>
      <Row className="g-4" style={{ marginBottom: '20px' }}>{ReviewCollection}</Row>
      
    </Container>
    </div>
    
  );
}