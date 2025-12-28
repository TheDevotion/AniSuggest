import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import {useEffect, useState} from 'react';
import Animes from '../animes/Animes';
import Spinner from '../spinner/Spinner';

const Recommended = () => {
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchRecommendedAnimes = async () => {
            setLoading(true);
            setMessage("");

            try{
                const response = await axiosPrivate.get('/recommendedanimes');
                setAnimes(response.data);
            } catch (error){
                console.error("Error fetching recommended animes:", error)
            } finally {
                setLoading(false);
            }

        }
        fetchRecommendedAnimes();
    }, [])

    return (
        <>
            {loading ? (
                <Spinner/>
            ) :(
                <Animes animes = {animes} message ={message} />
            )}
        </>
    )

}
export default Recommended