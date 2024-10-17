"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, MessageCircle, Share2, Trophy, Medal, Award } from "lucide-react"

// Mock data for community posts
const communityPosts = [
  {
    id: 1,
    user: { name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40" },
    content: "Just completed a 5K run in 25 minutes! Personal best!",
    likes: 24,
    comments: 5,
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    user: { name: "Sam Lee", avatar: "/placeholder.svg?height=40&width=40" },
    content: "Looking for workout buddies in the NYC area. Anyone interested?",
    likes: 13,
    comments: 8,
    timestamp: "5 hours ago",
  },
  {
    id: 3,
    user: { name: "Emily Chen", avatar: "/placeholder.svg?height=40&width=40" },
    content: "Check out my progress pics after 3 months of consistent training!",
    likes: 56,
    comments: 12,
    timestamp: "1 day ago",
  },
]

// Mock data for leaderboards
const leaderboardData = {
  workoutStreak: [
    { rank: 1, user: "Maria G.", score: 45 },
    { rank: 2, user: "John D.", score: 42 },
    { rank: 3, user: "Sarah L.", score: 38 },
    { rank: 4, user: "Mike R.", score: 35 },
    { rank: 5, user: "Lisa K.", score: 33 },
  ],
  weightLoss: [
    { rank: 1, user: "Tom H.", score: 12.5 },
    { rank: 2, user: "Anna M.", score: 10.2 },
    { rank: 3, user: "Chris P.", score: 9.7 },
    { rank: 4, user: "Emma S.", score: 8.9 },
    { rank: 5, user: "David W.", score: 8.3 },
  ],
  strengthGain: [
    { rank: 1, user: "Alex J.", score: 150 },
    { rank: 2, user: "Olivia R.", score: 145 },
    { rank: 3, user: "Nathan C.", score: 140 },
    { rank: 4, user: "Sophie L.", score: 135 },
    { rank: 5, user: "Ryan M.", score: 130 },
  ],
}

export function CommunityLeaderboardsComponent() {
  const [newPost, setNewPost] = useState("")

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the post to a backend
    console.log("New post:", newPost)
    setNewPost("")
  }

  const handleLike = (postId: number) => {
    // In a real app, this would update the like count in the backend
    console.log("Liked post:", postId)
  }

  const handleComment = (postId: number) => {
    // In a real app, this would open a comment modal or navigate to a comment page
    console.log("Commenting on post:", postId)
  }

  const handleShare = (postId: number) => {
    // In a real app, this would open a share dialog
    console.log("Sharing post:", postId)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Community & Leaderboards</h1>

      <Card>
        <CardHeader>
          <CardTitle>Share Your Progress</CardTitle>
          <CardDescription>Inspire and connect with others in the community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePostSubmit}>
            <Textarea
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="mb-2"
            />
            <Button type="submit">Post</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Community Feed</h2>
          {communityPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={post.user.avatar} alt={post.user.name} />
                    <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{post.user.name}</CardTitle>
                    <CardDescription>{post.timestamp}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleComment(post.id)}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleShare(post.id)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Leaderboards</h2>
          <Tabs defaultValue="workoutStreak">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workoutStreak">Workout Streak</TabsTrigger>
              <TabsTrigger value="weightLoss">Weight Loss</TabsTrigger>
              <TabsTrigger value="strengthGain">Strength Gain</TabsTrigger>
            </TabsList>
            {Object.entries(leaderboardData).map(([category, data]) => (
              <TabsContent key={category} value={category}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {category === "workoutStreak" && <Trophy className="mr-2 h-5 w-5" />}
                      {category === "weightLoss" && <Award className="mr-2 h-5 w-5" />}
                      {category === "strengthGain" && <Medal className="mr-2 h-5 w-5" />}
                      {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                    <CardDescription>
                      {category === "workoutStreak" && "Consecutive days of working out"}
                      {category === "weightLoss" && "Total weight lost (kg)"}
                      {category === "strengthGain" && "Increase in total weight lifted (kg)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.map((item, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <span className="flex items-center">
                            <span className="font-semibold mr-2">#{item.rank}</span>
                            {item.user}
                          </span>
                          <span className="font-bold">{item.score}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}