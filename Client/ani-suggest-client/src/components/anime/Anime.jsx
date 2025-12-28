import Button from 'react-bootstrap/Button'
import { Link } from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCirclePlay} from '@fortawesome/free-solid-svg-icons';
import "./Anime.css";
const Anime = ({anime,updateAnimeReview}) => {
    return (
        <div className="col-md-4 mb-4" key={anime._id}>
            <Link
                to={`/stream/${anime.youtube_id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
            >
            <div className="card h-100 shadow-sm anime-card">
                <div style={{position:"relative"}}>
                    <img src={anime.poster_path} alt={anime.title} 
                        className="card-img-top"
                        style={{
                            objectFit: "contain",
                            height: "250px",
                            width: "100%"
                        }}
                    />
                    <span className="play-icon-overlay">
                            <FontAwesomeIcon icon={faCirclePlay} />
                    </span>
                </div>
                <div className = "card-body d-flex flex-column">
                    <h5 className ="card-title">{anime.title}</h5>
                    <p className="card-text mb-2">{anime.imdb_id}</p>
                </div>
                {anime.ranking?.ranking_name && (
                    <span className="badge bg-dark m-3 p-2" style={{fontSize:"1rem"}}>
                        {anime.ranking.ranking_name}
                    </span>
                )}
                  {updateAnimeReview && (
                        <Button
                            variant="outline-info"
                            onClick={e => {
                                e.preventDefault();
                                updateAnimeReview(anime.imdb_id);
                            }}
                            className="m-3"
                        >
                            Review
                        </Button>
                    )}
            </div>
            </Link>
        </div>
    )
}
export default Anime;