const API_BASE_URL = "http://localhost:5000/api";

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token ? `Bearer ${token}` : null;
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      ...options.headers,
    },
    ...options,
  };

  // FormData ho to content-type mat set karo
  if (!(options.body instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = token;
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return;
    }

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Non-JSON response:", text);
      throw new Error("Server is not returning JSON");
    }

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { method: "GET", ...options }),

  post: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...options,
    }),

  put: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { method: "DELETE", ...options }),
};