import InterviewSession from "../models/interviewSession.model.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all COMPLETED interview sessions for the logged-in user.
    const completedSessions = await InterviewSession.find({
      user: userId,
      status: "completed",
    }).sort({ createdAt: "asc" });

    // If no completed interviews, send back a default empty state.
    if (completedSessions.length === 0) {
      return res.status(200).json({
        metrics: { interviewsTaken: 0, scoreAverage: 0, successRate: 0 },
        performanceData: [],
        progressData: [],
        scoreBreakdown: [],
      });
    }
    
    // 2. Aggregate the PRE-CALCULATED data. This is much more efficient.
    const interviewsTaken = completedSessions.length;
    const scoreAverage = Math.round(completedSessions.reduce((sum, s) => sum + s.overallScore, 0) / interviewsTaken);
    const successRate = Math.round((completedSessions.filter(s => s.overallScore >= 70).length / interviewsTaken) * 100);

    // 3. Performance by Job Role (using the final 'overallScore')
    const performanceByRole = completedSessions.reduce((acc, { jobRole, overallScore }) => {
      if (!acc[jobRole]) acc[jobRole] = { scores: [] };
      acc[jobRole].scores.push(overallScore);
      return acc;
    }, {});
    const performanceData = Object.keys(performanceByRole).map(role => ({
      domain: role,
      score: Math.round(performanceByRole[role].scores.reduce((a, b) => a + b, 0) / performanceByRole[role].scores.length),
    }));
    
    // 4. Progress Over Time (using the final 'overallScore')
    const progressByMonth = completedSessions.reduce((acc, { createdAt, overallScore }) => {
      const month = new Date(createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!acc[month]) acc[month] = { scores: [] };
      acc[month].scores.push(overallScore);
      return acc;
    }, {});
    const progressData = Object.keys(progressByMonth).map(month => ({
      month,
      avgScore: Math.round(progressByMonth[month].scores.reduce((a, b) => a + b, 0) / progressByMonth[month].scores.length),
    }));

    // 5. Average Score Breakdown (using the final component scores)
    const scoreBreakdown = [
        { subject: 'Fluency', score: Math.round(completedSessions.reduce((s, i) => s + i.finalFluencyScore, 0) / interviewsTaken) },
        { subject: 'Confidence', score: Math.round(completedSessions.reduce((s, i) => s + i.finalConfidenceScore, 0) / interviewsTaken) },
        { subject: 'Correctness', score: Math.round(completedSessions.reduce((s, i) => s + i.finalCorrectnessScore, 0) / interviewsTaken) },
        { subject: 'Body Language', score: Math.round(completedSessions.reduce((s, i) => s + i.finalBodyLanguageScore, 0) / interviewsTaken) }
    ];

    // 6. Send the final compiled data.
    res.status(200).json({
      metrics: {
        interviewsTaken,
        questionsAnswered: interviewsTaken * 5, // Placeholder
        scoreAverage,
        successRate,
      },
      performanceData,
      progressData,
      scoreBreakdown,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};