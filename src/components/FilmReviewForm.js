import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { useState } from 'react';

import ReactStars from 'react-stars';

import '../styles/ReviewForm.css';

export function FilmReviewForm({ filmId, user, reviewed, handleSubmitReview }) {
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
  
    console.log('stars:', reviewStars); // Check if the correct star rating value is logged
  
    handleSubmitReview({
      title: reviewTitle,
      content: reviewBody,
      stars: Number(reviewStars),
      userid: reviewUserId,
      username: reviewUsername,
    });
  };

  const SubmitAlert = () => {
    if (submitted) {
      return <Alert variant="success">Thanks for your review</Alert>;
    } else {
      return null;
    }
  };

  if (user && reviewed === false) { 
    return (
      <Form onSubmit={submitHandler}>
        <h4>Add a review for this film</h4>
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>Review Title</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="This film is amazing" 
            name="title" 
            className="grey-placeholder"
            maxLength={40}
          />
        </Form.Group>
        {/* stars rating */}
        <Form.Group>
          <Form.Label>You've given this film <b>{stars}</b> stars out of <b>5</b></Form.Label>
          <ReactStars
            count={5}
            value={stars}
            onChange={(newStars) => {
              console.log('newStars:', newStars); // Check the value of newStars
              setStars(newStars);
            }}
            size={48}
            color1="#CCCCCC"
            color2="#FFD700"
            half={true}
          />
        </Form.Group>
        {/* stars rating */}
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
          <Form.Label>Review Body</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            name="body" 
            placeholder="I love this film" 
            className="grey-placeholder"
          />
        </Form.Group>
        <Form.Control type="hidden" name="uid" value={user.uid} /> {/* Update this line */}
        <Form.Control
          type="hidden"
          name="username"
          value={user.displayName || 'Unknown User'} // Update this line
        /> {/* Include the username in the form data */}
        <Button type="submit" variant="dark" disabled={submitted ? true : false}>
          Add Review
        </Button>
        <SubmitAlert show={submitted} />
      </Form>
    );
  } else {
    return null;
  }
}