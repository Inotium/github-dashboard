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
  const currentPage = Number(page) || 1; // Ensure currentPage is a number (default to 1)
  const [repos, setRepos] = useState([]);
  const [allRepos, setAllRepos] = useState([]); // Store all repos for sorting
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noRepos, setNoRepos] = useState(false);
  const [sortOrder, setSortOrder] = useState(sort || "desc");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setNoRepos(false);

      try {
        const userProfile = await fetchGitHubProfile(username);
        if (!userProfile) {
          setError("User not found");
          setLoading(false);
          return;
        }
        setUser(userProfile);

        // Fetch all repositories to properly sort through the stars
        const response = await fetchUserRepositories(username, 1, 100);
        if (response.length === 0) {
          setNoRepos(true);
        } else {
          setAllRepos(response);
          sortAndPaginateRepos(response, sortOrder, currentPage);
        }
      } catch (err) {
        setError(`${err}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [username]);

  useEffect(() => {
    // Re sort and paginate repos when sort order or page changes
    if (allRepos.length > 0) {
      sortAndPaginateRepos(allRepos, sortOrder, currentPage);
    }
  }, [sortOrder, currentPage]);

  const sortAndPaginateRepos = (reposList, order, page) => {
    const sortedRepos = [...reposList].sort((a, b) =>
      order === "asc"
        ? a.stargazers_count - b.stargazers_count
        : b.stargazers_count - a.stargazers_count
    );

    const startIndex = (page - 1) * perPage;
    const paginatedRepos = sortedRepos.slice(startIndex, startIndex + perPage);
    setRepos(paginatedRepos);
  };

  const handleSortChange = (order) => {
    if (sortOrder === order) return; // Prevent unnecessary sorting if already active
    setSortOrder(order);
    navigate(`/user/${username}/repos/1/${order}`);
  };

  if (loading)
    return (
      <div className="text-center text-gray-400">
        <Throbber />
      </div>
    );

  if (error) return <ErrorMessage errorMessage={error} />;

  return (
    <div className="flex justify-center flex-col items-center bg-zinc-800 pt-16 px-4">
      <NavigationTabs username={username} />
      <div className="bg-zinc-900 text-white rounded-2xl shadow-lg p-6 w-full max-w-3xl">
        <p className="text-3xl font-bold text-center mb-4">
          {username}'s Repositories
        </p>

        {/* Sorting Buttons */}
        <div className="flex justify-center space-x-2 mb-4">
          <button
            onClick={() => handleSortChange("desc")}
            className={`px-4 py-2 rounded-lg ${
              sortOrder === "desc" ? "  text-blue-500" : " text-gray-300"
            }`}
          >
            Sort by Stars (Desc)
          </button>
          <button
            onClick={() => handleSortChange("asc")}
            className={`px-4 py-2 rounded-lg ${
              sortOrder === "asc" ? "  text-blue-500" : " text-gray-300"
            }`}
          >
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
                onClick={() => window.open(repo.html_url)}
                key={repo.id}
                className="p-4 rounded-2xl shadow-md text-left h-32 bg-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-bold line-clamp-1">
                    {repo.name}
                  </h2>
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
          totalPages={Math.ceil(allRepos.length / perPage)}
          basePath={`/user/${username}/repos`}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
};

export default Repositories;
