import { useContext, useEffect, useState } from "react";
import { FaSearch, FaUserAlt } from "react-icons/fa";
import axios from "axios";
import { MdLogout } from "react-icons/md";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import { AdminDataContext } from "../context/AdminContext";

const AdminPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { adminProfile, setAdminProfile } = useContext(AdminDataContext);
  const [signupPanelOpen, setIsSignupPanelOpen] = useState(false);
  const [loginPanelOpen, setIsLoginPanelOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [profilePanel, setProfilePanel] = useState(false);
  const [examPreference, setExamPreference] = useState("");
  const [uploadedTests, setUploadedTests] = useState([]);
  const [file, setFile] = useState(null);
  const [testTime, setTestTime] = useState("");
  const [input, setInput] = useState("");
  const [testName, setTestName] = useState("");
  const [testDate, setTestDate] = useState("");
  const [testUploadPanel, setTestUploadPanel] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSomeoneLoggedIn, setIsSomeoneLoggedIn] = useState(false);
  const [admin, setAdmin] = useState(localStorage.getItem("profile"));
  const [uploadedTestButtonPanel, setUploadedTestButtonPanel] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleBackButton = () => {
      window.history.pushState(null, "", window.location.href);
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      setIsSomeoneLoggedIn(true);
    }
  }, [isSomeoneLoggedIn]);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const navigate = useNavigate();

  const handleUploadedTests = async () => {
    setUploadedTestButtonPanel(false);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/tests/getAllTests`
      );

      // Extract _id from admin string
      const adminIdMatch = admin.match(/\"_id\":\"(.*?)\"/);
      const adminId = adminIdMatch ? adminIdMatch[1] : null; // Extract only the first match group (the value of _id)

      if (!adminId) {
        console.log("No _id found in admin");
        return;
      }

      response.data.data.forEach((test) => {
        if (test.instructor === adminId) {
          setUploadedTests((prevTests) => {
            // Add the test only if it doesn't already exist in the array
            if (
              !prevTests.some((uploadedTest) => uploadedTest._id === test._id)
            ) {
              return [...prevTests, test];
            }
            return prevTests;
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const closePanel = () => {
    setIsSignupPanelOpen(false);
    setIsLoginPanelOpen(false);
    setProfilePanel(false);
    setTestUploadPanel(false);
    setUploadedTestButtonPanel(false);
    setUploadedTests([]);
  };

  const handleSignup = () => {
    setIsSignupPanelOpen(true);
  };

  const handleLogin = () => {
    setIsLoginPanelOpen(true);
  };

  const handleProfile = async () => {
    if (!adminProfile) {
      alert("Something went wrong, Login again...");
      localStorage.removeItem("accessToken");
    }
    setProfilePanel(true);
    setUploadedTestButtonPanel(true);
  };

  const handleLogoutAdmin = async () => {
    try {
      const accToken = localStorage.getItem("accessToken");
      if (accToken) {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admins/logoutAdmin`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accToken}`,
            },
          }
        );
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("profile");
      setIsSomeoneLoggedIn(false);
      alert("Logout successful");
    } catch (error) {
      console.log(error);
    }
  };

  const submitHandlerLoginAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admins/loginAdmin`,
        {
          email: email,
          password: password,
        }
      );
      if (response.status == 200) {
        const data = response.data.data;
        setIsSomeoneLoggedIn(true);
        setAdminProfile(data.admin);
        localStorage.setItem("profile", JSON.stringify(data.admin));
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        alert("Admin Logged In succesfully");
      }
      setAdmin(localStorage.getItem("profile"));
      setIsLoginPanelOpen(false);
    } catch (error) {
      if (error.response?.status === 400) {
        alert("All Fields are required");
      } else if (error.response?.status === 404) {
        alert("Admin not found");
      } else if (error.response?.status === 401) {
        alert("Invalid Password");
      }
    }
    setEmail("");
    setPassword("");
  };

  const submitHandlerAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admins/registerAdmin`,
        {
          fullName: fullName,
          email: email,
          password: password,
          phoneNumber: phoneNumber,
          examPreference: examPreference,
        }
      );
      if (response.status == 200) {
        const data = response.data.data;
        setAdminProfile(data.admin);
        setIsSomeoneLoggedIn(true);
        localStorage.setItem("profile", JSON.stringify(data.admin));
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        alert("Admin registered succesfully");
      }
      setAdmin(localStorage.getItem("profile"));
      setIsSignupPanelOpen(false);
    } catch (error) {
      if (error.response?.status === 400) {
        alert("All Fields are required");
      } else if (error.response?.status === 401) {
        alert("Admin already exists");
      } else if (error.response?.status === 402) {
        alert("Something went wrong");
      }
    }
    setFullName("");
    setEmail("");
    setPassword("");
    setPhoneNumber("");
    setExamPreference("");
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("testName", testName);
    formData.append("testDate", testDate);
    formData.append("instructor", adminProfile._id);
    formData.append("examType", adminProfile.examPreference);
    formData.append("testTime", testTime);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/tests/createTest`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
      const data = response.data.data;
      setUploadedTests(data);
      setTestName("");
      setTestDate("");
      setFile("");
      setTestUploadPanel(false);
      alert("Test uploaded Successfully");
    } catch (error) {
      console.error("Error uploading test:", error);
      alert("Failed to upload test");
    }
  };

  const handleTestUploadPanel = () => {
    setTestUploadPanel(true);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setInput("");
  };

  const handleSearch = async () => {
    if (!input.trim()) return;
    try {
      // Making the API request
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/tests/search`,
        {
          params: { name: input },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setSearchResults((prevTests) => [...prevTests, ...response.data.data]);
    } catch (error) {
      console.error("Search failed", error);
      setSearchResults([]);
    }
  };

  const handleSearchError = () => {
    alert("Login First to see the Test details");
    setInput("");
    setSearchResults("");
  };

  const handleCanNotSearch = () => {
    alert("You are admin, You can not give the Test");
    handleClearSearch();
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-600 py-4">
        <div className="container mx-auto flex justify-between items-center px-6 md:px-12 bg-gray-800 shadow-xl p-6">
          <div className="flex items-center justify-between gap-6">
            <h1 className="text-4xl font-extrabold text-yellow-400 transform hover:scale-105 transition-all duration-300">
              CrackItHub
            </h1>
            <div className="text-lg transition duration-300 flex items-center">
              <div className="relative">
                {/* Button */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="hover:text-yellow-100 cursor-pointer active:text-blue-500 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  Test Categories
                </button>

                {/* Dropdown Panel */}
                <div
                  className={`absolute left-0 mt-2 w-40 bg-white border rounded-lg shadow-lg transition-all duration-300 ${
                    isOpen ? "block" : "hidden"
                  } group-hover:block`}
                >
                  <ul className="text-lg">
                    <li>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-yellow-100 transition-all duration-300">
                        JEE
                      </button>
                    </li>
                    <li>
                      <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-yellow-100 transition-all duration-300">
                        NEET
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                {isSomeoneLoggedIn === true && (
                  <button
                    className="hover:text-yellow-100 cursor-pointer ml-5 px-4 py-2 rounded-lg transition-all duration-300"
                    onClick={handleTestUploadPanel}
                  >
                    Create Test
                  </button>
                )}
              </div>

              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="hover:text-yellow-100 cursor-pointer ml-5 px-4 py-2 rounded-lg transition-all duration-300"
              >
                Features
              </button>
              <button
                className="hover:text-yellow-100 ml-5 cursor-pointer px-4 py-2 rounded-lg transition-all duration-300"
                onClick={() =>
                  document
                    .getElementById("faqs")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                FAQs
              </button>
              <button
                className="hover:text-yellow-100 ml-5 cursor-pointer px-4 py-2 rounded-lg transition-all duration-300"
                onClick={() =>
                  document
                    .getElementById("footer")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Contact Us
              </button>
            </div>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="🔍 Search for Test by name"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="px-4 py-2 w-72 text-black rounded-full shadow-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10 transition-all duration-300"
            />

            <div>
              {isSomeoneLoggedIn === true ? (
                <>
                  <FaSearch
                    className="absolute right-24 top-1/2 transform -translate-x-12 -translate-y-1/2 text-gray-500 text-2xl cursor-pointer hover:text-yellow-500 transition-all duration-300"
                    onClick={handleSearch}
                  />
                  <button
                    className="absolute right-29 top-1/2 z-20 cursor-pointer transform -translate-y-1/2 text-gray-400 hover:text-yellow-500 focus:outline-none text-lg"
                    onClick={handleClearSearch}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <FaSearch
                    className="absolute right-46 top-1/2 transform -translate-x-12 -translate-y-1/2 text-gray-500 text-2xl cursor-pointer hover:text-yellow-500 transition-all duration-300"
                    onClick={handleSearch}
                  />
                  <button
                    className="absolute right-52 top-1/2 z-20 cursor-pointer transform -translate-y-1/2 text-gray-400 hover:text-yellow-500 focus:outline-none text-lg"
                    onClick={handleClearSearch}
                  >
                    ✕
                  </button>
                </>
              )}

              {searchResults.length > 0 ? (
                <div className="absolute top-full right-20 mt-3 w-full bg-yellow-200 border rounded-xl shadow-2xl z-10 animate-fade-in">
                  <h2 className="text-lg font-bold text-gray-800 mb-3 px-5 pt-5 border-b pb-3">
                    Search Results:
                  </h2>
                  <ul className="space-y-4 px-5 pb-5">
                    {searchResults.map((test) => (
                      <li
                        key={test.id || test._id}
                        className="p-4 border rounded-lg bg-gradient-to-r from-white to-gray-50 shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex gap-4 items-center">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {test.testName}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {test.instructor.fullName}
                              </p>
                            </div>
                          </div>
                          <button
                            className="mt-3 px-5 py-2 cursor-pointer bg-yellow-200 text-gray-700 hover:bg-yellow-300 rounded-md transition-all duration-300 ease-in-out"
                            onClick={() => {
                              if (isSomeoneLoggedIn) {
                                handleCanNotSearch();
                              } else {
                                handleSearchError();
                              }
                            }}
                          >
                            Enter
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                input && (
                  <div className="absolute top-full right-20 mt-3 w-full bg-yellow-200 border rounded-xl shadow-2xl z-10 animate-fade-in">
                    <h2 className="text-sm font-bold text-gray-500 mb-3 px-5 pt-5">
                      No groups found
                    </h2>
                  </div>
                )
              )}
            </div>

            <div>
              {isSomeoneLoggedIn === true ? (
                <>
                  {/* Profile Button */}
                  <button
                    className="bg-green-600 text-xl font-bold p-3 mx-2 rounded-full shadow-lg text-white hover:bg-green-700 transition-all duration-300 cursor-pointer"
                    onClick={handleProfile}
                  >
                    <FaUserAlt />
                  </button>
                  {/* Logout Button */}
                  <button
                    className="bg-red-600 text-xl font-bold p-3 rounded-full shadow-lg cursor-pointer text-white hover:bg-red-700 transition-all duration-300"
                    onClick={handleLogoutAdmin}
                  >
                    <MdLogout />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="bg-blue-600 text-xl font-bold py-2 px-4 mx-2 rounded-xl cursor-pointer shadow-lg text-white hover:bg-blue-700 transition-all duration-300"
                    onClick={handleSignup}
                  >
                    Signup
                  </button>
                  {signupPanelOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-[150]">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 py-2 px-8 rounded-lg shadow-lg w-full max-w-md my-8">
                        <h1 className="text-4xl font-extrabold text-black transform hover:scale-105 transition-all duration-300 mb-5">
                          CrackItHub
                        </h1>
                        <div className="bg-white/95 rounded-xl shadow-2xl p-6 w-full relative transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
                          <button
                            className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={closePanel}
                          >
                            ✕
                          </button>
                          <form onSubmit={submitHandlerAdmin}>
                            {/* Name Field */}
                            <div className="mb-2">
                              <label
                                htmlFor="name"
                                className="block text-lg font-medium text-gray-700"
                              >
                                Full Name
                              </label>
                              <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="Enter your Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                                required
                              />
                            </div>

                            {/* Email Field */}
                            <div className="mb-2">
                              <label
                                htmlFor="email"
                                className="block text-lg font-medium text-gray-700"
                              >
                                Email
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                                required
                              />
                            </div>

                            {/* Password Field */}
                            <div className="mb-2">
                              <label
                                htmlFor="password"
                                className="block text-lg font-medium text-gray-700"
                              >
                                Password
                              </label>
                              <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                                required
                              />
                            </div>

                            {/* Contact Information */}
                            <div className="mb-2">
                              <h3 className="block text-lg font-medium text-gray-700">
                                Contact Information
                              </h3>
                              <PhoneInput
                                country={"in"}
                                value={phoneNumber}
                                onChange={(phone) => setPhoneNumber(phone)}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                                inputClass="bg-gray-200 rounded px-4 py-2 text-sm outline-none"
                              />
                            </div>

                            {/* Exam Preference Field */}

                            <div className="mb-2">
                              <label
                                htmlFor="exam"
                                className="block text-lg font-medium text-gray-700"
                              >
                                Exam
                              </label>
                              <select
                                id="exam"
                                name="exam"
                                value={examPreference}
                                onChange={(e) =>
                                  setExamPreference(e.target.value)
                                }
                                className="w-full px-4 py-2 mt-2 border cursor-pointer border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                                required
                              >
                                <option value="">Select Exam</option>
                                <option value="JEE">JEE</option>
                                <option value="NEET">NEET</option>
                              </select>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6">
                              <button
                                type="submit"
                                className="w-full px-4 py-2 bg-yellow-500 cursor-pointer text-white font-semibold rounded-md hover:bg-yellow-400 transition duration-300"
                              >
                                Sign Up
                              </button>

                              <button
                                className="w-full px-4 py-2 mt-1 bg-green-500 cursor-pointer text-white font-semibold rounded-md hover:bg-green-400 transition duration-300"
                                onClick={() => {
                                  navigate("/");
                                }}
                              >
                                Sign Up as User
                              </button>
                            </div>
                            <p className="text-center text-black mt-2">
                              Already have an account?{" "}
                              <button
                                className="text-blue-600 cursor-pointer hover:underline ml-1"
                                onClick={() => {
                                  closePanel();
                                  setIsLoginPanelOpen(true);
                                }}
                              >
                                Login
                              </button>
                            </p>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    className="bg-blue-600 text-xl font-bold py-2 px-4 rounded-xl cursor-pointer shadow-lg text-white hover:bg-blue-700 transition-all duration-300"
                    onClick={handleLogin}
                  >
                    Login
                  </button>
                  {loginPanelOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-[150]">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-8 rounded-lg shadow-lg w-full max-w-md">
                        <h1 className="text-4xl font-extrabold text-black transform hover:scale-105 transition-all duration-300 mb-5">
                          CrackItHub
                        </h1>
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full relative transform transition-all duration-300 ease-in-out scale-95 hover:scale-100 z-60">
                          <button
                            className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={closePanel}
                          >
                            ✕
                          </button>
                          <form onSubmit={submitHandlerLoginAdmin}>
                            {/* Email Field */}
                            <div className="mb-4">
                              <label
                                htmlFor="email"
                                className="block text-lg font-medium text-gray-700"
                              >
                                Email
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                                required
                              />
                            </div>

                            {/* Password Field */}
                            <div className="mb-4">
                              <label
                                htmlFor="password"
                                className="block text-lg font-medium text-gray-700"
                              >
                                Password
                              </label>
                              <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                                required
                              />
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6">
                              <button
                                type="submit"
                                className="w-full px-4 py-2 bg-yellow-500 cursor-pointer text-white font-semibold rounded-md hover:bg-yellow-400 transition duration-300"
                              >
                                Log In
                              </button>
                              <button
                                className="w-full px-4 py-2 bg-green-500 cursor-pointer mt-1 text-white font-semibold rounded-md hover:bg-green-400 transition duration-300"
                                onClick={() => navigate("/")}
                              >
                                Log In as User
                              </button>
                            </div>
                            <p className="text-center mt-3 text-black">
                              New Here?
                              <button
                                className="text-blue-600 mb-7 cursor-pointer"
                                onClick={() => {
                                  closePanel(); // Close the panel
                                  setIsSignupPanelOpen(true); // Set signup panel to true
                                }}
                              >
                                Create Account
                              </button>
                            </p>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {testUploadPanel && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-[150]">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 py-2 px-8 rounded-lg shadow-lg w-full max-w-md my-8">
            <h1 className="text-4xl font-extrabold text-black transform hover:scale-105 transition-all duration-300 mb-2">
              CrackItHub
            </h1>
            <div className="bg-white/95 rounded-xl shadow-2xl p-6 w-full relative transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
              <button
                className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={closePanel}
              >
                ✕
              </button>
              <div className="flex justify-center items-center gap-2">
                <span className="block text-xl font-extrabold text-gray-700 bg-amber-300 p-2 mb-2">
                  Hey Admin!!! Create a Test
                </span>
              </div>
              <form onSubmit={handleCreateTest}>
                {/* Test Name Field */}
                <div className="mb-1">
                  <label
                    htmlFor="testName"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Test Name
                  </label>
                  <input
                    type="text"
                    id="testName"
                    name="testName"
                    placeholder="Enter your Test Name"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                    required
                  />
                </div>

                {/* Instructor Name Field */}
                <div className="mb-1">
                  <label
                    htmlFor="instructorName"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Instructor Name
                  </label>
                  <input
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                    type="text"
                    value={adminProfile?.fullName}
                    readOnly
                  />
                </div>

                {/* Test Date Field */}
                <div className="mb-1">
                  <label
                    htmlFor="test-date"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Test Date
                  </label>
                  <input
                    type="date"
                    id="test-date"
                    name="test-date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                    required
                  />
                </div>

                <div className="mb-1">
                  <label
                    htmlFor="test-time"
                    className="block text-lg font-medium text-gray-700 "
                  >
                    Test Start Time
                  </label>
                  <input
                    type="time"
                    id="test-time"
                    name="test-time"
                    value={testTime}
                    onChange={(e) => setTestTime(e.target.value)}
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                    required
                  />
                </div>

                {/* CSV File Upload Field */}
                <div className="mb-1">
                  <label
                    htmlFor="csvUpload"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    id="csvUpload"
                    name="csvUpload"
                    accept=".csv"
                    onChange={(e) => handleFileUpload(e)}
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                  />
                </div>

                {/* Exam Preference Field */}
                <div className="mb-1">
                  <label
                    htmlFor="examType"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Exam Type
                  </label>
                  <input
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                    type="text"
                    value={adminProfile?.examPreference}
                    readOnly
                  />
                </div>

                {/* Submit Button */}
                <div className="mt-4">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-yellow-500 cursor-pointer text-white font-semibold rounded-md hover:bg-yellow-400 transition duration-300"
                  >
                    Create Test
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {profilePanel === true ? (
        <main className="container mx-auto px-6 md:px-12 py-24">
          <button
            className="mb-4 bg-yellow-400 px-3 py-2 text-lg rounded-lg cursor-pointer"
            onClick={closePanel}
          >
            <span className="flex items-center">
              <IoMdArrowRoundBack className="text-xl mr-2" />
              Go Back
            </span>
          </button>

          {admin && (
            <section className="bg-blue-600 px-5 py-2 flex gap-3 justify-center items-center mb-4">
              {admin
                .match(
                  /"fullName":"(.*?)"|\"email\":\"(.*?)\"|\"examPreference\":\"(.*?)\"|\"role\":\"(.*?)\"/g
                )
                .map((field) => {
                  const [key, value] = field.replace(/"/g, "").split(":");
                  return (
                    <div key={key} className="mb-2">
                      <strong className="text-yellow-400 text-xl">
                        {key}:
                      </strong>{" "}
                      <span className="text-white text-lg">{value}</span>
                    </div>
                  );
                })}
            </section>
          )}
          {uploadedTestButtonPanel && (
            <section className="flex justify-center gap-4">
              <button
                className="bg-green-500 cursor-pointer px-3 py-2 rounded-lg text-xl"
                onClick={handleUploadedTests}
              >
                Uploaded Tests
              </button>
            </section>
          )}
          {uploadedTests.length > 0 && (
            <main className="p-6 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
              <section className="grid gap-6">
                {uploadedTests.map((uploadedTest) => {
                  return (
                    <div
                      key={uploadedTest.testName}
                      className="bg-blue-800 bg-opacity-10 backdrop-blur-lg rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      {/* Test Name and Graph */}
                      <div className="space-y-4">
                        <h1 className="text-3xl font-bold text-yellow-400 mb-4">
                          {uploadedTest.testName}
                        </h1>
                      </div>

                      {/* Toggle Button */}
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-4 px-4 py-2 cursor-pointer bg-yellow-400 text-black rounded-lg font-semibold w-full"
                      >
                        {isExpanded ? "Hide Details" : "Show Details"}
                      </button>

                      {/* Collapsible Section */}
                      {isExpanded && (
                        <div className="mt-6 space-y-4 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-xl">
                          <div className=" gap-6">
                            <div className="space-y-4">
                              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-700/50">
                                <span className="text-blue-400 font-medium">
                                  Total Questions:
                                </span>
                                <span className="text-white font-semibold">
                                  {uploadedTest.totalQuestionsCount}
                                </span>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-700/50">
                                <span className="text-blue-400 font-medium">
                                  Instructor:
                                </span>
                                <span className="text-white font-semibold">
                                  {uploadedTest.instructorName}
                                </span>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-700/50">
                                <span className="text-blue-400 font-medium">
                                  Exam Type:
                                </span>
                                <span className="text-white font-semibold">
                                  {uploadedTest.examType}
                                </span>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-700/50">
                                <span className="text-blue-400 font-medium">
                                  Duration:
                                </span>
                                <span className="text-white font-semibold">
                                  3 hours
                                </span>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-700/50">
                                <span className="text-blue-400 font-medium">
                                  Start Time:
                                </span>
                                <span className="text-white font-semibold">
                                  {uploadedTest.startTime}
                                </span>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-700/50">
                                <span className="text-blue-400 font-medium">
                                  Date:
                                </span>
                                <span className="text-white font-semibold">
                                  {uploadedTest.testDate}
                                </span>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-700/50">
                                <span className="text-blue-400 font-medium">
                                  likesCount:
                                </span>
                                <span className="text-white font-semibold">
                                  {uploadedTest.likesCount}
                                </span>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-700/50">
                                <span className="text-blue-400 font-medium">
                                  Feedbacks:
                                </span>
                                <span className="text-white font-semibold">
                                  {uploadedTest.feedback &&
                                  uploadedTest.feedback.length > 0
                                    ? uploadedTest.feedback.join(", ")
                                    : "No Feedback"}
                                </span>
                              </div>

                              <div className="flex flex-col space-y-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-700/50">
                                <span className="text-blue-400 font-medium">
                                  Result:
                                </span>
                                {uploadedTest.result &&
                                uploadedTest.result.length > 0 ? (
                                  uploadedTest.result.map((res, index) => (
                                    <div
                                      key={res._id || index}
                                      className="text-white font-semibold flex flex-col space-y-2 p-3 bg-gray-700/30 rounded-lg"
                                    >
                                      <span className="text-gray-200">
                                        Email: {res.email}
                                      </span>
                                      <span className="text-green-400">
                                        Correct Answers:{" "}
                                        {res.correctAnswersCount}
                                      </span>
                                      <span className="text-red-400">
                                        Wrong Answers: {res.wrongAnswersCount}
                                      </span>
                                      <span className="text-gray-200">
                                        Marks: {res.marks}
                                      </span>
                                      <span>
                                        Status:{" "}
                                        {res.isPassed ? (
                                          <span className="text-green-400 font-bold">
                                            Passed
                                          </span>
                                        ) : (
                                          <span className="text-red-400 font-bold">
                                            Failed
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-white font-semibold">
                                    No Result found
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            </main>
          )}
        </main>
      ) : (
        <main className="container mx-auto px-6 md:px-12 py-24">
          {/* Hero Section */}
          <section className="text-center mb-24">
            <h1 className="text-5xl md:text-6xl font-extrabold text-yellow-500 mb-6">
              Your Gateway to JEE/NEET Success 🚀
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              CrackItHub provides an advanced platform for students and
              educators to seamlessly manage JEE/NEET preparation with
              efficiency, real-time insights, and expert guidance.
            </p>
            <button
              onClick={() => {
                if (admin) {
                  alert("You are already Signed In...");
                } else {
                  setIsLoginPanelOpen(true);
                }
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer font-bold py-3 px-6 rounded-lg text-lg"
            >
              Get Started Now
            </button>
          </section>

          {/* Statistics Section */}
          <section className="py-12 bg-gray-900 rounded-lg text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-6">
              Why Choose CrackItHub?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-300">
              <div>
                <h4 className="text-4xl font-bold text-yellow-500">500K+</h4>
                <p className="text-lg">Students Benefited</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-yellow-500">98%</h4>
                <p className="text-lg">Success Rate</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-yellow-500">10K+</h4>
                <p className="text-lg">Expert Educators</p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-16">
            <h3 className="text-4xl font-bold text-white mb-12 text-center">
              🌟 Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h4 className="text-2xl font-semibold text-yellow-500 mb-4">
                  For Students 🎓
                </h4>
                <ul className="text-gray-300 space-y-3">
                  <li>🔍 Realistic test environment for JEE/NEET.</li>
                  <li>📊 Detailed performance analysis to improve scores.</li>
                  <li>📅 Access to test history and upcoming schedules.</li>
                  <li>🎯 AI-based recommendation for weak areas.</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h4 className="text-2xl font-semibold text-yellow-500 mb-4">
                  For Educators 👨‍🏫
                </h4>
                <ul className="text-gray-300 space-y-3">
                  <li>📝 Seamless test creation and management.</li>
                  <li>📡 Real-time student performance tracking.</li>
                  <li>⚙️ Customizable test interface and settings.</li>
                  <li>🤝 Collaborate with other educators.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16 text-center" id="testimonials">
            <h3 className="text-4xl font-bold text-white mb-12">
              💬 What Our Users Say
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300">
                  "CrackItHub made my JEE prep so much easier! The detailed
                  analysis helped me identify my weak areas and improve
                  efficiently."
                </p>
                <h4 className="text-yellow-500 mt-4">— Ananya, JEE Aspirant</h4>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300">
                  "As an educator, I love how intuitive and structured the test
                  management system is. A must-have for NEET/JEE coaching!"
                </p>
                <h4 className="text-yellow-500 mt-4">— Dr. Rahul, Educator</h4>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300">
                  "The AI-based recommendations gave me a personalized study
                  plan, and my scores improved dramatically!"
                </p>
                <h4 className="text-yellow-500 mt-4">— Rohan, NEET Aspirant</h4>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16" id="faqs">
            <h3 className="text-4xl font-bold text-white mb-12 text-center">
              ❓ Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h4 className="text-2xl font-semibold text-yellow-500 mb-2">
                  Is CrackItHub free?
                </h4>
                <p className="text-gray-300">
                  Yes! Students can access practice tests and performance
                  analytics for free. We also offer premium features for
                  advanced insights.
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h4 className="text-2xl font-semibold text-yellow-500 mb-2">
                  How do I enroll?
                </h4>
                <p className="text-gray-300">
                  You can sign up directly on our website and start practicing
                  right away!
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h4 className="text-2xl font-semibold text-yellow-500 mb-2">
                  Can educators track student progress?
                </h4>
                <p className="text-gray-300">
                  Absolutely! Educators get real-time dashboards to monitor
                  student performance.
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h4 className="text-2xl font-semibold text-yellow-500 mb-2">
                  Do you provide NEET-specific content?
                </h4>
                <p className="text-gray-300">
                  Yes, we have tailored content and test modules specifically
                  for NEET aspirants.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center py-16">
            <h3 className="text-3xl font-bold text-white mb-6">
              🚀 Ready to Boost Your Scores?
            </h3>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of successful students and start your journey
              today!
            </p>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer font-bold py-3 px-6 rounded-lg text-lg"
              onClick={() => {
                if (admin) {
                  alert("You are already Signed In...");
                } else {
                  setIsSignupPanelOpen(true);
                }
              }}
            >
              Sign Up Now
            </button>
          </section>
        </main>
      )}

      <footer className="bg-gray-900 text-gray-300 py-12" id="footer">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Contact Info */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-extrabold text-yellow-500">
              CrackItHub
            </h2>
            <p className="mt-2 text-sm">Your gateway to JEE/NEET success.</p>
            <p className="mt-4">
              <strong>Email:</strong> support@crackithub.com
            </p>
            <p>
              <strong>Contact:</strong> +91 98765 43210
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-yellow-500">Quick Links</h3>
            <div className="mt-4 space-y-2 flex flex-col">
              <button
                className="hover:text-yellow-400 cursor-pointer"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Features
              </button>
              <button
                className="hover:text-yellow-400 cursor-pointer"
                onClick={() =>
                  document
                    .getElementById("faqs")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                FAQs
              </button>
              <button
                className="hover:text-yellow-400 cursor-pointer"
                onClick={() =>
                  document
                    .getElementById("testimonials")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Testimonials
              </button>
              <button
                className="hover:text-yellow-400 cursor-pointer"
                onClick={() =>
                  document
                    .getElementById("footer")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Newsletter & Social Media */}
          <div className="text-center md:text-right">
            <h3 className="text-xl font-bold text-yellow-500">Stay Updated</h3>
            <p className="mt-2 text-sm">
              Subscribe to our newsletter for updates.
            </p>
            <input
              type="email"
              placeholder="Enter your email"
              className="mt-3 px-4 py-2 w-full md:w-auto rounded-lg bg-gray-800 text-white"
            />
            <button className="mt-3 bg-yellow-500 px-4 py-2 rounded-lg text-gray-900 hover:bg-yellow-400">
              Subscribe
            </button>
            <div className="flex justify-center md:justify-end space-x-4 mt-4">
              <a href="#" className="hover:text-yellow-400 text-xl">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="hover:text-yellow-400 text-xl">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="hover:text-yellow-400 text-xl">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="hover:text-yellow-400 text-xl">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CrackItHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AdminPage;
