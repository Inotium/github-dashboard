import React from "react";
import { useNavigate, useLocation } from "react-router";

const NavigationTabs = ({ username }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check active tab
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-row  space-x-2">
      {/* Profile Tab */}
      <div
        onClick={() => navigate(`/user/${username}`)}
        className={`${
          isActive(`/user/${username}`) ? "bg-zinc-950" : "bg-zinc-900"
        } py-2 text-white px-4 rounded-t-2xl cursor-pointer`}
      >
        Profile
      </div>

      {/* Repositories Tab */}
      <div
        onClick={() => navigate(`/user/${username}/repos/1/desc`)}
        className={`${
          isActive(`/user/${username}/repos/1/desc`)
            ? "bg-zinc-950"
            : "bg-zinc-900"
        } py-2  text-white px-4 rounded-t-2xl cursor-pointer`}
      >
        Repositories
      </div>

      {/* Followers Tab */}
      <div
        onClick={() => navigate(`/user/${username}/followers/1`)}
        className={`${
          isActive(`/user/${username}/followers/1`)
            ? "bg-zinc-950"
            : "bg-zinc-900"
        } py-2  text-white px-4 rounded-t-2xl cursor-pointer`}
      >
        Followers
      </div>
    </div>
  );
};

export default NavigationTabs;
