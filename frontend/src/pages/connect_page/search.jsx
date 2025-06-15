import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  Clock,
  ThumbsUp,
  MessageSquare,
  Users,
  X,
  ChevronDown,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footernav from "../../../components/Footernav";
import useSearchUsers from "../../hooks/connectPage/useSearchuser";
import ProfileCard from "./profile"; // Import the ProfileCard component

export default function SearchPage() {
  const { loading, User: searchedUsers, searchUsers } = useSearchUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("trending");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchType, setSearchType] = useState("debates"); // "debates" or "users"

  // New states for infinite scroll
  const [currentOffset, setCurrentOffset] = useState(0);
  const [allUsers, setAllUsers] = useState([]); // Store all loaded users
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState("");

  // Mock search results for debates
  const [searchResults, setSearchResults] = useState([
    {
      _id: "1",
      title: "Should AI development be regulated by governments?",
      text: "As AI becomes more advanced, there are growing concerns about its potential impact on society...",
      username: "techethics",
      likes_count: 342,
      dislikes_count: 28,
      comments_count: 87,
      participants: 45,
      categories: ["Technology", "Politics", "Ethics"],
      createdAt: "2023-11-15T14:23:00Z",
    },
    {
      _id: "2",
      title: "Is remote work better for productivity?",
      text: "The pandemic forced many companies to adopt remote work policies. Now that restrictions have eased...",
      username: "worklifebalance",
      likes_count: 256,
      dislikes_count: 42,
      comments_count: 63,
      participants: 31,
      categories: ["Work", "Business", "Health"],
      createdAt: "2023-11-18T09:45:00Z",
    },
    {
      _id: "3",
      title: "Should college education be free?",
      text: "The rising cost of higher education has led to debates about whether college should be free...",
      username: "educationreform",
      likes_count: 512,
      dislikes_count: 89,
      comments_count: 124,
      participants: 78,
      categories: ["Education", "Economics", "Politics"],
      createdAt: "2023-11-10T16:30:00Z",
    },
    {
      _id: "4",
      title: "Is cryptocurrency the future of finance?",
      text: "With the rise of Bitcoin and other cryptocurrencies, many are wondering if traditional banking...",
      username: "cryptoenthusiast",
      likes_count: 423,
      dislikes_count: 102,
      comments_count: 95,
      participants: 52,
      categories: ["Finance", "Technology", "Economics"],
      createdAt: "2023-11-20T11:15:00Z",
    },
    {
      _id: "5",
      title:
        "Should social media platforms be responsible for content moderation?",
      text: "As misinformation spreads online, there's growing debate about the responsibility of platforms...",
      username: "digitalpolicy",
      likes_count: 378,
      dislikes_count: 45,
      comments_count: 112,
      participants: 67,
      categories: ["Social Media", "Politics", "Ethics"],
      createdAt: "2023-11-17T13:20:00Z",
    },
  ]);

  // Available categories for filtering
  const categories = [
    "Technology",
    "Politics",
    "Ethics",
    "Work",
    "Business",
    "Health",
    "Education",
    "Economics",
    "Finance",
    "Social Media",
  ];

  // Format number function
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 10000) {
      return (num / 1000).toFixed(0) + "k";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to load more users (for infinite scroll)
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

  // Update allUsers when searchedUsers changes
  // Update allUsers when searchedUsers changes
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

  // Toggle category selection
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Filter results based on selected categories (only for debates)
  const filteredResults =
    searchType === "debates" && selectedCategories.length > 0
      ? searchResults.filter((result) =>
          result.categories.some((category) =>
            selectedCategories.includes(category)
          )
        )
      : searchResults;

  // Sort results based on active filter (only for debates)
  const sortedResults =
    searchType === "debates"
      ? [...filteredResults].sort((a, b) => {
          switch (activeFilter) {
            case "trending":
              return (
                b.likes_count -
                b.dislikes_count -
                (a.likes_count - a.dislikes_count)
              );
            case "recent":
              return new Date(b.createdAt) - new Date(a.createdAt);
            case "most-commented":
              return b.comments_count - a.comments_count;
            default:
              return 0;
          }
        })
      : allUsers || []; // Use allUsers instead of searchedUsers

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

          {/* Search type indicator */}
          {/* <div className="mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSearchType("debates")}
                className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${
                  searchType === "debates"
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Debates
              </button>
              <button
                onClick={() => setSearchType("users")}
                className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${
                  searchType === "users"
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Users
              </button>
            </div>
          </div> */}

          {/* Filters section - only show for debates */}
          {searchType === "debates" && (
            // <div className="mb-6">
            //   <div className="flex justify-between items-center">
            //     <div className="flex space-x-4">
            //       <button
            //         onClick={() => setActiveFilter("trending")}
            //         className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${
            //           activeFilter === "trending"
            //             ? "bg-gray-700 text-white"
            //             : "text-gray-400 hover:text-white hover:bg-gray-800"
            //         }`}
            //       >
            //         <TrendingUp className="w-4 h-4 mr-2" />
            //         Trending
            //       </button>
            //       <button
            //         onClick={() => setActiveFilter("recent")}
            //         className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${
            //           activeFilter === "recent"
            //             ? "bg-gray-700 text-white"
            //             : "text-gray-400 hover:text-white hover:bg-gray-800"
            //         }`}
            //       >
            //         <Clock className="w-4 h-4 mr-2" />
            //         Recent
            //       </button>
            //       <button
            //         onClick={() => setActiveFilter("most-commented")}
            //         className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${
            //           activeFilter === "most-commented"
            //             ? "bg-gray-700 text-white"
            //             : "text-gray-400 hover:text-white hover:bg-gray-800"
            //         }`}
            //       >
            //         <MessageSquare className="w-4 h-4 mr-2" />
            //         Most Commented
            //       </button>
            //     </div>
            //     <button
            //       onClick={() => setShowFilters(!showFilters)}
            //       className="flex items-center px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
            //     >
            //       <Filter className="w-4 h-4 mr-2" />
            //       Filter
            //       <ChevronDown
            //         className={`w-4 h-4 ml-1 transition-transform ${
            //           showFilters ? "rotate-180" : ""
            //         }`}
            //       />
            //     </button>
            //   </div>

            //   {/* Category filters */}
            //   {showFilters && (
            //     <div className="mt-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
            //       <h3 className="text-sm font-medium text-gray-300 mb-3">
            //         Filter by categories:
            //       </h3>
            //       <div className="flex flex-wrap gap-2">
            //         {categories.map((category) => (
            //           <button
            //             key={category}
            //             onClick={() => toggleCategory(category)}
            //             className={`px-3 py-1 text-sm rounded-full transition-colors ${
            //               selectedCategories.includes(category)
            //                 ? "bg-red-600 text-white"
            //                 : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            //             }`}
            //           >
            //             {category}
            //             {selectedCategories.includes(category) && (
            //               <X className="w-3 h-3 ml-1 inline" />
            //             )}
            //           </button>
            //         ))}
            //       </div>
            //       {selectedCategories.length > 0 && (
            //         <button
            //           onClick={() => setSelectedCategories([])}
            //           className="mt-3 text-xs text-red-400 hover:text-red-300"
            //         >
            //           Clear all filters
            //         </button>
            //       )}
            //     </div>
            //   )}
            // </div>
            <></>
          )}

          {/* Search results */}
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

                {/* No more users indicator */}
                {/* {!hasMoreUsers &&
                  sortedResults.length > 0 &&
                  currentOffset == 4 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">
                        No more users to load
                      </p>
                    </div>
                  )} */}
                {currentOffset == 4 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      No more users to load
                    </p>
                  </div>
                )}
              </>
            ) : // Debate search results
            sortedResults.length > 0 ? (
              sortedResults.map((result) => (
                <Link
                  to={`/post/${result._id}`}
                  key={result._id}
                  className="block bg-gray-800 bg-opacity-50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        {result.title}
                      </h2>
                      <p className="text-gray-300 line-clamp-2 mb-3">
                        {result.text}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {result.categories.map((category) => (
                          <span
                            key={category}
                            className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full text-xs"
                          >
                            {category}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center text-sm text-gray-400">
                        <span className="mr-4">
                          by{" "}
                          <span className="text-blue-400">
                            {result.username}
                          </span>
                        </span>
                        <span className="mr-4">
                          {formatDate(result.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between h-full">
                      <div className="flex items-center text-sm">
                        <span className="flex items-center text-green-400 mr-3">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          {formatNumber(result.likes_count)}
                        </span>
                        <span className="flex items-center text-red-400">
                          <ThumbsUp className="w-3 h-3 mr-1 transform rotate-180" />
                          {formatNumber(result.dislikes_count)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-700">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1 text-blue-400" />
                      {formatNumber(result.participants)} participants
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
                      {formatNumber(
                        result.likes_count - result.dislikes_count
                      )}{" "}
                      net points
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1 text-purple-400" />
                      {formatNumber(result.comments_count)} comments
                    </span>
                  </div>
                </Link>
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

          {/* Pagination placeholder - only show for debates */}
          {searchType === "debates" && sortedResults.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="inline-flex rounded-md shadow">
                <button className="py-2 px-4 rounded-l-md bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50">
                  Previous
                </button>
                <button className="py-2 px-4 bg-red-600 text-white">1</button>
                <button className="py-2 px-4 bg-gray-800 text-gray-400 hover:bg-gray-700">
                  2
                </button>
                <button className="py-2 px-4 bg-gray-800 text-gray-400 hover:bg-gray-700">
                  3
                </button>
                <button className="py-2 px-4 rounded-r-md bg-gray-800 text-gray-400 hover:bg-gray-700">
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footernav color={"search"} />
    </>
  );
}
