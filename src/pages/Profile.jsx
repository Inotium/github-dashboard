import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { fetchGitHubProfile } from "../services/api";
import NavigationTabs from "../components/NavigationTabs";
import Throbber from "../components/Throbber";
import ErrorMessage from "../components/ErrorMessage";

// Define cache expiration time (1 hour)
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;  

const UserProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNotFound, setUserNotFound] = useState(false);
 

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Reset states when starting to fetch data
      setLoading(true);
      setError(null);
      setUserNotFound(false);

      // Check if cached data for the user exists in sessionStorage
      const cachedData = sessionStorage.getItem(`github_user_${username}`);
      if (cachedData) {
        // If the cache is not expired, use cached data
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRATION_TIME) {
          setUser(data);
          setLoading(false);
          return; // Return early no need to fetch from API
        }
      }

      try {
        // Fetch the user profile from GitHub API
        const userProfile = await fetchGitHubProfile(username);
        if (userProfile) {
          setUser(userProfile);
          // Cache the user profile in sessionStorage with timestamp
          sessionStorage.setItem(
            `github_user_${username}`,
            JSON.stringify({ data: userProfile, timestamp: Date.now() })
          );
        } else {
          setUserNotFound(true);
        }
      } catch (err) {
        setError(`${err}`);
      } finally {
        setLoading(false);
      }
    };

    // Call the fetchUserProfile function on component mount or username change
    fetchUserProfile();
  }, [username]);

  // Show loading state while data is being fetched
  if (loading)
    return (
      <div className="text-center text-gray-400">
        <Throbber />
      </div>
    );

  if (error) {
    if (error) {
      return <ErrorMessage errorMessage={error} />;
    }
  }

  return (
    <div className="flex justify-center flex-col items-center bg-zinc-800 pt-16 px-4">
      <NavigationTabs username={username} />

      <div className="bg-zinc-900 text-white rounded-2xl shadow-lg p-6 w-full max-w-3xl">
        {userNotFound ? (
          <div className="text-center text-gray-400">User not found</div>
        ) : (
          <>
            {/* Display info */}
            <div className="flex items-center space-x-4">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-16 h-16 md:w-18 md:h-18 rounded-full border-4 border-zinc-700"
              />
              <div>
                <p className="text-2xl font-bold">
                  {user.name || "No name available"}
                </p>
                <p className="text-gray-400 text-xs md:text-base">
                  @{user.login}
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm md:text-base">
                {user.location || "Location not available"}
              </p>
              <p className="mt-2 text-sm md:text-base">
                {user.bio || "No bio available"}
              </p>
            </div>

            <div className="mt-4 text-gray-400 text-center">
              <p className="text-sm md:text-base">
                Public Repos: {user.public_repos}
              </p>
              <p className="text-sm md:text-base">
                Followers: {user.followers}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
