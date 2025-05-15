import { useEffect, useState } from "react";
import axiosInstance from "../axios"; // Import axiosInstance for making API calls

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      // Redirect to login if no token is found
      window.location.href = "/login";
    } else {
      // Fetch user data from the backend (protected route)
      const fetchUserData = async () => {
        try {
          const response = await axiosInstance.get("/protected-route", {
            headers: {
              Authorization: `Bearer ${token}`, // Add token to Authorization header
            },
          });

          // Set the fetched user data in state
          setUser(response.data);
        } catch (err) {
          setError("Failed to fetch user data");
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, []);

  // If the user is still loading, show loading state
  if (loading) {
    return <p>Loading...</p>;
  }

  // If there's an error, display the error
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Welcome to Your Dashboard</h1>
      {user ? (
        <div>
          <p>Hello, {user.username}</p>
          {/* Add more user information here */}
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default Dashboard;
