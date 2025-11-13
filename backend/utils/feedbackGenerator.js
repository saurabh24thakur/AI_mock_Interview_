const generateFeedback = (scores) => {
  const { fluency, confidence, correctness, bodyLanguage } = scores;

  let feedback = "Here is a summary of your performance:\n\n";

  // Fluency Feedback
  if (fluency >= 80) {
    feedback += "Fluency: Excellent! Your speech was smooth and natural. Keep it up!\n";
  } else if (fluency >= 60) {
    feedback += "Fluency: Good. You communicated effectively, with only minor hesitations.\n";
  } else if (fluency >= 40) {
    feedback += "Fluency: Fair. You had some noticeable pauses and filler words. Try to practice speaking more to improve flow.\n";
  } else {
    feedback += "Fluency: Needs Improvement. Your speech was often hesitant and difficult to follow. Practice articulating your thoughts clearly.\n";
  }

  // Confidence Feedback
  if (confidence >= 80) {
    feedback += "Confidence: Very strong. You appeared self-assured and maintained good eye contact.\n";
  } else if (confidence >= 60) {
    feedback += "Confidence: Good. You generally appeared confident, but there were moments of uncertainty.\n";
  } else if (confidence >= 40) {
    feedback += "Confidence: Fair. You seemed a bit nervous, which affected your delivery. Try to maintain a more upright posture and steady gaze.\n";
  } else {
    feedback += "Confidence: Needs Improvement. You appeared quite nervous and avoided eye contact. Practice will help you feel more comfortable.\n";
  }

  // Correctness Feedback
  if (correctness >= 80) {
    feedback += "Correctness: Excellent. Your answers were accurate and well-structured.\n";
  } else if (correctness >= 60) {
    feedback += "Correctness: Good. Most of your answers were correct, with some minor inaccuracies.\n";
  } else if (correctness >= 40) {
    feedback += "Correctness: Fair. You struggled with some questions and provided some incorrect information. Review the key concepts for this role.\n";
  } else {
    feedback += "Correctness: Needs Improvement. Your answers were often incorrect or incomplete. A thorough review of the subject matter is recommended.\n";
  }

  // Body Language Feedback
  if (bodyLanguage >= 80) {
    feedback += "Body Language: Excellent. You used positive and engaging body language throughout the interview.\n";
  } else if (bodyLanguage >= 60) {
    feedback += "Body Language: Good. Your body language was generally positive, with a few minor issues.\n";
  } else if (bodyLanguage >= 40) {
    feedback += "Body Language: Fair. You appeared a bit stiff or fidgety at times. Try to relax and maintain an open posture.\n";
  } else {
    feedback += "Body Language: Needs Improvement. Your body language was distracting and suggested a lack of engagement. Be mindful of your posture and gestures.\n";
  }

  feedback += "\nOverall, a solid performance. Keep practicing to improve even further!";

  return feedback;
};

export default generateFeedback;
