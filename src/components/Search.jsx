import React, { useState, useEffect, useRef } from "react";
import { fetchGitHubUsers } from "../services/api";
import { useNavigate } from "react-router";
import { FaSearch } from "react-icons/fa";
import Throbber from "./Throbber";

const GitHubUserSearch = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setUsers([]);
      setShowDropdown(false);
      setError(null);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      setShowDropdown(true);
      try {
        const result = await fetchGitHubUsers(query);
        setUsers(result.slice(0, 5));
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Close dropdown when clicking outside of the search box or dropwdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (username) => {
    if (username.trim()) {
      navigate(`/user/${username}`);
      setQuery("");
      setUsers([]);
      setShowDropdown(false);
    }
  };

  //Enable Enter key to navigate to user
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(query);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-3xl">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Search GitHub Users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 pr-12 border border-stone-600 rounded-lg bg-zinc-800 text-white focus:outline-none"
        />
        <div
          onClick={() => handleSearch(query)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
        >
          <FaSearch size={18} />
        </div>
      </div>

      {showDropdown && (
        <ul className="absolute z-10 w-full mt-2 bg-zinc-800 border border-stone-600 rounded-lg shadow-lg">
          {loading ? (
            <Throbber variant="dropdown" containerClassName="w-full h-full" />
          ) : error ? (
            <li className="p-2 text-red-500 flex justify-center">Error: {error}</li>
          ) : users.length > 0 ? (
            users.map((user) => (
              <li
                key={user.id}
                className="flex items-center p-2 hover:bg-zinc-700 cursor-pointer"
                onClick={() => handleSearch(user.login)}
              >
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <span className="text-white">{user.login}</span>
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-400 flex justify-center">User does not exist.</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default GitHubUserSearch;
