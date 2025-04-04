import React, { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa'; // User icon

const Customer = () => {
  const [customers, setCustomers] = useState([]); // State to store customers
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null); // State for error message

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Fetch users from the backend using the fetch method
        const response = await fetch('http://localhost:5000/api/users', {
          method: 'GET', // Ensure this is a GET request
        });

        // Check if the response was successful (status code 200)
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();

        if (data.success) {
          setCustomers(data.users); // Set users data to state
        } else {
          console.error('Error fetching users:', data.message);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error during fetch:', error);
        setError('An error occurred while fetching the customers.');
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return <div className="loading-text">Loading...</div>; // Show loading text until data is fetched
  }

  return (
    <div className="customer-page">
      <h1 className="page-heading">Customer List</h1>

      {error && <div className="error-message">{error}</div>} {/* Display error message */}

      {!error && (
        <div className="customer-list">
          {customers.map((customer) => (
            <div
              className={`customer-item ${customer.role === 'admin' ? 'admin' : ''}`}
              key={customer._id}
            >
              <FaUser size={40} color="white" />
              <div className="customer-info">
                <h3>{customer.userName}</h3>
                <p>Email: {customer.email}</p>
                <p className="role">{customer.role}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .customer-page {
          padding: 30px;
          text-align: center;
          font-family: Arial, sans-serif;
        }

        .page-heading {
          font-size: 30px;
          font-weight: bold;
          color:rgb(0, 1, 1);
          margin-bottom: 20px;
          
        }

        .customer-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .customer-item {
          display: flex;
          align-items: center;
          background-color: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .customer-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
        }

        .customer-item .customer-info {
          margin-left: 20px;
          text-align: left;
        }

        .customer-item h3 {
          font-size: 22px;
          color: #333;
          margin: 0;
        }

        .customer-item p {
          font-size: 16px;
          color: #666;
        }

        .role {
          font-size: 14px;
          color: #999;
          font-style: italic;
        }

        .customer-item.admin {
          background-color: #e1f5fe;
          border: 2px solid #039be5;
        }

        .customer-item .customer-info h3 {
          color: #039be5;
        }

        .loading-text {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }

        .error-message {
          color: red;
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default Customer;
