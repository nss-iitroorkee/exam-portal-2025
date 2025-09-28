import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
import { Test } from "../models/test.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create upload directory if it doesn't exist
const uploadDir = "../public/temp";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

const processCSV = async (req, res) => {
  const { testName, testDate, instructor, examType, testTime } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json(new ApiError(400, "No file uploaded"));
    }

    // Set max questions based on examType
    let maxQuestions;
    if (examType === "JEE") {
      maxQuestions = 90;
    } else if (examType === "NEET") {
      maxQuestions = 180;
    } else {
      return res.status(400).json(new ApiError(400, "Invalid exam type"));
    }

    const questions = [];
    const options = [];
    const answers = [];

    await new Promise((resolve, reject) => {
      let count = 0; // Track the number of valid questions processed

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
          // Stop processing after maxQuestions limit
          if (count >= maxQuestions) return;

          // Validate row fields
          if (
            !row.question?.trim() ||
            !row.option1?.trim() ||
            !row.option2?.trim() ||
            !row.option3?.trim() ||
            !row.option4?.trim() ||
            !row.correctAnswer?.trim()
          ) {
            console.log("Skipping invalid row:", row);
            return;
          }

          questions.push(row.question);
          options.push([row.option1, row.option2, row.option3, row.option4]);
          answers.push(row.correctAnswer);
          count++;
        })
        .on("end", () => {
          // Ensure exactly maxQuestions are provided
          if (count !== maxQuestions) {
            reject(
              new Error(`Expected ${maxQuestions} questions, but got ${count}`)
            );
            return;
          }

          resolve();
        })
        .on("error", (err) => {
          console.error("CSV Read Error:", err);
          reject(err);
        });
    });

    const formattedAnswers = answers.map((answer) =>
      answer.includes(",") ? answer.split(",") : [answer]
    );

    const Instructor = await Admin.findById(instructor);
    if (!Instructor) {
      return res
        .status(404)
        .json(new ApiError(404, "Instructor does not exist"));
    }

    const instId = Instructor?._id;

    // Create new test after CSV processing is complete
    const newTest = await Test.create({
      instructor: instId,
      testName,
      testDate,
      totalQuestionsCount: questions.length,
      questions: questions,
      options: options,
      answers: formattedAnswers,
      startTime: testTime,
      examType,
    });

    // Delete the uploaded file after processing
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Test uploaded successfully!", newTest));
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res
      .status(500)
      .json(new ApiError(500, error.message || "Error processing CSV file"));
  }
};

const getAllTests = asyncHandler(async (req, res) => {
  try {
    const tests = await Test.find();
    const testsWithInstructor = await Promise.all(
      tests.map(async (test) => {
        const instructor = await Admin.findById(test.instructor);
        return {
          ...test.toObject(),
          instructorName: instructor ? instructor.fullName : "Unknown",
        };
      })
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "All Testcases", testsWithInstructor));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while fetching tests"));
  }
});

const search = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.name; // Get the 'name' query parameter
    if (!keyword || keyword.trim() === "") {
      return res.status(400).json(new ApiResponse(400, "Keyword is required"));
    }

    const tests = await Test.find({
      $or: [
        { testName: { $regex: keyword, $options: "i" } }, // Case-insensitive match
      ],
    }).populate("instructor", "fullName"); // This will populate the 'name' field of the instructor

    return res.status(200).json(new ApiResponse(200, "Tests found", tests));
  } catch (error) {
    console.error("Error searching tests:", error);
    throw new ApiError(500, "An error occurred while searching tests");
  }
});

const getTestInfo = asyncHandler(async (req, res) => {
  try {
    const { testName } = req.query;

    if (!testName) {
      return res.status(400).json(new ApiError(400, "Test Name is required"));
    }

    // ✅ Corrected findOne query
    const test = await Test.findOne({ testName: testName }).populate(
      "instructor",
      "fullName"
    );
    if (!test) {
      return res.status(404).json(new ApiError(404, "Test not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Test details fetched successfully", test));
  } catch (error) {
    console.error("Error fetching test info:", error);
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
});

const submitTest = asyncHandler(async (req, res) => {
  const { testName, answers, feedback, isLiked, email } = req.body;

  try {
    const test = await Test.findOne({ testName: testName });
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const correctAnswers = test.answers;
    let marks = 0;

    let correctAnswersCount = 0;
    let wrongAnswersCount = 0;

    Object.entries(answers).forEach(([key, studentAnswer]) => {
      const index = parseInt(key, 10);
      if (correctAnswers.hasOwnProperty(index)) {
        const normalizeAndSort = (answer) => {
          return String(answer)
            .trim()
            .toLowerCase()
            .split(",")
            .map((item) => item.trim()) // Remove extra spaces
            .sort() // Sort alphabetically to make order irrelevant
            .join(",");
        };

        const normalizedStudentAnswer = normalizeAndSort(studentAnswer);
        const normalizedCorrectAnswer = normalizeAndSort(correctAnswers[index]);

        if (normalizedStudentAnswer === normalizedCorrectAnswer) {
          correctAnswersCount++;
          marks += 4;
        } else {
          wrongAnswersCount++;
          marks -= 1;
        }
      }
    });

    const user = await User.findOneAndUpdate(
      { email: email },
      { $addToSet: { testsAttempted: { testId: test._id, answers: answers } } },
      { new: true }
    ).select("-refreshToken"); // Select only required fields

    const attemptedTests = user.testsAttempted.map((test) => {
      return test;
    });
    const length = attemptedTests.length;
    const idTest = user.testsAttempted[length - 1].testId;

    const updateTest = await Test.findOneAndUpdate(
      {
        _id: idTest,
      },
      {
        $push: {
          result: {
            email: user.email,
            marks: marks,
            isPassed: marks >= 10,
            correctAnswersCount: correctAnswersCount,
            wrongAnswersCount: wrongAnswersCount,
          },
          feedback: feedback ? feedback : "",
        },
        $inc: { likesCount: isLiked ? 1 : 0 },
      },
      { new: true }
    );

    // If no existing result found, add a new one
    if (!updateTest) {
      return res
        .status(402)
        .json(new ApiError(402, "Error while updating test details"));
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Test updated successfully", updateTest));
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export { upload, processCSV, getAllTests, search, getTestInfo, submitTest };
