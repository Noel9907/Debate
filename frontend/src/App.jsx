import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure this is also imported
import SignUp from "./pages/signup/SignUp";
import { useAuthContext } from "./context/AuthContext";
import { Navigate, Route, Router, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login.jsx";
import Profile from "./pages/profile/profile.jsx";
import CreatePost from "./pages/home/CreatePosts.jsx";
import Postpage from "./pages/home/post/Postpage.jsx";
import Footernav from "../components/Footernav.jsx";

function App() {
  const { authUser } = useAuthContext();
  return (
    <>
      <div
        className={
          authUser
            ? " min-h-screen bg-gradient-to-br pb-0 from-gray-900 to-black text-white flex flex-col"
            : ""
        }
      >
        <Routes>
          <Route path="/test/:postid" element={<Postpage />} />
          <Route
            path="/"
            element={authUser ? <Home /> : <Navigate to="/signup" />}
          />
          <Route
            path="/createPosts"
            element={authUser ? <CreatePost /> : <Navigate to={"/signup"} />}
          />
          <Route
            path="/profile"
            element={authUser ? <Profile /> : <Navigate to="/signup" />}
          />
        </Routes>
        {authUser ? <Footernav /> : <></>}
      </div>
      <Routes>
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <SignUp />}
        />
        {/* <Route
          path="/createPost"
          element={authUser ? <CreatePost /> : <Login />}
        />
        <Route
          path="/debatePage"
          element={authUser ? <DebateCommentPage /> : <Login />}
        /> */}
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
