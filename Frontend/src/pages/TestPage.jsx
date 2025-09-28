import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";
import questionDetails from "../assets/question.png";
import { IoMdArrowRoundBack } from "react-icons/io";
const TestPage = () => {
  const { testName } = useParams(); // Get testName from URL
  const [testInfo, setTestInfo] = useState(null); // Initialize as null instead of an empty string
  const [question, setQuestion] = useState({
    question: "This is the sample question",
    options: ["option 1", "option 2", "option 3", "option 4"],
    index: -1,
  });
  const [selectedOptions, setSelectedOptions] = useState({});
  const [answers, setAnswers] = useState({});

  const handleOptionChange = (option, index) => {
    setSelectedOptions((prevSelectedOptions) => {
      const updatedOptions = { ...prevSelectedOptions };
      const isCheckbox = testInfo.answers[index]?.length > 1;

      if (!option) {
        delete updatedOptions[index]; // Remove if option is empty/null
      } else {
        if (isCheckbox) {
          // Handle checkbox (multiple selections allowed, but no duplicates)
          if (!updatedOptions[index]?.includes(option)) {
            updatedOptions[index] = [...(updatedOptions[index] || []), option];
          }
        } else {
          // Handle radio (only one selection allowed)
          updatedOptions[index] = [option];
        }
      }

      return updatedOptions;
    });
  };

  const handleAnswers = (answer, index) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = { ...prevAnswers };
      updatedAnswers[index] = (updatedAnswers[index] || []).concat(answer); // Flattened array
      return updatedAnswers;
    });
  };

  const [selectedForReview, setSelectedForReview] = useState([]);

  const [currentTime, setCurrentTime] = useState("");
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds
  const scrollRef = useRef(null);
  const [visitedQuestions, setVisitedQuestions] = useState([]);
  const [submitPanel, setSubmitPanel] = useState(false);
  const [feedback, setFeedback] = useState();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const handleBackButton = () => {
      window.history.pushState(null, "", window.location.href);
    };
    const disableKeys = (event) => {
      if (event.ctrlKey && ["r", "R"].includes(event.key)) event.preventDefault();
      if (event.keyCode === 123) event.preventDefault(); // Disable F12
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);
    document.addEventListener("keydown", disableKeys);
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleBackButton);
      document.removeEventListener("keydown", disableKeys);
      document.removeEventListener("contextmenu", (event) => event.preventDefault());
    };
  }, []);
  
  useEffect(() => {
    if (formatTime(timeLeft) === "00:00:00") {
      alert("Your test has been submitted automatically");
      submitHandler();
    }
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0) return; // Stop timer at 0

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const closePanel = () => {
    setSubmitPanel(false);
  };

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

  const clearAnswers = async (answer, index) => {
    console.log(index);
    if (answers.hasOwnProperty(index)) {
      delete answers[index];
    }
    if (selectedOptions.hasOwnProperty(index)) {
      delete selectedOptions[index];
    }
    const reviewedIndex = selectedForReview.indexOf(index);
    if (reviewedIndex !== -1) selectedForReview.splice(reviewedIndex, 1);
  };

  const handleSubmit = () => {
    setSubmitPanel(true);
  };

  const navigate = useNavigate();

  const submitHandler = async () => {
    const profile = localStorage.getItem("profile");
    const regex = /"email"\s*:\s*"([^"]+)"/;
    const email = profile.match(regex)[1];
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/tests/submit`,
        { testName, answers, feedback, isLiked, email }
      );
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  if (!testInfo) {
    return <div>Loading...</div>; // You can render a loading state while fetching the data
  }

  return (
    <div className="bg-gray-100 ">
      {submitPanel === false ? (
        <div className="container mx-auto bg-white min-h-screen h-full">
          {/* Header Section */}
          <header className="bg-blue-700 text-white p-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                JEE Mains Online Mock Test
              </h1>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-semibold text-yellow-300">
                    Test Name:
                  </span>{" "}
                  {testInfo.testName}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-yellow-300">
                    Instructor:
                  </span>{" "}
                  {testInfo.instructor.fullName}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-yellow-300">
                    Exam Shift:
                  </span>{" "}
                  {testInfo.startTime} {formatDate(testInfo.testDate)}
                </p>
              </div>
            </div>

            {/* Timer Section */}
            <div className="bg-red-600 rounded-lg px-4 py-2 text-center">
              <p className="text-sm font-bold">Remaining Time</p>
              <p className="text-2xl font-extrabold">{formatTime(timeLeft)}</p>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex h-full">
            {/* Question Area */}
            <div className="w-2/3 p-6  border-gray-200">
              <div
                className="mb-6 pb-4 border-b-2 h-[350px] overflow-y-auto border-gray-500 px-3"
                ref={scrollRef}
              >
                {!(question.index + 1) && (
                  <h2 className="text-2xl text-center font-extrabold text-black mb-4 pb-4 ">
                    Question Template
                  </h2>
                )}

                <h2 className="text-lg font-extrabold text-gray-800 mb-4 pb-4 border-b-2">
                  Question {question.index ? question.index + 1 : 1}:
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  {question.question}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 hover:bg-blue-50 transition-colors"
                    >
                      <label className="flex items-center cursor-pointer">
                        <input
                          type={
                            testInfo.answers[question.index]?.length > 1
                              ? "checkbox"
                              : "radio"
                          }
                          name={`option-${question.index}`} // Unique name for radio buttons
                          value={option}
                          checked={
                            testInfo.answers[question.index]?.length > 1
                              ? selectedOptions[question.index]?.includes(
                                  option
                                ) || false
                              : selectedOptions[question.index]?.[0] === option
                          }
                          onChange={(e) =>
                            handleOptionChange(option, question.index, e)
                          }
                          className="mr-3 h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {question.index + 1 ? (
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    className="bg-green-500 cursor-pointer text-white px-6 py-2 border-1  border-gray-400 hover:bg-green-600 transition"
                    onClick={() => {
                      if (selectedOptions[question.index]) {
                        handleAnswers(
                          selectedOptions[question.index],
                          question.index
                        );
                        if (question.index + 1 !== 90) {
                          setQuestion({
                            question: testInfo.questions[question.index + 1],
                            options: testInfo.options[question.index + 1],
                            index: question.index + 1,
                          });
                        }
                        setVisitedQuestions((prev) => [
                          ...new Set([...prev, question.index + 1]),
                        ]);
                      } else {
                        alert("First select any option to save the answer");
                      }
                    }}
                  >
                    SAVE & NEXT
                  </button>
                  <button
                    className="bg-gray-300 cursor-pointer  text-black px-6 py-2 border-1 border-gray-400 hover:bg-gray-400 transition"
                    onClick={() => {
                      if (selectedOptions[question.index]) {
                        clearAnswers(answers[question.index], question.index);
                      } else {
                        alert("First select any option to clear the answer");
                      }
                    }}
                  >
                    CLEAR
                  </button>
                  <button
                    className="bg-yellow-500 cursor-pointer text-white px-6 py-2 border-1  border-gray-400 hover:bg-yellow-600 transition"
                    onClick={() => {
                      if (selectedOptions[question.index]) {
                        setSelectedForReview((prev) => [
                          ...new Set([...prev, question.index]),
                        ]);
                        handleAnswers(
                          selectedOptions[question.index],
                          question.index
                        );
                        if (question.index + 1 !== 90) {
                          setQuestion({
                            question: testInfo.questions[question.index + 1],
                            options: testInfo.options[question.index + 1],
                            index: question.index + 1,
                          });
                        }
                        setVisitedQuestions((prev) => [
                          ...new Set([...prev, question.index + 1]),
                        ]);
                      } else {
                        alert("First select any option to save the answer");
                      }
                    }}
                  >
                    SAVE & MARK FOR REVIEW
                  </button>
                  <button
                    className="bg-blue-500 cursor-pointer text-white px-6 py-2 border-1  border-gray-400 hover:bg-blue-600 transition"
                    onClick={() => {
                      if (selectedOptions[question.index]) {
                        setSelectedForReview((prev) => [
                          ...new Set([...prev, question.index]),
                        ]);
                        if (question.index + 1 !== 6) {
                          setQuestion({
                            question: testInfo.questions[question.index + 1],
                            options: testInfo.options[question.index + 1],
                            index: question.index + 1,
                          });
                        }
                        setVisitedQuestions((prev) => [
                          ...new Set([...prev, question.index + 1]),
                        ]);
                      } else {
                        alert("First select any option to save the answer");
                      }
                    }}
                  >
                    MARK FOR REVIEW & NEXT
                  </button>
                </div>
              ) : (
                <div className="flex justify-center space-x-4 mt-6">
                  <button className="bg-green-500 disabled: opacity-30 text-white px-6 py-2 border-1  border-gray-400 hover:bg-green-600 transition">
                    SAVE & NEXT
                  </button>
                  <button className="bg-gray-300 disabled: opacity-30 disabled:  text-black px-6 py-2 border-1 border-gray-400 hover:bg-gray-400 transition">
                    CLEAR
                  </button>
                  <button className="bg-yellow-500 disabled: opacity-30 text-white px-6 py-2 border-1  border-gray-400 hover:bg-yellow-600 transition">
                    SAVE & MARK FOR REVIEW
                  </button>
                  <button className="bg-blue-500 disabled: opacity-30 text-white px-6 py-2 border-1  border-gray-400 hover:bg-blue-600 transition">
                    MARK FOR REVIEW & NEXT
                  </button>
                </div>
              )}

              {question.index + 1 ? (
                <div className="flex justify-between space-x-4 border-t-2 border-gray-400 bg-gray-200 p-5 mt-6">
                  <div>
                    {question.index + 1 === 1 ? (
                      <button className="bg-gray-100 disabled: border-black border-1 opacity-30 text-black px-6 py-2 transition">
                        <span>{"<<"} BACK</span>
                      </button>
                    ) : (
                      <button
                        className="bg-gray-100 cursor-pointer border-black border-1 text-black px-6 py-2 transition"
                        onClick={() => {
                          setQuestion({
                            question: testInfo.questions[question.index - 1],
                            options: testInfo.options[question.index - 1],
                            index: question.index - 1,
                          });
                          setVisitedQuestions((prev) => [
                            ...new Set([...prev, question.index - 1]),
                          ]);
                        }}
                      >
                        <span>{"<<"} BACK</span>
                      </button>
                    )}
                    {question.index + 1 === 90 ? (
                      <button className="bg-gray-100 disabled: opacity-30 border-black border-1 text-black px-6 py-2 transition">
                        <span>NEXT {">>"}</span>
                      </button>
                    ) : (
                      <button
                        className="bg-gray-100 cursor-pointer border-black border-1 text-black px-6 py-2 transition"
                        onClick={() => {
                          setQuestion({
                            question: testInfo.questions[question.index + 1],
                            options: testInfo.options[question.index + 1],
                            index: question.index + 1,
                          });
                          setVisitedQuestions((prev) => [
                            ...new Set([...prev, question.index + 1]),
                          ]);
                        }}
                      >
                        <span>NEXT {">>"}</span>
                      </button>
                    )}
                  </div>

                  <button
                    className="bg-green-500 border-1 cursor-pointer border-gray-400 text-white px-6 py-1 hover:bg-green-600 transition"
                    onClick={handleSubmit}
                  >
                    SUBMIT
                  </button>
                </div>
              ) : (
                <div className="flex justify-between disabled: opacity-30 space-x-4 border-t-2 border-gray-400 bg-gray-200 p-5 mt-6">
                  <div>
                    {question.index + 1 === 1 ? (
                      <button
                        className="bg-gray-100 disabled: border-black border-1 opacity-30 text-black px-6 py-2 transition"
                        onClick={() =>
                          handleAnswers(selectedOptions, question.index)
                        }
                      >
                        <span>{"<<"} BACK</span>
                      </button>
                    ) : (
                      <button
                        className="bg-gray-100 cursor-pointer border-black border-1 text-black px-6 py-2 transition"
                        onClick={() =>
                          handleAnswers(selectedOptions, question.index)
                        }
                      >
                        <span>{"<<"} BACK</span>
                      </button>
                    )}
                    {question.index + 1 === 90 ? (
                      <button
                        className="bg-gray-100 disabled: opacity-30 border-black border-1 text-black px-6 py-2 transition"
                        onClick={() =>
                          clearAnswers(selectedOptions, question.index)
                        }
                      >
                        <span>NEXT {">>"}</span>
                      </button>
                    ) : (
                      <button
                        className="bg-gray-100 cursor-pointer border-black border-1 text-black px-6 py-2 transition"
                        onClick={() =>
                          clearAnswers(selectedOptions, question.index)
                        }
                      >
                        <span>NEXT {">>"}</span>
                      </button>
                    )}
                  </div>

                  <button className="bg-green-500 border-1 cursor-pointer border-gray-400 text-white px-6 py-1 hover:bg-green-600 transition">
                    SUBMIT
                  </button>
                </div>
              )}
            </div>

            {/* Question Navigation & Details */}
            <div className="w-1/3 p-6">
              {/* Question Details Image */}
              <div className="mb-6">
                <img
                  src={questionDetails}
                  alt="Question Details"
                  className="w-full rounded-lg shadow-md"
                />
              </div>

              {/* Question Navigation Grid */}
              <div className="mt-13">
                <div className="h-[150px] overflow-y-auto">
                  <div
                    className="grid grid-cols-7 gap-1 py-2 px-15"
                    ref={scrollRef}
                  >
                    {testInfo.questions.map((q, index) => {
                      const isVisited = visitedQuestions.includes(index);
                      const isAnswered =
                        answers[index] !== undefined && answers[index] !== null;
                      const isSelctedForReview =
                        selectedForReview.includes(index);

                      let bgColor =
                        "bg-gray-300 text-gray-700 border-2 border-gray-400"; // Default gray for not visited
                      if (isVisited) {
                        if (isAnswered && isSelctedForReview) {
                          bgColor =
                            "bg-gradient-to-b from-white via-violet-900 text-white to-violet-500 relative after:content-[''] after:absolute after:w-3 after:h-3 after:bg-green-500 after:rounded-full after:bottom-0.5 after:right-0.5"; // Purple background with bottom-right green dot
                        } else if (isAnswered) {
                          bgColor = "bg-green-500 text-white"; // Green background only if answered
                        } else if (isSelctedForReview) {
                          bgColor =
                            "bg-gradient-to-b from-white via-violet-900 to-violet-500 text-white";
                        } else {
                          bgColor = "bg-red-500 text-white"; // Red background if neither answered nor reviewed
                        }
                      }

                      return (
                        <button
                          key={index}
                          className={`w-10 h-10 cursor-pointer border-1 border-gray-300 rounded-lg ${bgColor}`}
                          onClick={() => {
                            setVisitedQuestions((prev) => [
                              ...new Set([...prev, index]),
                            ]); // Mark as visited
                            setQuestion({
                              question: testInfo.questions[index],
                              options: testInfo.options[index],
                              index: index,
                            });
                          }}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-gray-800 shadow-lg w-full min-h-screen h-full mx-auto text-white">
          <button
            className="mb-4 bg-yellow-400 px-3 py-2 text-lg rounded-lg cursor-pointer"
            onClick={closePanel}
          >
            <span className="flex items-center">
              <IoMdArrowRoundBack className="text-xl mr-2" />
              Go Back
            </span>
          </button>
          <h2 className="text-2xl font-semibold mb-4">Submission Panel</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-lg shadow-md flex items-center">
              <span className="text-xl font-bold mr-3">
                Questions Attempted:
              </span>
              <span className="text-2xl">
                {Object.keys(answers).length ? Object.keys(answers).length : 0}
              </span>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-lg shadow-md flex items-center">
              <span className="text-xl font-bold mr-3">Marked for Review:</span>
              <span className="text-2xl">{selectedForReview.length}</span>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-lg shadow-md flex items-center">
              <span className="text-xl font-bold mr-3">Remaining Time:</span>
              <span className="text-2xl">{formatTime(timeLeft)}</span>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-lg shadow-md flex items-center">
              <span className="text-xl font-bold mr-3">Total Questions:</span>
              <span className="text-2xl">{testInfo.totalQuestionsCount}</span>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-lg shadow-md flex items-center">
              <span className="text-xl font-bold mr-3">Questions Left:</span>
              <span className="text-2xl">
                {testInfo.totalQuestionsCount -
                  (Object.keys(answers).length
                    ? Object.keys(answers).length
                    : 0)}
              </span>
            </div>

            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 rounded-lg shadow-md flex items-center">
              <span className="text-xl font-bold mr-3">Status:</span>
              <span className="text-2xl">In Progress</span>
            </div>
          </div>

          {/* Instructor's note */}
          <div className="bg-gray-700 p-4 rounded-lg mt-8">
            <h3 className="text-xl font-semibold">Instructor&apos;s Note</h3>
            <p className="mt-2 text-lg">
              Thank you for completing this test! Your efforts are highly
              appreciated.
            </p>
          </div>

          {/* Feedback Section */}
          <div className="bg-gray-700 p-4 rounded-lg mt-8">
            <h3 className="text-xl font-semibold">Your Feedback</h3>
            <textarea
              className="mt-2 p-3 w-full rounded-lg outline-none text-white"
              rows="4"
              placeholder="Share your thoughts on this test..."
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
          </div>

          {/* Like Button */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              className="bg-blue-500 px-6 py-2 rounded-lg cursor-pointer text-white text-lg hover:bg-blue-600 transition"
              onClick={() => {
                alert("You liked this test!");
                setIsLiked(true);
              }}
            >
              👍 Like This Test
            </button>
            <button
              className={`${
                formatTime(timeLeft) === "00:00:00"
                  ? "px-6 py-2 disabled:bg-gray-500"
                  : "bg-green-500 px-6 py-2 rounded-lg cursor-pointer text-white text-lg hover:bg-green-600 transition"
              }`}
              disabled={formatTime(timeLeft) === "00:00:00"}
              onClick={() => {
                if (formatTime(timeLeft) !== "00:00:00") {
                  alert("Your test has been submitted");
                  submitHandler();
                }
              }}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;
