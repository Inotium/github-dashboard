import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchUserRepositories, fetchGitHubProfile } from "../services/api";
import Throbber from "../components/Throbber";
import NavigationTabs from "../components/NavigationTabs";
import Pagination from "../components/pagination";
import ErrorMessage from "../components/ErrorMessage";

 

const Repositories = () => {
  const { username, page, sort } = useParams();
  const navigate = useNavigate();

  const perPage = 5;
  const currentPage = Number(page) || 1;
  const sortOrder = sort || "desc";
  const cacheKey = `repos_${username}_${currentPage}_${sortOrder}`;
  const [repos, setRepos] = useState([]);
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noRepos, setNoRepos] = useState(false);
  const totalRepos = user?.public_repos || 0;
  const totalPages = Math.ceil(totalRepos / perPage);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setNoRepos(false);

      try {
        // Fetch user data
        const userProfile = await fetchGitHubProfile(username);
        if (userProfile) {
          setUser(userProfile);
        } else {
          setError("User not found");
          setLoading(false);
          return;
        }

        // Fetch repositories data (deprecated and moved to api.js file)
        // const cachedData = sessionStorage.getItem(cacheKey);
        // if (cachedData) {
        //   const { data, timestamp } = JSON.parse(cachedData);
        //   if (Date.now() - timestamp < CACHE_EXPIRATION_TIME) {
        //     setRepos(data);
        //     setLoading(false);
        //     return;
        //   }
        // }

        const response = await fetchUserRepositories(
          username,
          currentPage,
          perPage,
          "stars",
          sortOrder
        );

        if (response.length === 0) {
          setNoRepos(true);
        } else {
          setRepos(response);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ data: response, timestamp: Date.now() })
          );
        }
      } catch (err) {
        setError(`${err}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [username, currentPage, sortOrder]);

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
    <>
      <div className="flex justify-center flex-col items-center bg-zinc-800 pt-16 px-4">
        <NavigationTabs username={username} />
        <div className="bg-zinc-900 text-white rounded-2xl shadow-lg p-6 w-full max-w-3xl">
          <p className="text-3xl font-bold text-center mb-4">
            {username}'s Repositories
          </p>

          {/* Sorting Buttons */}
          <div className="flex justify-center space-x-2 mb-4">
            <button onClick={() => navigate(`/user/${username}/repos/1/desc`)}>
              Sort by Stars (Desc)
            </button>
            <button onClick={() => navigate(`/user/${username}/repos/1/asc`)}>
              Sort by Stars (Asc)
            </button>
          </div>

          {/* Repositories List or No Repos Message */}
          {noRepos ? (
            <div className="text-center text-gray-400 p-6 bg-zinc-800 rounded-lg shadow-md">
              No public repositories found.
            </div>
          ) : (
            <ul className="space-y-4">
              {repos.map((repo) => (
                <li
                // Redirect to repository github on
                onClick={() => window.open(repo.html_url)}
                  key={repo.id}
                  className="p-4 rounded-2xl shadow-md text-left h-32 bg-zinc-800 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-lg font-bold line-clamp-1">
                      {repo.name}
                    </h2>
                    <div></div>
                    <p className="line-clamp-2">{repo.description || ""}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    ⭐ {repo.stargazers_count} stars
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination Controls */}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/user/${username}/repos`}
            sortOrder={sortOrder}
          />
        </div>
      </div>
    </>
  );
};

export default Repositories;
