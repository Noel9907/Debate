import { useEffect } from "react";
import { Link } from "react-router-dom";
import { HomeIcon, Search, Cloud, User } from "lucide-react";
import useGetAllPosts from "../../hooks/useGetPosts";
import Post from "./Post";
import Footernav from "../../../components/Footernav";
import Topbar from "../../../components/Topbar";

export default function Home() {
  const { getPosts, loading, posts } = useGetAllPosts();

  useEffect(() => {
    getPosts();
  }, [getPosts]);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
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

        <Topbar />

        {/* Main Content - Feed style layout as per sketch */}
        <main className="flex-grow overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-10">Loading debates...</div>
              ) : (
                posts.map((post, index) => (
                  <Post
                    key={index}
                    username={post.username}
                    title={post.title}
                    id={post._id}
                    text={post.text}
                    likes={post.likes_count}
                    likesUsername={post.likes}
                    dislikesUsername={post.dislikes}
                    comments={post.comments_count}
                    dislikes={post.dislikes_count}
                    categories={post.categories}
                    imageUrl={post.imageUrl}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
      <Footernav color={"home"} />
    </>
  );
}
