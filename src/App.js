import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorage } from "./useLocalStorage";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function MoviesNum({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);
  
  useKey("Enter", function(){
    if (document.activeElement === inputEl.current) 
      return;
    inputEl.current.focus();
    setQuery("");
  })


  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function Main({ children }) {
  return (
    <main className="main">
      <>{children}</>
    </main>
  );
}

function WatchedMovie({ movie, onDelete }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button className="btn-delete" onClick={() => onDelete(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
}

function WatchedMovies({ watched, onDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie onDelete={onDelete} key={movie.imdbID} movie={movie} />
      ))}
    </ul>
  );
}

function WatchedSummry({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function List({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Movies({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie onSelectMovie={onSelectMovie} movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓️</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Loader() {
  return <p className="loader">Loading.....</p>;
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function MoviesDetails({ selectedID, onCloseDetails, onAddWatchd, watched }) {
  const [isLoading, setIsLoading] = useState(false);
  const [movieDetails, setMoviesDetails] = useState({});
  const [userRating, setUSerRating] = useState("");



  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedID);
  const watchedRating = watched.find(
    (movie) => movie.imdbID === selectedID
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieDetails;


  function handleAdd() {
    const newWatchdMovie = {
      imdbID: selectedID,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatchd(newWatchdMovie);
  }

  useKey("Escape", onCloseDetails)


  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedID}`
        );

        const data = await res.json();
        setMoviesDetails(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedID]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = title;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseDetails}>
              &larr;
            </button>
            <img src={poster} alt={`poster of ${title}`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  {" "}
                  <StarRating
                    maxRating={10}
                    size={26}
                    onSetRating={setUSerRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      Add to list{" "}
                    </button>
                  )}{" "}
                </>
              ) : (
                <p>You gave this movie {watchedRating} stars</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Staring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}


const KEY = "3a2fb12b";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedID, setSElectedId] = useState(null);

  const {movies, isLoading, error} = useMovies(query);

  const [watched, setWatched] = useLocalStorage([], "watched")


  function handleSelect(id) {
    setSElectedId((selectedID) => (id === selectedID ? null : id));
  }

  function handleCloseDetails() {
    setSElectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDelete(id) {
    setWatched(watched.filter((movie) => movie.imdbID !== id));
  }



  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <MoviesNum movies={movies} />
      </NavBar>
      <Main>
        <List>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <Movies movies={movies} onSelectMovie={handleSelect} />
          )}
          {error && <ErrorMessage message={error} />}
        </List>
        <List>
          {selectedID ? (
            <MoviesDetails
              selectedID={selectedID}
              onCloseDetails={handleCloseDetails}
              onAddWatchd={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummry watched={watched} />
              <WatchedMovies watched={watched} onDelete={handleDelete} />
            </>
          )}
        </List>
      </Main>
    </>
  );
}
