import React, { useState, useEffect } from 'react';
import { Gift, CreditCard } from 'lucide-react'; // Import the required icons

const CreateGiftCardPage = () => {
  const [formData, setFormData] = useState({
    code: '', // Added code field
    amount: '',
  });

  const [giftCards, setGiftCards] = useState([]); // Store gift cards fetched from the backend
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch all gift cards from the backend when the component mounts
  useEffect(() => {
    const fetchGiftCards = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/giftcards');
        const data = await response.json();

        if (response.ok) {
          setGiftCards(data); // Store the fetched gift cards in state
        } else {
          setError('Failed to load gift cards');
        }
      } catch (error) {
        setError('Error fetching gift cards');
      }
    };
    fetchGiftCards();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Ensure that amount is not null or empty
    if (!formData.amount) {
      setError('Amount is required.');
      setIsLoading(false);
      return;
    }

    const giftCardData = {
      code: formData.code, // Include code in the gift card data
      amount: formData.amount,
    };

    try {
      const response = await fetch('http://localhost:5000/api/giftcards/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(giftCardData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Gift card created successfully!');
        setFormData({
          code: '', // Reset the code field
          amount: '', // Reset the amount field
        });

        // Add the new gift card to the existing list 
        setGiftCards((prevGiftCards) => [...prevGiftCards, data.giftCard]);

        setIsModalOpen(false); // Close the modal after successful form submission
      } else {
        setError(data.message || 'Error creating gift card');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Server error, please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (giftCard) => {
    alert(`Card details:\nCode: ${giftCard.code}\nAmount: ${giftCard.amount}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Create Gift Card Button */}
      <div className="flex justify-end mb-6">
        <button
          className="bg-black text-white p-3 rounded-full flex items-center justify-center hover:bg-gray-800 transition duration-300"
          onClick={() => setIsModalOpen(true)}
        >
          <Gift size={24} />
        </button>
      </div>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="mb-4 text-green-600 font-semibold">{successMessage}</div>
      )}
      {error && (
        <div className="mb-4 text-red-600 font-semibold">{error}</div>
      )}

      {/* Gift Cards Display */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        {giftCards.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center">No gift cards created yet.</p>
        ) : (
          giftCards.map((giftCard) => (
            <div
              key={giftCard._id}
              className="relative p-6 bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 text-white rounded-xl cursor-pointer overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out"
              onClick={() => handleCardClick(giftCard)}
            >
              {/* Card Content */}
              <div className="relative z-10">
                {/* Code */}
                <h3 className="font-semibold text-2xl mb-3">Code: {giftCard.code}</h3>

                {/* Amount */}
                <p className="mt-2 text-lg">Amount: ${giftCard.amount}</p>
              </div>

              {/* Gift Icon */}
              <div className="absolute top-1/4 right-4 opacity-10">
                <Gift className="w-20 h-20 text-white" />
              </div>

              {/* Hover Effect (Darkening on Hover) */}
              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-40 transition-opacity duration-300"></div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Creating Gift Card */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[600px] h-[400px] overflow-y-auto relative">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Gift Card</h2>

            {/* Close Modal Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Gift Card Code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Enter gift card code"
                  required
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Enter gift card amount"
                  min="1"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white p-3 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-800 transition duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <CreditCard /> <span>Create Gift Card</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGiftCardPage;
