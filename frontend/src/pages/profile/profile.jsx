import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  TrendingUp,
  Users,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Loader2,
  FileText,
  Heart,
  Eye,
} from "lucide-react";
import Footernav from "../../../components/Footernav";
import { usePostStats, useProfileStats } from "../../hooks/useProfile.js";
const userInfo = {
  name: "Jane Doe",
  username: "@janedoe",
  bio: "Passionate debater | Tech enthusiast | Always learning",
  location: "New York, NY",
  email: "jane.doe@example.com",
  joinDate: "January 2023",
  avatar: "/placeholder.svg?height=200&width=200",
};
export default function Profile() {
  const { getProfileStats, profileStats, loading } = useProfileStats();
  const {
    getPostStats,
    loadMorePosts,
    postStats,
    posts,
    hasMore,
    loading: postsLoading,
  } = usePostStats();
  const [currentPage, setCurrentPage] = useState(1);
  const user = JSON.parse(localStorage.getItem("duser"));

  useEffect(() => {
    if (user?._id) {
      getProfileStats(user._id);
      getPostStats(user._id, 1, 5);
    }
  }, [user?._id, getProfileStats, getPostStats]);

  const handleLoadMore = async () => {
    if (user?._id && hasMore && !postsLoading) {
      const nextPage = currentPage + 1;
      await loadMorePosts(user._id, currentPage, 5);
      setCurrentPage(nextPage);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <style>{`
        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #1a202c;
        }
        ::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
        {/* Header */}
        <header className="bg-gray-900 bg-opacity-50 backdrop-blur-md py-4 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-red-500 hover:text-red-400 transition-colors"
            >
              SpeakUp
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 overflow-y-auto h-[calc(100vh-64px-96px)]">
          {/* Profile Header */}
          <section className="mb-12 bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <img
                src={user?.profilepic || userInfo.avatar}
                alt={user?.username || userInfo.name}
                width={200}
                height={200}
                className="rounded-full"
              />
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">
                  {user?.username || userInfo.name}
                </h1>
                <p className="text-xl text-gray-400 mb-4">
                  @{user?.username || userInfo.username}
                </p>
                <p className="mb-4">{userInfo.bio}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {userInfo.location}
                  </span>
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {userInfo.email}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {userInfo.joinDate}
                  </span>
                </div>
              </div>
              <Link
                to="/profile/edit"
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Edit Profile
              </Link>
            </div>
          </section>
          <div className=" text-xl text-green-400">
            Also put leaderbirds / users rank
          </div>
          {/* User Stats */}
          <section className="mb-12 bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Debate Statistics</h2>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-red-400" />
                <span className="ml-2">Loading stats...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="text-3xl font-bold">
                    {profileStats?.debatesJoined || 0}
                  </p>
                  <p className="text-sm">Debates Joined</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="text-3xl font-bold">
                    {profileStats?.winRate
                      ? `${(profileStats.winRate * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                  <p className="text-sm">Win Rate</p>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="text-3xl font-bold">
                    {profileStats?.argumentsMade || 0}
                  </p>
                  <p className="text-sm">Arguments Made</p>
                </div>
              </div>
            )}

            {/* Additional Stats Breakdown */}
            {profileStats?.breakdown && (
              <div className="mt-8 pt-6 border-t border-gray-600">
                <h3 className="text-xl font-semibold mb-4">
                  Detailed Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium mb-3">
                      Debates Created
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Created:</span>
                        <span className="font-semibold">
                          {profileStats.breakdown.debatesCreated}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Likes:</span>
                        <span className="font-semibold">
                          {
                            profileStats.breakdown.createdDebatesStats
                              .totalLikes
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Votes:</span>
                        <span className="font-semibold">
                          {
                            profileStats.breakdown.createdDebatesStats
                              .totalVotes
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium mb-3">
                      Participation Stats
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Debates Joined:</span>
                        <span className="font-semibold">
                          {
                            profileStats.breakdown.participationStats
                              .debatesJoined
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Arguments Made:</span>
                        <span className="font-semibold">
                          {
                            profileStats.breakdown.participationStats
                              .argumentsMade
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* User's Debates */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">My Posts</h2>
            {postsLoading && posts.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-red-400" />
                <span className="ml-2">Loading posts...</span>
              </div>
            ) : posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post, index) => (
                    <div
                      key={post._id || index}
                      className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold line-clamp-2 flex-1">
                          {post.title || "Untitled Post"}
                        </h3>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {post.category || "General"}
                        </span>
                      </div>

                      {post.content && (
                        <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                          {post.content}
                        </p>
                      )}

                      <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likes || 0} likes
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {post.views || 0} views
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {post.comments?.length || 0} comments
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 mb-3">
                        Created:{" "}
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </div>

                      <Link
                        to={`/posts/${post._id}`}
                        className="inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        View Post
                      </Link>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={postsLoading}
                      className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {postsLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                          Loading...
                        </>
                      ) : (
                        "Load More Posts"
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No posts found</p>
                <p className="text-sm">
                  Start creating posts to see them here!
                </p>
              </div>
            )}
          </section>

          {/* Post Statistics */}
          {postStats && (
            <section className="mb-12 bg-gray-800 bg-opacity-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Post Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="text-3xl font-bold">
                    {postStats.totalPosts || 0}
                  </p>
                  <p className="text-sm">Total Posts</p>
                </div>
                <div className="text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="text-3xl font-bold">
                    {postStats.totalLikes || 0}
                  </p>
                  <p className="text-sm">Total Likes</p>
                </div>
                <div className="text-center">
                  <Eye className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="text-3xl font-bold">
                    {postStats.totalViews || 0}
                  </p>
                  <p className="text-sm">Total Views</p>
                </div>
                <div className="text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="text-3xl font-bold">
                    {postStats.totalComments || 0}
                  </p>
                  <p className="text-sm">Total Comments</p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
      <Footernav color={"profile"} />
    </>
  );
}
