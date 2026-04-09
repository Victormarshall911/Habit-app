// Original motivational quotes themed around habit-building, consistency, and personal growth.
// A new quote is shown each day based on the day of the year.

const MOTIVATIONAL_QUOTES = [
    // Consistency & Showing Up
    { text: "Small steps today build the path you'll walk tomorrow.", author: "HabitFlow" },
    { text: "Every streak started with day one. Today is yours.", author: "HabitFlow" },
    { text: "Progress isn't perfection — it's showing up.", author: "HabitFlow" },
    { text: "Consistency beats intensity, every single time.", author: "HabitFlow" },
    { text: "What you do daily matters more than what you do occasionally.", author: "HabitFlow" },
    { text: "The secret to getting ahead is getting started.", author: "HabitFlow" },
    { text: "Show up even when you don't feel like it. That's where growth lives.", author: "HabitFlow" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "HabitFlow" },

    // Identity & Becoming
    { text: "Your habits are votes for the person you're becoming.", author: "HabitFlow" },
    { text: "You don't have to be extreme. You just have to be consistent.", author: "HabitFlow" },
    { text: "Every action is a step toward or away from who you want to be.", author: "HabitFlow" },
    { text: "Build the habit. The results will follow.", author: "HabitFlow" },
    { text: "Who you are is the sum of what you repeat.", author: "HabitFlow" },
    { text: "Don't aim to be perfect. Aim to be better than yesterday.", author: "HabitFlow" },
    { text: "The person you admire built themselves one habit at a time.", author: "HabitFlow" },

    // Streaks & Momentum
    { text: "Don't break the chain. Your future self will thank you.", author: "HabitFlow" },
    { text: "A streak is proof that you can do hard things.", author: "HabitFlow" },
    { text: "Momentum is built one checkbox at a time.", author: "HabitFlow" },
    { text: "You didn't come this far to only come this far.", author: "HabitFlow" },
    { text: "Keep going. The compound effect is working even when you can't see it.", author: "HabitFlow" },
    { text: "Your streak doesn't define you, but protecting it strengthens you.", author: "HabitFlow" },

    // Growth & Compound Effect
    { text: "One percent better every day. That's all it takes.", author: "HabitFlow" },
    { text: "The best time to build a habit was yesterday. The next best time is now.", author: "HabitFlow" },
    { text: "Tiny changes, remarkable results — but only if you don't stop.", author: "HabitFlow" },
    { text: "You won't see the growth daily, but look back in a month and you'll be amazed.", author: "HabitFlow" },
    { text: "Success is the product of daily habits, not once-in-a-lifetime transformations.", author: "HabitFlow" },
    { text: "A river cuts through rock not by force, but by persistence.", author: "HabitFlow" },

    // Motivation & Mindset
    { text: "Motivation gets you started. Habits keep you going.", author: "HabitFlow" },
    { text: "You are one habit away from a completely different life.", author: "HabitFlow" },
    { text: "Fall in love with the process, and the results will come.", author: "HabitFlow" },
    { text: "Today's effort is tomorrow's reward.", author: "HabitFlow" },
    { text: "The only bad workout is the one that didn't happen.", author: "HabitFlow" },
    { text: "Done is better than perfect. Showing up is the win.", author: "HabitFlow" },
    { text: "Every master was once a beginner who refused to quit.", author: "HabitFlow" },
    { text: "Your comfort zone is a beautiful place, but nothing grows there.", author: "HabitFlow" },

    // Resilience & Recovery
    { text: "Missing one day doesn't erase your progress. Missing two makes it a pattern.", author: "HabitFlow" },
    { text: "Restart as many times as you need. Every restart is still progress.", author: "HabitFlow" },
    { text: "A bad day doesn't mean a bad habit. Get back on track tomorrow.", author: "HabitFlow" },
    { text: "Progress is not linear. Setbacks are just setups for comebacks.", author: "HabitFlow" },
    { text: "You haven't failed until you've stopped trying.", author: "HabitFlow" },
    { text: "Forgive the slip. Honor the commitment. Start again.", author: "HabitFlow" },
];

export interface Quote {
    text: string;
    author: string;
}

/**
 * Returns a quote for today based on the day of the year.
 * Cycles through all quotes, giving a new one each day.
 */
export function getDailyQuote(): Quote {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}

/**
 * Returns a random quote (useful for pull-to-refresh or shuffle features).
 */
export function getRandomQuote(): Quote {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

export default MOTIVATIONAL_QUOTES;
