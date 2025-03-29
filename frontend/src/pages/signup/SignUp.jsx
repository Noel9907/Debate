import { useState } from "react";
import { User, Lock } from "lucide-react";
import useSignup from "../../hooks/useSignup";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
    confirmpasswo: "",
    gender: "",
  });

  const { loading, signup } = useSignup();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInputs = {
      username: inputs.username.trim(),
      password: inputs.password.trim(),
      confirmpassword: inputs.confirmpassword.trim(),
      gender: inputs.gender.trim(),
    };
    await signup(trimmedInputs);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-6">
            Create an Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  value={inputs.username}
                  onChange={(e) =>
                    setInputs({ ...inputs, username: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors text-gray-900"
                  placeholder="Name"
                  required
                />
                <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={inputs.password}
                  onChange={(e) =>
                    setInputs({ ...inputs, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors text-gray-900"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  value={inputs.confirmpassword}
                  onChange={(e) =>
                    setInputs({ ...inputs, confirmpassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-colors text-gray-900"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            {/* Gender Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={inputs.gender === "male"}
                    onChange={(e) =>
                      setInputs({ ...inputs, gender: e.target.value })
                    }
                    className="mr-2"
                  />
                  Male
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={inputs.gender === "female"}
                    onChange={(e) =>
                      setInputs({ ...inputs, gender: e.target.value })
                    }
                    className="mr-2"
                  />
                  Female
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-100 border-t border-gray-200">
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <a
              href="#"
              className="font-medium text-red-600 hover:text-red-500 transition-colors"
            >
              <Link to={"/login"}>Sign In</Link>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

//Time travel theme
// <div className="min-h-screen flex items-center justify-center bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover">
//   <div className="max-w-md w-full space-y-8 p-8 bg-amber-50 rounded-xl shadow-lg border-4 border-amber-900">
//     <div className="text-center space-y-2">
//       <Clock className="mx-auto h-12 w-12 text-amber-900" />
//       <h2 className="text-3xl font-extrabold text-amber-900">
//         Chrono-Registry
//       </h2>
//       <p className="text-sm text-amber-700">
//         Inscribe your temporal identity in the annals of time!
//       </p>
//     </div>
//     <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//       <div className="space-y-4">
//         <div>
//           <label
//             htmlFor="name"
//             className="block text-sm font-medium text-amber-900"
//           >
//             Temporal Designation (Name)
//           </label>
//           <input
//             id="username"
//             name="username"
//             type="text"
//             required
//             className="mt-1 block w-full px-3 py-2 bg-amber-100 border border-amber-300 rounded-md text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
//             placeholder="e.g. Chronos Smith"
//             value={inputs.username}
//             onChange={(e) =>
//               setInputs({ ...inputs, username: e.target.value })
//             }
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="timePeriod"
//             className="block text-sm font-medium text-amber-900"
//           >
//             Epoch of Origin
//           </label>
//           <select
//             id="timePeriod"
//             name="timePeriod"
//             required
//             className="mt-1 block w-full px-3 py-2 bg-amber-100 border border-amber-300 rounded-md text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
//             value={inputs.timePeriod}
//             onChange={(e) =>
//               setInputs({ ...inputs, timePeriod: e.target.value })
//             }
//           >
//             <option value="">Select your native era</option>
//             <option value="ancient-egypt">
//               Ancient Egypt (3100 BCE - 30 BCE)
//             </option>
//             <option value="roman-empire">
//               Roman Empire (27 BCE - 476 CE)
//             </option>
//             <option value="medieval-europe">
//               Medieval Europe (476 - 1453)
//             </option>
//             <option value="renaissance">
//               Renaissance (14th - 17th century)
//             </option>
//             <option value="industrial-revolution">
//               Industrial Revolution (1760 - 1840)
//             </option>
//             <option value="roaring-twenties">
//               Roaring Twenties (1920s)
//             </option>
//             <option value="space-age">Space Age (1957 - present)</option>
//             <option value="digital-era">
//               Digital Era (1990s - present)
//             </option>
//           </select>
//         </div>
//         <div>
//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-amber-900"
//             >
//               Temporal Designation (password)
//             </label>
//             <input
//               id="password"
//               name="password"
//               type="password"
//               required
//               className="mt-1 block w-full px-3 py-2 bg-amber-100 border border-amber-300 rounded-md text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
//               placeholder="e.g. Chronos Smith"
//               value={inputs.password}
//               onChange={(e) =>
//                 setInputs({ ...inputs, password: e.target.value })
//               }
//             />
//           </div>
//           <div>
//             <label
//               htmlFor="confirmpassword"
//               className="block text-sm font-medium text-amber-900"
//             >
//               Temporal Designation (confirmpassword)
//             </label>
//             <input
//               id="confirmpassword"
//               name="confirmpassword"
//               type="password"
//               required
//               className="mt-1 block w-full px-3 py-2 bg-amber-100 border border-amber-300 rounded-md text-amber-900 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
//               placeholder="e.g. Chronos Smith"
//               value={inputs.confirmpassword}
//               onChange={(e) =>
//                 setInputs({ ...inputs, confirmpassword: e.target.value })
//               }
//             />
//           </div>
//           <span className="block text-sm font-medium text-amber-900">
//             Temporal Form
//           </span>
//           <div className="mt-1 flex space-x-4">
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 name="gender"
//                 value="male"
//                 checked={inputs.gender === "male"}
//                 onChange={(e) =>
//                   setInputs({ ...inputs, gender: e.target.value })
//                 }
//                 className="form-radio text-amber-600 focus:ring-amber-500"
//               />
//               <span className="ml-2 text-amber-900">Gentleman</span>
//             </label>
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 name="gender"
//                 value="female"
//                 checked={inputs.gender === "female"}
//                 onChange={(e) =>
//                   setInputs({ ...inputs, gender: e.target.value })
//                 }
//                 className="form-radio text-amber-600 focus:ring-amber-500"
//               />
//               <span className="ml-2 text-amber-900">Lady</span>
//             </label>
//           </div>
//         </div>
//       </div>
//       <button
//         type="submit"
//         className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-amber-100 bg-amber-800 hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
//         disabled={loading} // Disable button when loading
//       >
//         <Scroll className="mr-2 h-4 w-4" />
//         {loading ? "Processing..." : "Seal Your Temporal Passport"}
//       </button>
//     </form>
//   </div>
// </div>
