import axios from 'axios';

const API_URL = 'https://api.github.com';

const cache = {};

// Cache expiration time (1 hour) in miliseconds
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; 

// Centralized error handler
const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    if (
      error.response.status === 403 &&
      error.response.data &&
      typeof error.response.data.message === 'string' &&
      error.response.data.message.toLowerCase().includes('rate limit')
    ) {
      throw new Error('Rate limit exceeded, please try again later.');
    }

    const errorMsg = error.response.data?.message || 'Error fetching data';
    throw new Error(`GitHub API error (${error.response.status}): ${errorMsg}`);
  }

  if (error.request) {
    throw new Error('No response received from GitHub API. Network error or server unreachable.');
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
    data: data,
    timestamp: new Date().getTime(),
  };
};

// Fetch GitHub users by query
export const fetchGitHubUsers = async (query) => {
  const cacheKey = `users-${query}`;
  
 
  const cachedData = checkCache(cacheKey);
  if (cachedData) {
    console.log('Returning cached data for users');
    return cachedData;
  }

  try {
    const response = await axios.get(`${API_URL}/search/users`, {
      params: { q: query },
    });
    const data = response.data.items || [];
    storeInCache(cacheKey, data); 
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch a specific GitHub users profile
export const fetchGitHubProfile = async (username) => {
  const cacheKey = `profile-${username}`;
  
 
  const cachedData = checkCache(cacheKey);
  if (cachedData) {
    console.log('Returning cached data for profile');
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

// Fetch user repositories with pagination and sorting
export const fetchUserRepositories = async (
  username,
  page = 1,
  perPage = 10,
  sort = 'stars',
  order = 'desc'
) => {
  const cacheKey = `repos-${username}-${page}-${perPage}-${sort}-${order}`;
 
  const cachedData = checkCache(cacheKey);
  if (cachedData) {
    console.log('Returning cached data for repositories');
    return cachedData;
  }

  try {
    console.log(`Fetching: ${API_URL}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=${sort}&direction=${order}`);
    const response = await axios.get(`${API_URL}/users/${username}/repos`, {
      params: { page, per_page: perPage, sort, direction: order },
    });
    const data = response.data || [];
    storeInCache(cacheKey, data);
    console.log('Response:', data);
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch followers with pagination
export const fetchUserFollowers = async (username, page = 1, perPage = 10) => {
  const cacheKey = `followers-${username}-${page}-${perPage}`;
  
  const cachedData = checkCache(cacheKey);
  if (cachedData) {
    console.log('Returning cached data for followers');
    return cachedData;
  }

  try {
    const response = await axios.get(`${API_URL}/users/${username}/followers`, {
      params: { page, per_page: perPage },
    });
    const data = response.data || [];
    storeInCache(cacheKey, data);  
    return data;
  } catch (error) {
    handleApiError(error);
  }
};
