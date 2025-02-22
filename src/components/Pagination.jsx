import React from "react";
import { useNavigate } from "react-router";

const Pagination = ({ currentPage, totalPages, basePath, sortOrder = "" }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 flex justify-center items-center space-x-4">
      <div className="w-20 flex justify-center">
        {currentPage > 1 && (
          <button
            onClick={() => navigate(`${basePath}/${currentPage - 1}/${sortOrder}`)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Previous
          </button>
        )}
      </div>
      <span className="px-4 py-2 rounded text-lg">
        {currentPage} of {totalPages}
      </span>
      <div className="w-20 flex justify-center">
        {currentPage < totalPages && (
          <button
            onClick={() => navigate(`${basePath}/${currentPage + 1}/${sortOrder}`)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;
