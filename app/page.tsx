"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import DrawingCanvas from "@/components/drawing-canvas"
import DailyPrompt from "@/components/daily-prompt"
import MintNFTButton from "@/components/mint-nft-button"
import ScoreDisplay from "@/components/score-display"
import NFTCard from "@/components/nft-card"
import { Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [currentPrompt, setCurrentPrompt] = useState("Loading creative prompt...")
  const [promptGeneratedAt, setPromptGeneratedAt] = useState<string | null>(null)
  const [promptExpired, setPromptExpired] = useState(false)
  const [scores, setScores] = useState({
    creativity: 0,
    promptAdherence: 0,
    artisticQuality: 0,
    overall: 0,
    feedback: "",
    nftCard: {
      name: "",
      type: "Digital",
      hp: 100,
      moves: [
        { name: "", damage: 0 },
        { name: "", damage: 0 },
      ],
      description: "",
    },
  })
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [imageData, setImageData] = useState("")
  const { toast } = useToast()

  // Check for OpenAI API key on load
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/prompt")
        const data = await response.json()

        if (data.warning && data.warning.includes("API key not configured")) {
          toast({
            title: "API Key Missing",
            description:
              "No OPENAI_API_KEY found. Using default prompts. Add your key to .env.local for better prompts.",
            variant: "warning",
            duration: 10000,
          })
        }
      } catch (error) {
        console.log("Error checking API key:", error)
      }
    }

    checkApiKey()
  }, [])

  const handleScoreUpdate = (newScores: typeof scores) => {
    // Rename pokemonCard to nftCard if it exists
    const updatedScores = {
      ...newScores,
      nftCard: newScores.pokemonCard || newScores.nftCard,
    }

    // Remove pokemonCard property if it exists
    if ("pokemonCard" in updatedScores) {
      delete (updatedScores as any).pokemonCard
    }

    setScores(updatedScores)
    setHasSubmitted(true)
    setPromptExpired(true) // Mark the prompt as expired after submission

    // Get the canvas drawing for the NFT card
    const canvas = document.querySelector("canvas")
    if (canvas) {
      setImageData(canvas.toDataURL("image/png"))
    }
  }

  // Fetch the current prompt when it's updated in DailyPrompt
  const handlePromptUpdate = (prompt: string, refreshedAt?: string | any) => {
    setCurrentPrompt(prompt)
    if (refreshedAt) {
      if (typeof refreshedAt === "string") {
        setPromptGeneratedAt(refreshedAt)
      } else if (refreshedAt.refreshedAt) {
        setPromptGeneratedAt(refreshedAt.refreshedAt)
      }
    }

    // Only reset submission state if we're not already submitted
    if (!hasSubmitted) {
      // Clear the canvas
      const canvas = document.querySelector("canvas")
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }
    }

    setPromptExpired(false) // Reset the expired state
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl border-4 border-gray-300 dark:border-gray-700 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Promraw</h1>
              <p className="text-gray-600 dark:text-gray-300">AI prompts. Draw. Mint. Create.</p>
            </div>

            <div className="flex justify-center md:justify-end">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                onClick={() => window.open("https://github.com/yourusername/promraw", "_blank")}
              >
                <Sparkles className="h-4 w-4" />
                Star on GitHub
              </Button>
            </div>
          </div>
        </header>

        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-4 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <CardHeader className="bg-gray-200 dark:bg-gray-800">
                  <CardTitle className="text-black dark:text-white">Creative Challenge</CardTitle>
                  <CardDescription>Create your masterpiece based on the AI prompt</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <DailyPrompt onPromptUpdate={handlePromptUpdate} isExpired={promptExpired} />
                  <div className="mt-6">
                    <DrawingCanvas onScoreUpdate={handleScoreUpdate} prompt={currentPrompt} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end bg-gray-200 dark:bg-gray-800 p-4">
                  <MintNFTButton disabled={!hasSubmitted} scores={scores} prompt={currentPrompt} />
                </CardFooter>
              </Card>
            </div>

            <div>
              {hasSubmitted ? (
                <div className="space-y-6">
                  <ScoreDisplay scores={scores} />

                  {/* NFT Card */}
                  {scores.nftCard && scores.nftCard.name && (
                    <Card className="border-4 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                      <CardHeader className="pb-2 bg-gray-200 dark:bg-gray-800">
                        <CardTitle className="text-black dark:text-white">Your NFT Card</CardTitle>
                        <CardDescription>Click and drag to rotate, or tap to toggle auto-rotation</CardDescription>
                      </CardHeader>
                      <CardContent className="p-2">
                        <NFTCard
                          imageData={imageData}
                          cardData={scores.nftCard}
                          scores={{
                            creativity: scores.creativity,
                            promptAdherence: scores.promptAdherence,
                            artisticQuality: scores.artisticQuality,
                            overall: scores.overall,
                          }}
                          prompt={currentPrompt}
                          promptGeneratedAt={promptGeneratedAt || undefined}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="h-full border-4 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
                  <CardHeader className="bg-gray-200 dark:bg-gray-800">
                    <CardTitle className="text-black dark:text-white">Your Scores</CardTitle>
                    <CardDescription>Submit your drawing to get AI-generated scores</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300">Creativity</span>
                        <span className="font-semibold text-lg">-/10</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300">Prompt Adherence</span>
                        <span className="font-semibold text-lg">-/10</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300">Artistic Quality</span>
                        <span className="font-semibold text-lg">-/10</span>
                      </div>
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-lg">Overall Score</h4>
                        <div className="text-3xl font-bold text-gray-400">-</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

