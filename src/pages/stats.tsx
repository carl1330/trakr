import { CircularProgress } from "@mui/material"
import { useSession } from "next-auth/react"
import { api } from "~/utils/api"
import { Navbar } from "."
import type { RouterOutputs } from "~/utils/api"
type HabitFull = RouterOutputs["habit"]["getHabits"][0]


export default function Stats() {
    const { data: stats, isLoading } = api.habit.getHabitCount.useQuery()
    const { data: sessionData} = useSession();
    const { data: habits, isLoading: habitsIsLoading} = api.habit.getHabits.useQuery();

    if (!sessionData || habitsIsLoading) return <CircularProgress />

    function getLongestStreak(habits: HabitFull[]) {
        let longestStreak = 0;
        habits.forEach((habit) => {
            if (habit.completedDates.length > longestStreak) {
                longestStreak = habit.completedDates.length;
            }
        })
        return longestStreak;
    }

    function getEarliestHabit(habits: HabitFull[]): String {
        let earliestHabit = new Date();
        habits.forEach((habit) => {
            if (new Date(habit.createdAt)< earliestHabit) {
                earliestHabit = habit.createdAt;
            }
        })
        return earliestHabit.toISOString().substring(0, 10);
    }


    return (
        <div className="flex flex-col justify-center">
            <Navbar />
            <div className="flex flex-col items-center">
                <h1 className="text-2xl">Statistics for {sessionData.user.name}</h1>
                <div className="flex flex-row gap-4 mt-4">
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl">Total habits</h2>
                        <p>{isLoading ? <CircularProgress /> : stats}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl">Longest streak</h2>
                        <p>{isLoading ? <CircularProgress /> : getLongestStreak(habits as HabitFull[])}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl">Started tracking</h2>
                        <p>{isLoading ? <CircularProgress /> : getEarliestHabit(habits as HabitFull[])}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}