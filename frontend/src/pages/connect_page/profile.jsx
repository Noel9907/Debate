import { User, Heart, MessageSquare, Users } from "lucide-react";
import { Link } from "react-router-dom";

const ProfileCard = ({ user }) => {
  return (
    <Link
      to={`/profile/${user.username}`}
      className="block bg-gray-800 bg-opacity-50 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"
    >
      <div className="flex items-center space-x-4">
        {/* Profile Picture */}
        <div className="relative">
          <img
            src={user.profilepic}
            alt={`${user.username}'s profile`}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
            onError={(e) => {
              e.target.src = `https://avatar.iran.liara.run/public/boy?username=${user.username}`;
            }}
          />
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-white">
              @{user.username}
            </h3>
            <User className="w-4 h-4 text-blue-400" />
          </div>

          {/* Interested Categories */}
          <div className="mb-2">
            {user.interested_categories &&
            user.interested_categories.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {user.interested_categories
                  .slice(0, 3)
                  .map((category, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-red-600 bg-opacity-20 text-red-300 rounded-full text-xs border border-red-600 border-opacity-30"
                    >
                      {category}
                    </span>
                  ))}
                {user.interested_categories.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-600 bg-opacity-20 text-gray-300 rounded-full text-xs border border-gray-600 border-opacity-30">
                    +{user.interested_categories.length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-400">
                No categories selected
              </span>
            )}
          </div>

          {/* User Stats (Placeholder) */}
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span className="flex items-center">
              <MessageSquare className="w-3 h-3 mr-1 text-blue-400" />
              Debates
            </span>
            <span className="flex items-center">
              <Heart className="w-3 h-3 mr-1 text-red-400" />
              Followers
            </span>
            <span className="flex items-center">
              <Users className="w-3 h-3 mr-1 text-green-400" />
              Following
            </span>
          </div>
        </div>

        {/* Action Indicator */}
        <div className="text-gray-400 hover:text-white transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default ProfileCard;
