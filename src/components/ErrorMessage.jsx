import React from "react";
import { useNavigate } from "react-router";

const ErrorMessage = ({ errorMessage }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-red-500">
      <div className="text-2xl">{errorMessage}</div>
      <button
        onClick={() => navigate("/")}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Home
      </button>
    </div>
  );
};

export default ErrorMessage;
