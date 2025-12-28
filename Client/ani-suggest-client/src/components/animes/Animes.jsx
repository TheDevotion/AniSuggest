import Anime from '../anime/Anime'

const Animes = ({animes,updateAnimeReview, message}) => {

    return (
        <div className="container mt-4">
            <div className="row">
                {animes && Array.isArray(animes) && animes.length > 0
    ? animes.map((anime) => (
        <Anime key={anime._id} updateAnimeReview={updateAnimeReview} anime={anime} />
    ))
    : <h2>{message || "No animes found"}</h2> // Fallback if it's not an array
}

            </div>

        </div>
    )
}
export default Animes;