import axios from "axios";

const API_URL = "https://api.github.com";

const cache = {};
// Cache expiration time (1 hour) in milliseconds
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

// Centralized error handler
const handleApiError = (error) => {
  console.error("API Error:", error);

  if (error.response) {
    if (
      error.response.status === 403 &&
      error.response.data &&
      typeof error.response.data.message === "string" &&
      error.response.data.message.toLowerCase().includes("rate limit")
    ) {
      throw new Error("Rate limit exceeded, please try again later.");
    }

    const errorMsg = error.response.data?.message || "Error fetching data";
    throw new Error(`GitHub API error (${error.response.status}): ${errorMsg}`);
  }

  if (error.request) {
    throw new Error(
      "No response received from GitHub API. Network error or server unreachable."
    );
  }

  throw new Error(`Unexpected error: ${error.message}`);
};

// Check cache before making the request
const checkCache = (key) => {
  const cachedData = cache[key];
  if (!cachedData) {
    return null;
  }

  // Check if cached data is expired
  const currentTime = new Date().getTime();
  if (currentTime - cachedData.timestamp > CACHE_EXPIRATION_TIME) {
    delete cache[key];
    return null;
  }

  return cachedData.data;
};

// Function to store data in cache with timestamp
const storeInCache = (key, data) => {
  cache[key] = {
    data,
    timestamp: new Date().getTime(),
  };
};

// Fetch GitHub users by query
export const fetchGitHubUsers = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/search/users`, {
      params: { q: query },
    });
    return response.data.items || [];
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch a specific GitHub user's profile (cached)
export const fetchGitHubProfile = async (username) => {
  const cacheKey = `profile-${username}`;
  const cachedData = checkCache(cacheKey);
  if (cachedData) {
    console.log("Returning cached data for profile");
    return cachedData;
  }

  try {
    const response = await axios.get(`${API_URL}/users/${username}`);
    const data = response.data;
    storeInCache(cacheKey, data);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch user repositories
export const fetchUserRepositories = async (
  username,
  page = 1,
  perPage = 10
) => {
  try {
    console.log(
      `Fetching: ${API_URL}/users/${username}/repos?page=${page}&per_page=${perPage}`
    );
    const response = await axios.get(`${API_URL}/users/${username}/repos`, {
      params: { page, per_page: perPage },
    });
    return response.data || [];
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch followers with pagination
export const fetchUserFollowers = async (username, page = 1, perPage = 10) => {
  try {
    const response = await axios.get(`${API_URL}/users/${username}/followers`, {
      params: { page, per_page: perPage },
    });
    return response.data || [];
  } catch (error) {
    handleApiError(error);
  }
};
