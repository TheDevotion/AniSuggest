import {Form, Button} from 'react-bootstrap';
import { useRef,useEffect,useState } from 'react';
import {useParams} from 'react-router-dom'
// import axiosPrivate from '../../api/axiosPrivateConfig';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';
import Anime from '../anime/Anime'
import Spinner from '../spinner/Spinner';

const Review = () => {

    const [anime, setAnime] = useState({});
    const [loading, setLoading] = useState(false);
    const revText = useRef();
    const { imdb_id } = useParams();
    const {auth,setAuth} = useAuth();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchAnime = async () => {
            setLoading(true);
            try {
                const response = await axiosPrivate.get(`/anime/${imdb_id}`);
                setAnime(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching anime:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnime();

    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        try {
            
            const response = await axiosPrivate.patch(`/updatereview/${imdb_id}`, { admin_review: revText.current.value });
            console.log(response.data);           

            setAnime(() => ({
                ...anime,
                admin_review: response.data?.admin_review ?? anime.admin_review,
                ranking: {
                    ranking_name: response.data?.ranking_name ?? anime.ranking?.ranking_name
                }
            }));

        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                 console.error('Unauthorized access - redirecting to login');
                 localStorage.removeItem('user');
                // setAuth(null);
            } else {
                console.error('Error updating review:', err);
            }

        } finally {
            setLoading(false);
        }
    }; 
    console.log("Current Auth state: ", auth)
    return (
      <>
        {loading ? (
            <Spinner />
        ) : (
            <div className="container py-5">
                <h2 className="text-center mb-4">Admin Review</h2>
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6 d-flex align-items-center justify-content-center mb-4 mb-md-0">
                        <div className="w-100 shadow rounded p-3 bg-white d-flex justify-content-center align-items-center">
                            <Anime anime={anime} />
                        </div>
                    </div>
                    <div className="col-12 col-md-6 d-flex align-items-stretch">
                        <div className="w-100 shadow rounded p-4 bg-light">
                            {auth && auth.role === "ADMIN" ? (
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="adminReviewTextarea">
                                        <Form.Label>Admin Review</Form.Label>
                                        <Form.Control
                                            ref={revText}
                                            required
                                            as="textarea"
                                            rows={8}
                                            defaultValue={anime?.admin_review}
                                            placeholder="Write your review here..."
                                            style={{ resize: "vertical" }}
                                        />
                                    </Form.Group>
                                    <div className="d-flex justify-content-end">
                                        <Button variant="info" type="submit">
                                            Submit Review
                                        </Button>
                                    </div>
                                </Form> ):(
                                <div className="alert alert-info">{anime.admin_review}</div>
                            )}                           
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>      

    );
}

export default Review;