import React, { useContext, useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FBDbContext } from '../contexts/FBDbContext';
import { getAuth } from 'firebase/auth';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

export function Profile() {
  const auth = getAuth();
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState('');
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewedFilms, setReviewedFilms] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const FBDb = useContext(FBDbContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reviewsCollectionRef = collection(FBDb, 'films');
        const q = query(reviewsCollectionRef);
        const querySnapshot = await getDocs(q);

        const films = [];
        let reviewCount = 0;
        const fetchReviewsPromises = querySnapshot.docs.map(async (doc) => {
          const filmData = doc.data();
          const filmReviewsCollectionRef = collection(FBDb, `films/${doc.id}/reviews`);
          const querySnapshotReviews = await getDocs(filmReviewsCollectionRef);
          const reviews = querySnapshotReviews.docs.map((reviewDoc) => reviewDoc.data());
          const userReviewedFilm = reviews.find((review) => review.uid === user?.uid);
          if (userReviewedFilm) {
            reviewCount += 1;
            const film = {
              id: doc.id,
              title: filmData.title,
            };
            films.push(film);
          }
        });

        await Promise.all(fetchReviewsPromises);

        setReviewCount(reviewCount);
        setReviewedFilms(films);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (user) {
      setUsername(user.displayName || 'Unknown User');
      fetchData();
    }
  }, [FBDb, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Col md="6">
        <div>
          <h1>Welcome, {username}!</h1>
          <p>You have reviewed {reviewCount} films.</p>
          <h3>Films Reviewed</h3>
          <ul>
            {reviewedFilms.map((film) => (
              <li key={film.id}>{film.title}</li>
            ))}
          </ul>
          {/* Display other profile information here */}
        </div>
      </Col>
    </Container>
  );
}