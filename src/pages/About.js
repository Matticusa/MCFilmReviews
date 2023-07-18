import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import { FBStorageContext } from '../contexts/FBStorageContext';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

import '../styles/About.css';

export function About() {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const storage = getStorage();
    const imageRef = ref(storage, 'film_cover/MCFilmReviews.png');

    getDownloadURL(imageRef)
      .then((url) => {
        setImageUrl(url);
      })
      .catch((error) => {
        console.log('Error getting image URL:', error);
      });
  }, []);

  return (
    <Container className='AboutCont'>
      <Col md="6">
        <div>
          <center><h1>About MCFilmReviews</h1></center>
          <h4>Welcome to MCFilmReviews, a website inspired by a movie review club. Feel free to browse existing reviews or sign up to submit your own.</h4>
        </div>
        <center><img id="myimg" src={imageUrl} alt="film cover" /></center>
      </Col>
    </Container>
  );
}