import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  testName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  participants: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  duration: {
    type: Number,
    default: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
  },
  testDate: {
    type: Date,
    required: true,
  },
  questions: {
    type: [String],
    required: true,
  },
  totalQuestionsCount: {
    type: Number,
    enum: [90, 180],
  },
  answers: {
    type: [[String]],
    required: true,
  },
  options: {
    type: [[String]],
    required: true,
  },
  examType: {
    type: String,
    required: true,
    enum: ["JEE", "NEET"],
  },
  rules: {
    type: [String],
    default: [
      "1. Identity Verification: You must have a valid photo ID (e.g., Aadhar card, voter ID, or passport) and your admit card to enter the examination hall. You may be required to take a biometric scan for identification purposes.",

      "2. No Personal Belongings: Personal items like mobile phones, watches, calculators, bags, and wallets must not be brought into the exam hall. All personal items must be stored in the designated area before entering the examination hall.",

      "3. Examination Materials: You are only allowed to have a ballpoint pen (blue or black) for marking responses on the OMR sheet. You are not allowed to bring any rough sheets or notes to the examination center.",

      "4. Language and Medium: You can choose the language of the exam (English, Hindi, or other regional languages) at the time of registration.",

      "5. Question Paper Format: The JEE Mains exam consists of multiple-choice questions (MCQs) and numerical-based questions. You will be provided with a computer-based test (CBT) interface to select answers.",

      "6. Time Management: The total duration of the exam is typically 3 hours. You will not be allowed to leave the exam hall before the allotted time.",

      "7. Marking Scheme: Each correct answer will be awarded marks, and incorrect answers may result in a penalty in the form of negative marking. Questions not attempted will not receive any marks or penalty.",

      "8. Attempting Questions: You are free to navigate between questions, mark your answers, and review your responses. If you wish to change an answer, you can click on the new option.",

      "9. System Malfunction: If there is any technical issue, you should immediately alert the exam invigilators. In case of a system breakdown, the time lost will be compensated.",

      "10. Cheating and Malpractice: Any form of cheating, use of unfair means, or tampering with the exam system is strictly prohibited. If caught, your exam will be canceled, and you may be barred from future exams.",

      "11. Instructions for the Computer Interface: You will be instructed on how to use the computer interface for answering questions, navigating between sections, and submitting responses. Your test screen will display the number of questions attempted, remaining time, and your answer choices.",

      "12. Instructions for the OMR Sheet (for offline modes): If you are taking a pen-and-paper exam, instructions regarding how to fill in your OMR sheet will be provided. Ensure you use the correct method for marking your answers, as any misalignment can result in errors during evaluation.",

      "13. Exit Procedure: Once the exam is over, you must submit your answers and exit the hall in an orderly manner. You will not be allowed to carry any exam materials out of the examination center.",

      "Final Note: These rules are meant to ensure a fair examination environment. Any violation of these rules can lead to disqualification from the exam. Make sure to read all the instructions displayed on the screen carefully before starting the test.",
    ],
  },
  feedback: {
    type: [String],
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  result: [
    {
      email: String, // User's email
      marks: Number, // Marks the user scored
      isPassed: Boolean, // Whether the user passed the test or not
      correctAnswersCount: Number,
      wrongAnswersCount: Number,
    },
  ],
});

export const Test = mongoose.model("Test", testSchema);
