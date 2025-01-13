import { Link } from "react-router-dom";
import { Image } from "lucide-react";
import {
  Users,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Share2,
} from "lucide-react";

export default function Posts({
  username,
  likes,
  catogories,
  createdAt,
  text,
  title,
}) {
  const debate = {
    id: 1,
    author: "John Doe",
    title: "The Future of AI",
    category: "Technology",
    content: "Let's discuss the potential and challenges of AI in the future.",
    participants: 25,
    votes: 100,
    comments: 10,
  };

  return (
    <div className=" p-3">
      <Link
        to={"/test"}
        className="block bg-gray-800 bg-opacity-50 rounded-lg p-6 "
      >
        <div className="flex items-center space-x-4 mb-4">
          <Image
            src={`https://api.dicebear.com/6.x/initials/svg?seed=${debate.author}`}
            alt={debate.author}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-400">
              Posted by {username} • Category: {catogories}
            </p>
          </div>
        </div>
        <p className="text-sm mb-4">{text}</p>
        <div className="flex justify-between text-sm text-gray-400 mb-4">
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" /> {debate.participants}{" "}
            participants
          </span>
          <span className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" /> {likes} votes
          </span>
          <span className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-1" /> {debate.comments}{" "}
            comments
          </span>
        </div>
        <div className="flex justify-between">
          <button className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ThumbsUp className="w-4 h-4 mr-2" />
            Vote
          </button>
          <button className="flex items-center text-gray-400 hover:text-white transition-colors">
            <MessageSquare className="w-4 h-4 mr-2" />
            Comment
          </button>
          <button className="flex items-center text-gray-400 hover:text-white transition-colors">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
        </div>
      </Link>
    </div>
  );
}
