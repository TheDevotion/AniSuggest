import { Form, Button, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';
import Anime from '../anime/Anime';
import Spinner from '../spinner/Spinner';

const Review = () => {
    const [anime, setAnime] = useState({});
    const [loading, setLoading] = useState(false);
    const [reviewText, setReviewText] = useState(""); // Controlled input state
    const [errorMsg, setErrorMsg] = useState(""); // To show errors to user

    const { imdb_id } = useParams();
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchAnime = async () => {
            setLoading(true);
            try {
                const response = await axiosPrivate.get(`/anime/${imdb_id}`);
                setAnime(response.data);
                setReviewText(response.data.admin_review || ""); // Initialize text
            } catch (error) {
                console.error('Error fetching anime:', error);
                setErrorMsg("Failed to load anime data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnime();
    }, [imdb_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(""); // Clear previous errors

        try {
            // Send the review text from state
            const response = await axiosPrivate.patch(`/updatereview/${imdb_id}`, { 
                admin_review: reviewText 
            });

            console.log("Update Success:", response.data);

            // Update local state with the new data from server
            setAnime((prev) => ({
                ...prev,
                admin_review: response.data?.admin_review ?? prev.admin_review,
                ranking: {
                    ranking_name: response.data?.ranking_name ?? prev.ranking?.ranking_name
                }
            }));
            
            alert("Review updated successfully!");

        } catch (err) {
            console.error(err);
            if (err.response) {
                setErrorMsg(`Update Failed: ${err.response.data?.error || "Server Error"}`);
            } else {
                setErrorMsg("Network Error: Could not reach server.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">Admin Review</h2>
            
            {/* Show Error Message if exists */}
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

            <div className="row justify-content-center">
                <div className="col-12 col-md-6 d-flex align-items-center justify-content-center mb-4 mb-md-0">
                    <div className="w-100 shadow rounded p-3 bg-white d-flex justify-content-center align-items-center">
                        {/* If anime is empty, show spinner here specifically, not blocking whole page */}
                        {!anime.title && loading ? <Spinner /> : <Anime anime={anime} />}
                    </div>
                </div>
                
                <div className="col-12 col-md-6 d-flex align-items-stretch">
                    <div className="w-100 shadow rounded p-4 bg-light">
                        {auth && auth.role === "ADMIN" ? (
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="adminReviewTextarea">
                                    <Form.Label>Admin Review</Form.Label>
                                    <Form.Control
                                        required
                                        as="textarea"
                                        rows={8}
                                        value={reviewText} // Controlled Input
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Write your review here..."
                                        style={{ resize: "vertical" }}
                                        disabled={loading} // Disable instead of hide
                                    />
                                </Form.Group>
                                <div className="d-flex justify-content-end">
                                    <Button variant="info" type="submit" disabled={loading}>
                                        {loading ? "Updating..." : "Submit Review"}
                                    </Button>
                                </div>
                            </Form> 
                        ) : (
                            <div className="alert alert-info">
                                {anime.admin_review || "No review available."}
                            </div>
                        )}                           
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Review;