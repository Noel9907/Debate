import { useState, useEffect, useCallback } from "react";
import { Search, MessageSquare, User } from "lucide-react";
import Footernav from "../../../components/Footernav";
import useSearchUsers from "../../hooks/connectPage/useSearchuser";
import ProfileCard from "./profile";
import Posts from "../home/Post";
import { useGetTrending } from "../../hooks/useGetPosts";

export default function SearchPage() {
  const { loading, User: searchedUsers, searchUsers } = useSearchUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("trending");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchType, setSearchType] = useState("debates");
  const { getPosts, posts } = useGetTrending();
  useEffect(() => {
    getPosts();
  }, [getPosts]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState([]);

  const loadMoreUsers = useCallback(async () => {
    if (currentOffset == 4) return;
    if (isLoadingMore || !hasMoreUsers || searchType !== "users") return;

    setIsLoadingMore(true);
    try {
      const cleanQuery = lastSearchQuery.replace("@", "").trim();
      await searchUsers(cleanQuery, currentOffset + 1); // Pass offset to your hook
    } catch (error) {
      console.error("Error loading more users:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    currentOffset,
    hasMoreUsers,
    isLoadingMore,
    lastSearchQuery,
    searchType,
    searchUsers,
  ]);

  // Scroll event handler
  const handleScroll = useCallback(() => {
    if (searchType !== "users" || isLoadingMore || !hasMoreUsers) return;

    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight =
      document.documentElement.clientHeight || window.innerHeight;

    // Check if user has scrolled to bottom (with 100px threshold)
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMoreUsers();
    }
  }, [loadMoreUsers, searchType, isLoadingMore, hasMoreUsers]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (searchedUsers && searchType === "users") {
      if (currentOffset === 0) {
        // First search - replace all users
        setAllUsers(searchedUsers);
      } else {
        // Subsequent searches - append new users
        setAllUsers((prevUsers) => {
          // Remove duplicates by checking IDs
          const existingIds = prevUsers.map((user) => user._id);
          const newUsers = searchedUsers.filter(
            (user) => !existingIds.includes(user._id)
          );
          return [...prevUsers, ...newUsers];
        });
      }

      // Update offset for next load
      setCurrentOffset((prev) => prev + 1);

      // Check if we have more users (assuming if we get less than 10, no more users)
      if (searchedUsers.length < 10) {
        setHasMoreUsers(false);
      }
    }
  }, [searchedUsers, searchType]); // ✅ Remove currentOffset from dependencies
  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);

    try {
      // Check if searching for users (starts with @ or contains username-like patterns)
      const isUserSearch =
        searchQuery.startsWith("@") ||
        searchQuery.toLowerCase().includes("user") ||
        /^[a-zA-Z0-9_]+$/.test(searchQuery.trim());

      if (isUserSearch) {
        setSearchType("users");
        // Reset for new search
        setCurrentOffset(0);
        setAllUsers([]);
        setHasMoreUsers(true);
        setLastSearchQuery(searchQuery);

        // Remove @ if present for the API call
        const cleanQuery = searchQuery.replace("@", "").trim();
        await searchUsers(cleanQuery, 0); // Start with offset 0
      } else {
        setSearchType("debates");
        // Filter debate results based on search query
        const filteredResults = searchResults.filter(
          (result) =>
            result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filteredResults);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults =
    searchType === "debates" && selectedCategories.length > 0
      ? searchResults.filter((result) =>
          result.categories.some((category) =>
            selectedCategories.includes(category)
          )
        )
      : searchResults;

  const sortedResults = allUsers || [];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <header className="bg-gray-900 bg-opacity-50 backdrop-blur-md py-4 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-white">
              Search {searchType === "users" ? "Users" : "Debates"}
            </h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                  <p className="mt-4 text-gray-400">Searching...</p>
                </div>
              </div>
            ) : searchType === "users" ? (
              // User search results
              <>
                {sortedResults.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedResults.map((user) => (
                      <ProfileCard key={user._id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800 bg-opacity-50 rounded-lg p-8 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No users found</p>
                    <p className="text-sm text-gray-500">
                      Try searching with a different username
                    </p>
                  </div>
                )}

                {/* Loading more indicator */}
                {isLoadingMore && (
                  <div className="flex justify-center py-4">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                      <p className="mt-2 text-gray-400 text-sm">
                        Loading more users...
                      </p>
                    </div>
                  </div>
                )}

                {currentOffset == 4 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      No more users to load
                    </p>
                  </div>
                )}
              </>
            ) : // Debate search results
            posts.length > 0 ? (
              posts.map((post, index) => (
                <Posts
                  key={index}
                  username={post.username}
                  title={post.title}
                  id={post._id}
                  text={post.text}
                  likes={post.likes_count}
                  comments={post.comments_count}
                  dislikes={post.dislikes_count}
                  categories={post.categories}
                  imageUrl={post.imageUrl}
                />
              ))
            ) : (
              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No debates found</p>
                <p className="text-sm text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footernav color={"search"} />
    </>
  );
}
