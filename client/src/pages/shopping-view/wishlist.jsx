import React, { useState, useEffect } from 'react';
import { AiOutlineHeart } from 'react-icons/ai';
import { useSelector } from 'react-redux';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const userId = useSelector(state => state.auth.user?.id); 

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/wishlist/user/${userId}`);

        // If the response is not okay, throw an error
        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }

        // Parse the response data
        const data = await response.json();

        // Set wishlist data
        setWishlist(data);
        setLoading(false);
      } catch (error) {
        // Handle error if fetch fails
        setError(error.message);
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (wishlist.length === 0) {
    return <div>Your wishlist is empty</div>;
  }

  return (
    <div>
      <h1>My Wishlist</h1>
      <ul>
        {wishlist.map((item) => (
          <li key={item._id}>
            <img src={item.product.image} alt={item.product.title} />
            <h3>{item.product.title}</h3>
            <p>{item.product.description}</p>
            <p>Price: ${item.product.price}</p>
            <button>Remove from Wishlist</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Wishlist;
