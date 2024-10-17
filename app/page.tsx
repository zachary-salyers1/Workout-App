import { DashboardComponent } from "@/components/dashboard"
import { AppProvider } from "./context/AppContext"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Workout App Dashboard",
  description: "View your workout progress and daily tasks",
}

export default function Home() {
  return (
    <AppProvider>
      <DashboardComponent />
    </AppProvider>
  )
}
