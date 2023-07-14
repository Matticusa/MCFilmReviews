import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import { ReviewForm } from '../components/ReviewForm';

import { useParams } from 'react-router-dom'

import { useContext, useState, useEffect } from 'react';
import { FBDbContext } from '../contexts/FBDbContext';
import { FBStorageContext } from '../contexts/FBStorageContext';
import { AuthContext } from '../contexts/AuthContext';
import { FBAuthContext } from '../contexts/FBAuthContext';

import { doc, getDoc, addDoc, collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

import '../styles/Detail.css';

export function Detail(props) {
  const [filmData, setFilmData] = useState();
  const [auth, setAuth] = useState();
  const [filmReviews, setFilmReviews] = useState([]);
  const [reviewed, setReviewed] = useState(false);

  const [averageStars, setAverageStars] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  let { filmId } = useParams();

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
    let reviews = [];
    let userReviewed = false;
    querySnapshot.forEach((item) => {
      let review = item.data();
      review.id = item.id;
      reviews.push(review);
      if (review.userid === auth?.uid) {
        userReviewed = true;
      }
    });
    setFilmReviews(reviews);
    setReviewed(userReviewed);
  };

  // reviews collection
  const ReviewCollection = filmReviews.map((item) => {
    return (
      <Col md="3" key={item.id}>
        <Card>
          <Card.Body>
            <Card.Title>
              <h5>{item.title}</h5>
            </Card.Title>
            <Card.Text>
              Reviewed by: {item.username}
              <br />
              {item.content}
              <br />
              {item.stars} stars
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    );
  });

  const filmRef = doc(FBDb, "films", filmId);

  const getFilm = async () => {
    let film = await getDoc(filmRef);
    if (film.exists()) {
      setFilmData(film.data());
      getReviews();
    } else {
      // no film exists with the ID
    }
  };

  useEffect(() => {
    if (!filmData) {
      getFilm(filmId);
    }
  }, [filmData, filmId]);

  // function to handle review submission
  const ReviewHandler = async (reviewData) => {
    const path = `films/${filmId}/reviews`;
    const review = {
      title: reviewData.title,
      content: reviewData.content,
      stars: reviewData.stars !== undefined ? reviewData.stars : 0, // Provide a default value if stars is undefined
      userid: reviewData.userid,
      username: reviewData.username,
    };
  
    const reviewDocRef = await addDoc(collection(FBDb, path), review);
  
    // Refresh the reviews when a new review is submitted
    getReviews();
  };

  const Image = ( props ) => {
    const [imgPath,setImgPath] = useState()
    const imgRef = ref( FBStorage, `film_cover/${ props.path }`)
    getDownloadURL( imgRef ).then( (url) => setImgPath(url) )

    return(
        <img src={imgPath} className="img-fluid" />
    )
  }

  const calculateAverageStars = () => {
    if (filmReviews.length === 0) {
      setAverageStars(0);
    } else {
      const totalStars = filmReviews.reduce((sum, review) => sum + review.stars, 0);
      const average = totalStars / filmReviews.length;
      setAverageStars(average);
    }
  };

  useEffect(() => {
    calculateAverageStars();
  }, [filmReviews]);

  if (filmData) {
    return (
      <Container>
        <Row className='my-3'>
          <Col md="4">
            <Image path={filmData.image} />
          </Col>
          <Col md="8">
            <h1>{filmData.title}</h1>
            <p>
            Average user review score: {averageStars.toFixed(1)} ({filmReviews.length} reviews)
            </p>
            <h4>Directed by {filmData.director} </h4>
            <h5>{filmData.year} - {filmData.genre}</h5>
            <p> </p>
            <p>{filmData.summary}</p>
            <h5>Produced by {filmData.producer}</h5>
            <h5>Starring {filmData.actors}</h5>
            <p> </p>
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
           <p> </p>
            <h5>Rated {filmData.classification}</h5>
            <h5>{filmData.time} minutes</h5>
          </Col>
        </Row>
        <Row>
          <Col>
            <ReviewForm user={auth} handler={ReviewHandler} reviewed={reviewed} />
          </Col>
        </Row>
        <Row>
          {/* reviews to appear here */}
          {ReviewCollection}
        </Row>
      </Container>
    )
  }
  else {
    return (
      <Container>
        <Row>
          <Col>
            <h2>Loading...</h2>
          </Col>
        </Row>
      </Container>
    )
  }
}