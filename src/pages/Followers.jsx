import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchUserFollowers, fetchGitHubProfile } from "../services/api";
import Throbber from "../components/Throbber";
import NavigationTabs from "../components/NavigationTabs";
import Pagination from "../components/pagination";
import ErrorMessage from "../components/ErrorMessage";

const Followers = () => {
  const { username, page } = useParams();
  const perPage = 10; // Followers per page
  const currentPage = Number(page) || 1; // Ensure currentPage is a number (default to 1)
  const [followers, setFollowers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noFollowers, setNoFollowers] = useState(false);
  const totalFollowers = user?.followers || 0;
  const totalPages = Math.ceil(totalFollowers / perPage); // Calculate total ammount of pages
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setNoFollowers(false);

      try {
        // Fetch user profile data
        const userProfile = await fetchGitHubProfile(username);
        if (userProfile) {
          setUser(userProfile);
        } else {
          setError("User not found");
          setLoading(false);
          return;
        }

        // Fetch followers for the given page
        const response = await fetchUserFollowers(
          username,
          currentPage,
          perPage
        );

        if (response.length === 0) {
          setNoFollowers(true);
        } else {
          setFollowers(response);
        }
      } catch (err) {
        setError(`${err}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [username, currentPage]); // Re run effect when username or page changes

  if (loading)
    return (
      <div className="text-center text-gray-400">
        <Throbber />
      </div>
    );
  if (error) {
    return <ErrorMessage errorMessage={error} />;
  }

  return (
    <div className="flex justify-center flex-col items-center bg-zinc-800 pt-16 px-4">
      <NavigationTabs username={username} />
      <div className="bg-zinc-900 text-white rounded-2xl shadow-lg p-6 w-full max-w-2xl">
        <p className="text-3xl font-bold text-center">{username}'s Followers</p>
        <p className="text-1xl font-bold text-center mb-4">
          Total Followers: {totalFollowers}
        </p>

        {noFollowers ? (
          // Display message if no followers are found
          <div className="text-center text-gray-400 p-6 bg-zinc-800 rounded-2xl shadow-md">
            No followers found.
          </div>
        ) : (
          <ul className="space-y-6">
            {followers.map((follower) => (
              <li
                onClick={() => navigate(`/user/${follower.login}`)}
                key={follower.id}
                className="p-4 rounded-2xl shadow-md flex h-28 items-center bg-zinc-800"
              >
                <img
                  src={follower.avatar_url}
                  alt={follower.login}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <h2 className="text-lg font-bold">{follower.login}</h2>
                <h3>{follower.name}</h3>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination component for navigating through pages */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/user/${username}/followers`}
        />
      </div>
    </div>
  );
};

export default Followers;
