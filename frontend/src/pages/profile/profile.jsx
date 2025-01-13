import React from "react";
import { Link } from "react-router-dom";
import { Image } from "lucide-react";
import {
  MessageSquare,
  TrendingUp,
  Users,
  Search,
  Bell,
  UserCircle,
  Mail,
  MapPin,
  Calendar,
  Edit,
} from "lucide-react";

const userInfo = {
  name: "Jane Doe",
  username: "@janedoe",
  bio: "Passionate debater | Tech enthusiast | Always learning",
  location: "New York, NY",
  email: "jane.doe@example.com",
  joinDate: "January 2023",
  avatar: "/placeholder.svg?height=200&width=200",
};

const userStats = {
  debatesJoined: 15,
  argumentsMade: 87,
  votesReceived: 342,
};

const userDebates = [
  {
    title: "Should AI development be regulated?",
    participants: 156,
    votes: 2048,
    category: "Technology",
    userPosition: "For regulation",
  },
  {
    title: "Is a four-day work week beneficial for productivity?",
    participants: 89,
    votes: 1024,
    category: "Work",
    userPosition: "Against four-day work week",
  },
  {
    title:
      "Are electric vehicles the best solution for sustainable transportation?",
    participants: 112,
    votes: 1536,
    category: "Environment",
    userPosition: "For electric vehicles",
  },
  {
    title: "Should voting be mandatory in democratic countries?",
    participants: 78,
    votes: 896,
    category: "Politics",
    userPosition: "Against mandatory voting",
  },
];

export default function Profile() {
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
            DebateHub
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/search"
              className="text-white hover:text-red-400 transition-colors"
            >
              <Search className="w-6 h-6" />
            </Link>
            <Link
              href="/notifications"
              className="text-white hover:text-red-400 transition-colors"
            >
              <Bell className="w-6 h-6" />
            </Link>
            <Link
              href="/profile"
              className="text-white hover:text-red-400 transition-colors"
            >
              <UserCircle className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 overflow-y-auto h-[calc(100vh-64px-96px)]">
        {/* Profile Header */}
        <section className="mb-12 bg-gray-800 bg-opacity-50 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Image
              src={userInfo.avatar}
              alt={userInfo.name}
              width={200}
              height={200}
              className="rounded-full"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{userInfo.name}</h1>
              <p className="text-xl text-gray-400 mb-4">{userInfo.username}</p>
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
              href="/profile/edit"
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              <Edit className="w-4 h-4 inline mr-2" />
              Edit Profile
            </Link>
          </div>
        </section>
        {/* User Stats */}
        <section className="mb-12 bg-gray-800 bg-opacity-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Debate Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-3xl font-bold">{userStats.debatesJoined}</p>
              <p className="text-sm">Debates Joined</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-3xl font-bold">{userStats.argumentsMade}</p>
              <p className="text-sm">Arguments Made</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-3xl font-bold">{userStats.votesReceived}</p>
              <p className="text-sm">Votes Received</p>
            </div>
          </div>
        </section>
        {/* User's Debates */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">My Debates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userDebates.map((debate, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{debate.title}</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Category: {debate.category}
                </p>
                <p className="text-sm text-red-400 mb-4">
                  Your position: {debate.userPosition}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" /> {debate.participants}{" "}
                    participants
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" /> {debate.votes} votes
                  </span>
                </div>
                <Link
                  href={`/debates/${index}`}
                  className="mt-4 inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  View Debate
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/debates/new"
              className="bg-red-500 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-red-600 transition-colors inline-block"
            >
              Start a New Debate
            </Link>
          </div>
        </section>
      </main>

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
}
