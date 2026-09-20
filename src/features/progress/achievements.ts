/**
 * Achievements are derived from the learner's current counters rather than
 * stored, so there is no unlock table to keep in sync and no way for the two to
 * disagree. Pure and unit tested.
 */

export interface AchievementInput {
  lessonsCompleted: number;
  streak: number;
  wordsLearned: number;
  quizzesCompleted: number;
  speakingSessions: number;
  xp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  /** Progress toward the goal, 0-100. */
  percent: number;
}

interface Definition {
  id: string;
  title: string;
  description: string;
  goal: number;
  value: (input: AchievementInput) => number;
}

const DEFINITIONS: Definition[] = [
  {
    id: "first-lesson",
    title: "First Lesson",
    description: "Complete your first lesson",
    goal: 1,
    value: (i) => i.lessonsCompleted,
  },
  {
    id: "five-lessons",
    title: "Getting Serious",
    description: "Complete 5 lessons",
    goal: 5,
    value: (i) => i.lessonsCompleted,
  },
  {
    id: "seven-day-streak",
    title: "7 Day Streak",
    description: "Practise 7 days in a row",
    goal: 7,
    value: (i) => i.streak,
  },
  {
    id: "fifty-words",
    title: "50 Words Learned",
    description: "Get 50 words to the learned stage",
    goal: 50,
    value: (i) => i.wordsLearned,
  },
  {
    id: "first-quiz",
    title: "Quiz Taker",
    description: "Finish your first quiz",
    goal: 1,
    value: (i) => i.quizzesCompleted,
  },
  {
    id: "five-speaking",
    title: "Finding Your Voice",
    description: "Complete 5 speaking attempts",
    goal: 5,
    value: (i) => i.speakingSessions,
  },
  {
    id: "five-hundred-xp",
    title: "500 XP",
    description: "Earn 500 XP in total",
    goal: 500,
    value: (i) => i.xp,
  },
];

export function getAchievements(input: AchievementInput): Achievement[] {
  return DEFINITIONS.map(({ id, title, description, goal, value }) => {
    const current = Math.max(value(input), 0);
    return {
      id,
      title,
      description,
      earned: current >= goal,
      percent: Math.min(Math.round((current / goal) * 100), 100),
    };
  });
}
