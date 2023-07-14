import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FBStorageContext } from '../contexts/FBStorageContext';
import {
    getStorage,
    ref,
    getDownloadURL
  } from 'firebase/storage';

const storage = getStorage();

getDownloadURL(ref(storage, 'film_cover/MCFilmReviews.jpg'))
  .then((url) => {
    // url is the download URL for 'film_cover/MCFilmReviews.jpg'
    const img = document.getElementById('myimg');
    if (img) {
    img.setAttribute('src', url);
    } else {
      console.log('img is null');
  }})


  
export function About() {
    return (
        <Container>
            <Col md="6">
            <div>
                <center><h1>About FilmReviews</h1></center>
                <h4>Welcome to FilmReviews, a website inspired by a movie review club, Feel free to browse existing reviews or sign up to submit your own.   </h4>
            </div>

            <img id="myimg" src="" alt="film cover" />
            </Col>
        </Container>
    )
}