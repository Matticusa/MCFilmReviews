import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import { initializeApp } from 'firebase/app';
import { useContext, useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { firebaseConfig } from '../config/Config.js'

import { FBDbContext } from '../contexts/FBDbContext';
import { FBStorageContext } from '../contexts/FBStorageContext';

import '../styles/Home.css'
initializeApp(firebaseConfig);
const storage = getStorage();

export function Home() {
  const [data, setData] = useState([]);
  const FBDb = useContext(FBDbContext);
  const FBStorage = useContext(FBStorageContext);

  const getData = async () => {
    // get data from firestore collection called "films"
    const querySnapshot = await getDocs(collection(FBDb, "films"));
    // an array to store all the films from firestore
    let films = [];
    querySnapshot.forEach((doc) => {
      let film = doc.data();
      film.id = doc.id;
      // add the film to the array
      films.push(film);
    });
    // set the films array as the data state
    setData(films);
  };
  
  useEffect(() => {
    if (data.length === 0) {
      getData();
    }
  });

  const Image = (props) => {
    const [imgPath, setImgPath] = useState("");
    const imgRef = ref(FBStorage, `film_cover/${props.path}`);
    getDownloadURL(imgRef).then((url) => setImgPath(url));

    return <Card.Img variant="top" src={imgPath} className="card-image" />;
  };

  

  // Setup columns with breakpoints to display cards properly on different size displays
  const Columns = data.map((film, key) => {
    return (
      <Col sm="6" md="4" lg="3" xl="2" key={key} className="my-3">
        <Card className="film-card">
          <Image path={film.image} />
          <Card.Body>
            <Card.Title>{film.title}</Card.Title>
            <Card.Text>
              <div className="genre-bottom">
              <strong>{film.genre}</strong>
              </div>
          </Card.Text>
          </Card.Body>
          <a href={"/detail/" + film.id} className="card-link"></a>
        </Card>
      </Col>
    );
  });

  return (
    <Container>
      <Row>
        {Columns}
      </Row>
    </Container>
  );
}