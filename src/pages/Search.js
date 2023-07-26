import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "../config/Config.js";
import { Container, Col, Row } from "react-bootstrap";

import '../styles/Search.css';

// Initialize Firebase app
initializeApp(firebaseConfig);

export function Search() {
  const [films, setFilms] = useState([]);
  const [searchType, setSearchType] = useState("title");
  const [searchValue, setSearchValue] = useState("");
  const [searchOption, setSearchOption] = useState("exact");
  const [searchValue2, setSearchValue2] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false); // Track if search has been performed
  const [isFormReady, setIsFormReady] = useState(false); // Track if the form is ready to be submitted


  const handleSearchTypeChange = (event) => {
    setSearchType(event.target.value);
    setSearchOption("exact");
    setSearchValue2("");
  };

  const handleSearchValueChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSearchOptionChange = (event) => {
    setSearchOption(event.target.value);
  };

  const handleSearchValue2Change = (event) => {
    setSearchValue2(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchPerformed(true); // Set search Performed to true when search is performed
    fetchFilms();
  };

  const fetchFilms = async () => {
    setIsSearching(true);
    const db = getFirestore();
    const filmsCollection = collection(db, "films");
    const querySnapshot = await getDocs(filmsCollection);
    const filmsData = querySnapshot.docs.map((doc) => doc.data());

    let filteredFilms = filmsData;

    // search by film title
    if (searchType === "title") {
      filteredFilms = filmsData.filter((film) => {
        return film.title.toLowerCase().includes(searchValue.toLowerCase());
      });
    }
    // search by name of director
    if (searchType === "director") {
      filteredFilms = filmsData.filter((film) => {
        const directors = Array.isArray(film.director)
          ? film.director.map((d) => d.toLowerCase())
          : [film.director.toLowerCase()];
        return directors.some((d) => d.includes(searchValue.toLowerCase()));
      });
    }
    // search by year film was released
    if (searchType === "year") {
      if (searchOption === "exact") {
        filteredFilms = filmsData.filter((film) => {
          return film.year === parseInt(searchValue);
        });
      } else if (searchOption === "between") {
        const minYear = parseInt(searchValue);
        const maxYear = parseInt(searchValue2);
        filteredFilms = filmsData.filter((film) => {
          return film.year >= minYear && film.year <= maxYear;
        });
      }
    }
    // search by length of film
    if (searchType === "time") {
      if (searchOption === "exact") {
        filteredFilms = filmsData.filter((film) => {
          return film.time === parseInt(searchValue);
        });
      } else if (searchOption === "between") {
        const minTime = parseInt(searchValue);
        const maxTime = parseInt(searchValue2);
        filteredFilms = filmsData.filter((film) => {
          return film.time >= minTime && film.time <= maxTime;
        });
      }
    }

    setFilms(filteredFilms);
    setIsSearching(false); // Set the searching flag back to false
  };

  useEffect(() => {
    const fetchFilmsData = async () => {
      const db = getFirestore();
      const filmsCollection = collection(db, "films");
      const querySnapshot = await getDocs(filmsCollection);
      const filmsData = querySnapshot.docs.map((doc) => doc.data());
      setFilms(filmsData);
      setIsFetched(true);
    };

    fetchFilmsData();
  }, []);

  return (
    <Container className="SearchCont">
      <Col md="12">
        <h2>Search Films</h2>
        <form onSubmit={handleSubmit}>
          <Row>
          <Col  sm="6" md="5" lg="4" xl="3">
              
                <label>
                <h5><input
                    type="radio"
                    value="title"
                    checked={searchType === "title"}
                    onChange={handleSearchTypeChange}
                    className="custom-radio"
                    style={{
                      marginRight: "5px",
                      marginTop: "0px",
                      appearance: "none", // Disable the default OS styles for radio buttons
                    }}
                  />
                  Search by Title</h5>
                  <p><i>Search for all or part of the title - search is not case-sensitive.</i></p>

                </label>
              </Col>
              <Col  sm="6" md="6" lg="5" xl="3">
                <label>
                  <h5><input
                    type="radio"
                    value="director"
                    checked={searchType === "director"}
                    onChange={handleSearchTypeChange}
                    className="custom-radio"
                    style={{
                      marginRight: "5px",
                      marginTop: "0px",
                      appearance: "none", // Disable the default OS styles for radio buttons
                    }}
                  />
                  Search by Director</h5>
                  <p><i>Search by first, last or full Name - search is not case-sensitive.</i></p>
                </label>
              </Col>
            </Row>
            <Row>
              <Col sm="6" md="5" lg="4" xl="3">
                <label>
                  <h5><input
                    type="radio"
                    value="year"
                    checked={searchType === "year"}
                    onChange={handleSearchTypeChange}
                    className="custom-radio"
                    style={{
                      marginRight: "5px",
                      marginTop: "0px",
                      appearance: "none", // Disable the default OS styles for radio buttons
                    }}
                  />
                  Search by Year</h5>
                  <p><i>Search for an exact year or select "between" to search between years</i></p>
                </label>
              </Col>
              <Col sm="6" md="6" lg="5" xl="3">
                <label>
                  <h5><input
                    type="radio"
                    value="time"
                    checked={searchType === "time"}
                    onChange={handleSearchTypeChange}
                    className="custom-radio"
                    style={{
                      marginRight: "5px",
                      marginTop: "0px",
                      appearance: "none", // Disable the default OS styles for radio buttons
                    }}
                  />
                  Search by Length</h5>
                  <p><i>Search an exact Runtime or select "between" to search between two values (minutes)</i></p>
                </label>
              </Col>
            
          </Row>
          {searchType === "year" || searchType === "time" ? (
            <Row>
              <Col xs="6" sm="5" md="4" lg="3" xl="2">
                <label>
                  <input
                    type="radio"
                    value="exact"
                    checked={searchOption === "exact"}
                    onChange={handleSearchOptionChange}
                    className="custom-radio"
                    style={{
                      marginRight: "5px",
                      marginTop: "0px",
                      appearance: "none", // Disable the default OS styles for radio buttons
                    }}
                  />
                  Exact
                </label>
                </Col>
                <Col xs="6" sm="5" md="4" lg="3" xl="2">
                <label>
                  <input
                    type="radio"
                    value="between"
                    checked={searchOption === "between"}
                    onChange={handleSearchOptionChange}
                    className="custom-radio"
                    style={{
                      marginRight: "5px",
                      marginTop: "0px",
                      appearance: "none", // Disable the default OS styles for radio buttons
                    }}
                  />
                  Between
                </label>
              </Col>
            </Row>
          ) : null}
          <Row style={{ paddingLeft: "40px" }}>
            <Col xs="6" sm="5" md="4" lg="3" xl="2">
              <div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearchValueChange}
                  placeholder={`Enter ${searchType}...`}
                />
              </div>
            </Col>
            {searchOption === "between" ? (
              <Col xs="6" sm="5" md="4" lg="3" xl="2">
                <div>
                  <input
                    type="text"
                    value={searchValue2}
                    onChange={handleSearchValue2Change}
                    placeholder="Enter second value..."
                  />
                </div>
              </Col>
            ) : null}
          </Row>
          <div style={{ paddingLeft: "40px" }}>
            <button type="submit" >Search</button>
          </div>
        </form>

        {isFetched && searchPerformed && !isSearching && films.length === 0 && (
          <p>No films found.</p>
        )}

        {isSearching ? (
          <p>Loading films...</p>
        ) : (
          searchPerformed &&
          films.map((film) => (
            <div key={film.id}>
              <h3>{film.title}</h3>
              <p>Year: {film.year}</p>
              <p>Time: {film.time}</p>
              <p>
                Directed by:{" "}
                {Array.isArray(film.director)
                  ? film.director.join(" and ")
                  : film.director}
              </p>
              <p></p>
            </div>
          ))
        )}
      </Col>
    </Container>
  );
}