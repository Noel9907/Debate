import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  TrendingUp,
  Users,
  Menu,
  X,
  FlameIcon as Fire,
  Award,
  Mail,
} from "lucide-react";

const featuredDebates = [
  { title: "Is AI a threat to humanity?", participants: 128, votes: 1024 },
  {
    title: "Should cryptocurrency be regulated?",
    participants: 96,
    votes: 512,
  },
  { title: "Is remote work the future?", participants: 64, votes: 256 },
  {
    title: "Should space exploration be prioritized over healthcare?",
    participants: 89,
    votes: 347,
  },
  {
    title: "Is universal basic income a viable solution?",
    participants: 120,
    votes: 890,
  },
  {
    title: "Does fast fashion harm the environment?",
    participants: 73,
    votes: 420,
  },
  {
    title: "Are electric vehicles the ultimate solution to climate change?",
    participants: 105,
    votes: 675,
  },
  {
    title: "Should governments ban violent video games?",
    participants: 54,
    votes: 312,
  },
  {
    title: "Is globalization beneficial for developing countries?",
    participants: 112,
    votes: 800,
  },
  {
    title: "Should social media platforms verify all users?",
    participants: 92,
    votes: 602,
  },
];

const trendingTopics = [
  "Climate Change",
  "Artificial Intelligence",
  "Cryptocurrency",
  "Space Exploration",
  "Universal Basic Income",
];

const userStats = {
  totalUsers: 10000,
  activeDebates: 500,
  totalArguments: 50000,
};

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter signup logic
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gray-900 bg-opacity-50 backdrop-blur-md py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-red-500 hover:text-red-400 transition-colors"
          >
            DebateHub
          </Link>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <Link
                  to="/debates"
                  className="hover:text-red-400 transition-colors"
                >
                  Debates
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-red-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-red-400 transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </nav>
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 py-4">
          <nav className="container mx-auto px-4">
            <ul className="space-y-4">
              <li>
                <Link
                  to="/debates"
                  className="block hover:text-red-400 transition-colors"
                >
                  Debates
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="block hover:text-red-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="block hover:text-red-400 transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="block bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-center"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
      {/* Featured Debates */}
      <section className="py-16 bg-gray-800 bg-opacity-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Featured Debates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDebates.map((debate, index) => (
              <div
                key={index}
                className="bg-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-4">{debate.title}</h3>
                <div className="flex justify-between text-sm text-gray-300">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" /> {debate.participants}{" "}
                    participants
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" /> {debate.votes} votes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Hero Section */}
      {/* <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to DebateHub</h1>
          <p className="text-xl mb-8">
            Engage in thought-provoking debates and expand your horizons
          </p>
          <Link
            to="/debates/new"
            className="bg-red-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-red-600 transition-colors inline-block"
          >
            Start a Debate
          </Link>
        </div>
      </section> */}

      {/* User Statistics */}
      <section className="py-16 bg-gray-800 bg-opacity-30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Our Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <p className="text-4xl font-bold">
                {userStats.totalUsers.toLocaleString()}
              </p>
              <p className="text-xl">Total Users</p>
            </div>
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <p className="text-4xl font-bold">
                {userStats.activeDebates.toLocaleString()}
              </p>
              <p className="text-xl">Active Debates</p>
            </div>
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <p className="text-4xl font-bold">
                {userStats.totalArguments.toLocaleString()}
              </p>
              <p className="text-xl">Total Arguments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Topics */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Trending Topics
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {trendingTopics.map((topic, index) => (
              <Link
                key={index}
                to={`/topics/${topic.toLowerCase().replace(/\s+/g, "-")}`}
                className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-600 transition-colors inline-flex items-center"
              >
                <Fire className="w-4 h-4 mr-2" />
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-800 bg-opacity-30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-4 text-center">
            Stay Updated
          </h2>
          <p className="text-center mb-8">
            Subscribe to our newsletter for the latest debates and community
            updates.
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="max-w-md mx-auto flex"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-grow px-4 py-2 rounded-l-md text-gray-900"
              required
            />
            <button
              type="submit"
              className="bg-red-500 text-white px-6 py-2 rounded-r-md hover:bg-red-600 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} DebateHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
