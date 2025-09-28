import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";

const TestPanel = () => {
  const { testName } = useParams(); // Get testName from URL
  const [testInfo, setTestInfo] = useState(null); // Initialize as null instead of an empty string
  const [rules, setRules] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const navigate = useNavigate();

  // Function to convert milliseconds to hours
  const convertMillisecondsToHours = (milliseconds) => {
    const hours = (milliseconds / (1000 * 60 * 60)).toFixed(2);
    return `${hours} hours`;
  };

  // Current date formatted as YYYY-MM-DD
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  // Format date to display without time
  const formatDate = (dateString) => {
    return dateString?.split("T")[0];
  };

  // Fetch test data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/tests/getInfo`,
          {
            params: { testName },
          }
        );
        setTestInfo(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Function to get the current time
    const getCurrentTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };

    getCurrentTime();
    fetchData();
  }, [testName, currentTime]); // ✅ Re-run when testName changes

  const handleShowRules = () => {
    setRules(true);
  };

  if (!testInfo) {
    return <div>Loading...</div>; // You can render a loading state while fetching the data
  }

  return (
    <>
      {rules && (
        <div className="mt-6">
          <header className="h-20 bg-gray-300">
            <p className="text-blue-900 text-xl flex font-bold items-center pl-30 pt-7">
              GENERAL INSTRUCTIONS
            </p>
          </header>
          <div>
            <p className="text-center text-lg font-bold mt-3">
              Please Read the Instructions Carefully
            </p>
            <p className="font-semibold text-black text-lg underline pl-35">
              General Instructions:
            </p>
          </div>
          <div className="pl-40 pb-4">
            {testInfo.rules.map((rule, index) => (
              <div key={index} className="mb-2">
                <p className="text-md text-black">{rule}</p>
              </div>
            ))}
            <div className="flex justify-center">
              <button
                className="bg-green-500 px-3 py-2 cursor-pointer text-xl rounded-2xl text-white"
                onClick={() => navigate(`/testPage/${testName}`)}
              >
                Begin Test
              </button>
            </div>
          </div>
        </div>
      )}

      {!rules && (
        <div className="flex flex-col items-center bg-gradient-to-r from-yellow-400 to-yellow-600 min-h-screen w-full p-8">
          <h1 className="font-extrabold text-red-600 text-5xl mb-5 drop-shadow-lg">
            TEST PANEL
          </h1>
          <div className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl p-8 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4 border-b-2 pb-2">
              {testName}
            </h2>
            <div className="space-y-4 flex justify-between text-lg">
              <div>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Instructor:
                  </span>{" "}
                  {testInfo.instructor?.fullName || "N/A"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Duration:</span>{" "}
                  {convertMillisecondsToHours(testInfo.duration)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Test Starts At:
                  </span>{" "}
                  {testInfo.startTime}
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Date:</span>{" "}
                  {formatDate(testInfo.testDate)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Total Questions:
                  </span>{" "}
                  {testInfo.totalQuestionsCount}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Exam Type:
                  </span>{" "}
                  {testInfo.examType}
                </p>
              </div>
            </div>
            {currentTime === testInfo.startTime &&
            formattedDate === formatDate(testInfo.testDate) ? (
              <button
                className="bg-gradient-to-r cursor-pointer from-amber-400 to-amber-600 text-lg px-5 py-3 text-white rounded-xl mt-6 shadow-md hover:shadow-xl transition-transform transform hover:scale-105"
                onClick={handleShowRules}
              >
                Start Test
              </button>
            ) : (
              <button
                className="bg-gradient-to-r bg-gray-500 text-lg px-5 py-3 text-white rounded-xl mt-6 shadow-md hover:shadow-xl transition-transform transform hover:scale-105"
                disabled
              >
                Start Test
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TestPanel;
