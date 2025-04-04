import React, { useState } from "react";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa"; // Additional social icons

// Payment images for example (add your own images for these)
import visaImage from '../../assets/visa.png';
import mastercardImage from '../../assets/mastercard.png';
import paypalImage from '../../assets/paypal.png';

// App Store & Play Store images
import playstoreImage from '../../assets/playstore.webp';
import appstoreImage from '../../assets/appstore.png';

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      setIsLoading(true);
      setMessage(""); // Clear previous messages

      try {
        const response = await fetch('http://localhost:5000/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage("Subscribed successfully!"); // Show success message
        } else {
          setMessage(data.error || "An error occurred while subscribing.");
        }
      } catch (error) {
        setMessage("Error connecting to the server.");
      } finally {
        setIsLoading(false);
        setEmail(""); // Clear the input after submit
      }
    } else {
      setMessage("Please enter a valid email address.");
    }
  };

  return (
    <footer className="bg-gray-100 text-black py-16 w-full">
      <div className="w-full px-8">
        {/* Footer Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* About Us Section */}
          <div>
            <h4 className="text-xl font-semibold mb-4">About Us</h4>
            <p className="text-sm">
              We are an innovative e-commerce platform providing top-notch products for customers worldwide. Our mission is to provide exceptional value and customer satisfaction.
            </p>
          </div>

          {/* Newsletter Signup Section */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Sign up for our newsletter to receive the latest updates and promotions.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col">
              <input
                type="email"
                className="p-3 rounded-md border border-gray-300 mb-4"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-black text-white p-3 rounded-md hover:bg-gray-800"
                disabled={isLoading}
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {message && <p className="text-sm mt-4 text-red-500">{message}</p>}
          </div>

          {/* Quick Links Section */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/shop/home" className="hover:underline">Home</a></li>
              <li><a href="/shop/listing" className="hover:underline">Products</a></li>
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
              <li><a href="#" className="hover:underline">FAQ</a></li>
              <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Information Section */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li>Email: <a href="mailto:support@ecommerce.com" className="hover:underline">support@ecommerce.com</a></li>
              <li>Phone: <a href="tel:+123456789" className="hover:underline">+1 (234) 567-89</a></li>
              <li>Address: 123 E-commerce St, Suite 45, City, Country</li>
            </ul>
          </div>

          {/* Social Media & Payment Options Section */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4 mb-8">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-6 w-6 hover:text-blue-600" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-6 w-6 hover:text-blue-400" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-6 w-6 hover:text-pink-500" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <FaGithub className="h-6 w-6 hover:text-gray-700" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="h-6 w-6 hover:text-blue-700" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <FaYoutube className="h-6 w-6 hover:text-red-600" />
              </a>
            </div>

            {/* Payment Options Section */}
            <h4 className="text-xl font-semibold mb-4">Payment Methods</h4>
            <div className="flex space-x-4">
              <img src={visaImage} alt="Visa" className="h-8 w-auto" />
              <img src={mastercardImage} alt="MasterCard" className="h-8 w-auto" />
              <img src={paypalImage} alt="PayPal" className="h-8 w-auto" />
            </div>

            {/* App Download Section */}
            <h4 className="text-xl font-semibold mb-4 mt-8">Download Our App</h4>
            <div className="flex space-x-4">
              <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                <img src={playstoreImage} alt="Google Play" className="h-10 w-auto" />
              </a>
              <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                <img src={appstoreImage} alt="App Store" className="h-10 w-auto" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="mt-12 border-t border-gray-300 pt-8 text-center">
          <p className="text-sm">&copy; 2025 E-commerce. All Rights Reserved.</p>
          <p className="text-sm mt-2">
            <a href="/shop/terms" className="hover:underline">Terms & Conditions</a> | <a href="/shop/privacy" className="hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
