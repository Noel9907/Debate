import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  UserPlus,
  UserCheck,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import Footernav from "../../../components/Footernav";
import { usePostStats, useProfileStats } from "../../hooks/useProfile.js";
import Topbar from "../../../components/Topbar.jsx";

const userInfo = {
  name: "Jane Doe",
  username: "@janedoe",
  bio: "Passionate debater | Tech enthusiast | Always learning",
  location: "New York, NY",
  email: "jane.doe@example.com",
  joinDate: "January 2023",
  avatar: "/placeholder.svg?height=200&width=200",
};

export default function Profile(z) {
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
  const [isTracking, setIsTracking] = useState(false);
  const [trackingCount, setTrackingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [userRank, setUserRank] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const username = useParams();
  const user =
    username.username || JSON.parse(localStorage.getItem("duser")).username;
  const currentUser = JSON.parse(localStorage.getItem("duser"));
  const isOwnProfile = user === currentUser?.username;

  useEffect(() => {
    if (user) {
      getProfileStats(user);
      getPostStats(user, 1, 5);
      // Mock data for tracking stats - replace with actual API calls
      setTrackingCount(Math.floor(Math.random() * 500) + 50);
      setFollowersCount(Math.floor(Math.random() * 1000) + 100);
      setUserRank(Math.floor(Math.random() * 1000) + 1);
      setIsTracking(Math.random() > 0.5); // Random initial state
    }
  }, [user, getProfileStats, getPostStats]);

  const handleLoadMore = async () => {
    if (user && hasMore && !postsLoading) {
      const nextPage = currentPage + 1;
      await loadMorePosts(user, currentPage, 5);
      setCurrentPage(nextPage);
    }
  };

  const handleTrackToggle = async () => {
    if (trackingLoading) return;

    setTrackingLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (isTracking) {
        setIsTracking(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        setIsTracking(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling track status:", error);
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br  from-gray-900 to-black text-white">
        <style>{`
          /* Custom scrollbar styles */
          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: #1a202c;
          }
          ::-webkit-scrollbar-thumb {
            background: #4a5568;
            border-radius: 6px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #718096;
          }
          
          /* Smooth animations */
          * {
            transition: all 0.2s ease;
          }
          
          .hover-lift:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
          }
        `}</style>

        {/* Header */}
        <Topbar />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Profile Hero Section */}
          <section className="mb-16">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 md:p-12 hover-lift">
              <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                {/* Profile Image */}
                <div className="flex-shrink-0 self-center lg:self-start">
                  <div className="relative">
                    <img
                      src={profileStats?.profilepic || userInfo.avatar}
                      alt={profileStats?.username || userInfo.name}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-600 shadow-2xl"
                    />
                    {userRank && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        #{userRank}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="mb-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {profileStats?.username || userInfo.name}
                    </h1>
                    <p className="text-xl text-gray-400 mb-4">
                      @{profileStats?.username || userInfo.username}
                    </p>
                    <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                      {userInfo.bio}
                    </p>
                  </div>

                  {/* Social Stats */}
                  <div className="flex justify-center lg:justify-start gap-8 mb-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-400">
                        {trackingCount}
                      </p>
                      <p className="text-sm text-gray-400 uppercase tracking-wide">
                        Tracking
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-400">
                        {followersCount}
                      </p>
                      <p className="text-sm text-gray-400 uppercase tracking-wide">
                        Trackers
                      </p>
                    </div>
                    {userRank && (
                      <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-400">
                          #{userRank}
                        </p>
                        <p className="text-sm text-gray-400 uppercase tracking-wide">
                          Global Rank
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-400 mb-6">
                    <span className="flex items-center hover:text-gray-300 transition-colors">
                      <MapPin className="w-4 h-4 mr-2" />
                      {userInfo.location}
                    </span>
                    <span className="flex items-center hover:text-gray-300 transition-colors">
                      <Mail className="w-4 h-4 mr-2" />
                      {userInfo.email}
                    </span>
                    <span className="flex items-center hover:text-gray-300 transition-colors">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined {userInfo.joinDate}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0 self-center lg:self-start">
                  {isOwnProfile ? (
                    <Link
                      to="/profile/edit"
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-lg hover:shadow-red-500/25"
                    >
                      <Edit className="w-5 h-5 mr-2" />
                      Edit Profile
                    </Link>
                  ) : (
                    <button
                      onClick={handleTrackToggle}
                      disabled={trackingLoading}
                      className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center min-w-[140px] justify-center shadow-lg ${
                        isTracking
                          ? "bg-gray-600 hover:bg-gray-700 text-white border border-gray-500"
                          : "bg-red-500 hover:bg-red-600 text-white hover:shadow-red-500/25"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {trackingLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isTracking ? (
                        <>
                          <UserCheck className="w-5 h-5 mr-2" />
                          Tracking
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          Track User
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center lg:text-left">
              Debate Statistics
            </h2>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-red-400 mr-3" />
                <span className="text-lg">Loading statistics...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center hover-lift">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-4xl font-bold mb-2">
                    {profileStats?.debatesJoined || 0}
                  </p>
                  <p className="text-gray-400 uppercase tracking-wide text-sm">
                    Debates Joined
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center hover-lift">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-4xl font-bold mb-2">
                    {profileStats?.winRate
                      ? `${(profileStats.winRate * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                  <p className="text-gray-400 uppercase tracking-wide text-sm">
                    Win Rate
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center hover-lift">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-4xl font-bold mb-2">
                    {profileStats?.argumentsMade || 0}
                  </p>
                  <p className="text-gray-400 uppercase tracking-wide text-sm">
                    Arguments Made
                  </p>
                </div>
              </div>
            )}

            {/* Detailed Breakdown */}
            {profileStats?.breakdown && (
              <div className="mt-12 bg-gray-800 border border-gray-700 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-8">
                  Detailed Performance
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-700 rounded-xl p-6">
                    <h4 className="text-xl font-semibold mb-6 flex items-center">
                      <Trophy className="w-6 h-6 mr-3 text-yellow-400" />
                      Debates Created
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-600">
                        <span className="text-gray-300">Total Created</span>
                        <span className="font-bold text-xl">
                          {profileStats.breakdown.debatesCreated}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-600">
                        <span className="text-gray-300">Total Likes</span>
                        <span className="font-bold text-xl text-red-400">
                          {
                            profileStats.breakdown.createdDebatesStats
                              .totalLikes
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-300">Total Votes</span>
                        <span className="font-bold text-xl text-blue-400">
                          {
                            profileStats.breakdown.createdDebatesStats
                              .totalVotes
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-xl p-6">
                    <h4 className="text-xl font-semibold mb-6 flex items-center">
                      <Users className="w-6 h-6 mr-3 text-green-400" />
                      Participation Stats
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-600">
                        <span className="text-gray-300">Debates Joined</span>
                        <span className="font-bold text-xl">
                          {
                            profileStats.breakdown.participationStats
                              .debatesJoined
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-300">Arguments Made</span>
                        <span className="font-bold text-xl text-green-400">
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

          {/* Posts Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Recent Posts</h2>
              {postStats && (
                <div className="text-sm text-gray-400">
                  {postStats.totalPosts} total posts
                </div>
              )}
            </div>

            {postsLoading && posts.length === 0 ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-red-400 mr-3" />
                <span className="text-lg">Loading posts...</span>
              </div>
            ) : posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {posts.map((post, index) => (
                    <article
                      key={post._id || index}
                      className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover-lift group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold line-clamp-2 flex-1 group-hover:text-red-400 transition-colors">
                          {post.title || "Untitled Post"}
                        </h3>
                        <span className="text-xs text-gray-400 ml-4 bg-gray-700 px-3 py-1 rounded-full">
                          {post.category || "General"}
                        </span>
                      </div>

                      {post.content && (
                        <p className="text-gray-300 mb-6 line-clamp-3 leading-relaxed">
                          {post.content}
                        </p>
                      )}

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Heart className="w-4 h-4 mr-1 text-red-400" />
                            <span className="font-semibold">
                              {post.likes || 0}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">Likes</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Eye className="w-4 h-4 mr-1 text-blue-400" />
                            <span className="font-semibold">
                              {post.views || 0}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">Views</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <MessageSquare className="w-4 h-4 mr-1 text-green-400" />
                            <span className="font-semibold">
                              {post.comments?.length || 0}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            Comments
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleDateString()
                            : "Unknown date"}
                        </div>
                        <Link
                          to={`/posts/${post._id}`}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Read More
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-12">
                    <button
                      onClick={handleLoadMore}
                      disabled={postsLoading}
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {postsLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                          Loading More...
                        </>
                      ) : (
                        "Load More Posts"
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No posts yet</h3>
                <p className="text-gray-400 mb-6">
                  Start creating posts to see them here!
                </p>
                {isOwnProfile && (
                  <Link
                    to="/create-post"
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Create First Post
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* Post Statistics */}
          {postStats && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center lg:text-left">
                Content Overview
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center hover-lift">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {postStats.totalPosts || 0}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Posts
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center hover-lift">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {postStats.totalLikes || 0}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Likes
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center hover-lift">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {postStats.totalViews || 0}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Views
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center hover-lift">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {postStats.totalComments || 0}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Comments
                  </p>
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
