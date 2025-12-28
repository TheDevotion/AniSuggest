import {useState, useEffect} from 'react';
import axiosClient from '../../api/axiosConfig'
import Animes from '../animes/Animes';
import Spinner from '../spinner/Spinner';

const Home =({updateAnimeReview}) => {
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState();

    useEffect(() => {
        const fetchAnimes = async () => {
            setLoading(true);
            setMessage("");
            try{
                const response = await axiosClient.get('/animes');
                setAnimes(response.data);
                if (response.data.length === 0){
                    setMessage('There are currently no animes available')
                }

            }catch(error){
                console.error('Error fetching animes:', error)
                setMessage("Error fetching animes")
            }finally{
                setLoading(false)
            }
        }
        fetchAnimes();
    }, []);

    return (
        <>
            {loading ? (
                <Spinner/>
            ):  (
                <Animes animes ={animes} updateAnimeReview={updateAnimeReview} message ={message}/>
            )}
        </>

    );

};

export default Home;



