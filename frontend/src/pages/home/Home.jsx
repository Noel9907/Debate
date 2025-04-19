import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  TrendingUp,
  Users,
  Menu,
  X,
  Search,
  Bell,
  UserCircle,
  ThumbsUp,
  Share2,
} from "lucide-react";
import useGetAllPosts from "../../hooks/useGetPosts";
import Post from "./Post";

const recommendedTopics = [
  "Renewable Energy",
  "Education Reform",
  "Healthcare Systems",
  "Space Exploration",
  "Economic Policies",
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getPosts, loading, posts } = useGetAllPosts();
  useEffect(() => {
    getPosts();
  }, [getPosts]);
  return (
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
            href="/"
            className="text-2xl font-bold text-red-500 hover:text-red-400 transition-colors"
          >
            SpeakUp
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-white hover:text-red-400 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-red-400 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-red-400 transition-colors">
              <Link to={"/profile"}>
                <UserCircle className="w-5 h-5" />
              </Link>
            </button>
          </div>
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 py-4 ">
          <nav className="container mx-auto px-4">
            <ul className="space-y-4">
              <li>
                <Link
                  href="/search"
                  className="block hover:text-red-400 transition-colors"
                >
                  Search
                </Link>
              </li>
              <li>
                <Link
                  href="/notifications"
                  className="block hover:text-red-400 transition-colors"
                >
                  Notifications
                </Link>
              </li>
              <li>
                <Link
                  to={"/profile"}
                  className="block hover:text-red-400 transition-colors"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 overflow-y-auto h-[calc(100vh-64px-96px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <aside className="hidden md:block">
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Your Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-red-400" />
                    Debates Joined
                  </span>
                  <span className="font-bold">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-red-400" />
                    Arguments Made
                  </span>
                  <span className="font-bold">87</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ThumbsUp className="w-5 h-5 mr-2 text-red-400" />
                    Votes Received
                  </span>
                  <span className="font-bold">342</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-6">
              <input
                type="text"
                placeholder="Start a new debate..."
                className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex justify-between mt-4">
                <button className="text-gray-400 hover:text-white transition-colors">
                  Add Topic
                </button>
                <Link to={"/createPosts"}>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                    Post
                  </button>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                {posts.map((post, index) => (
                  <Post
                    key={index}
                    username={post.username}
                    title={post.title}
                    id={post._id}
                    text={post.text}
                    likes={post.likes_count}
                    comments={post.comments_count}
                    dislikes={post.dislikes_count}
                    categories={post.categories}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="hidden md:block">
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recommended Topics</h2>
              <div className="flex flex-wrap gap-2">
                {recommendedTopics.map((topic, index) => (
                  <button
                    key={index}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} DebateHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
