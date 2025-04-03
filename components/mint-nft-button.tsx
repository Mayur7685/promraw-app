"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MintNFTButtonProps {
  disabled?: boolean
  scores?: {
    creativity: number
    promptAdherence: number
    artisticQuality: number
    overall: number
    feedback?: string
  }
  prompt?: string
}

export default function MintNFTButton({ disabled = true, scores, prompt }: MintNFTButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [isMinting, setIsMinting] = useState(false)
  const [mintingComplete, setMintingComplete] = useState(false)
  const { toast } = useToast()

  const handleMint = async () => {
    if (!title.trim() || !scores || !prompt) {
      toast({
        title: "Error",
        description: "Please provide a title for your artwork and ensure it has been scored.",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)

    try {
      // Get the canvas drawing
      const canvas = document.querySelector("canvas")
      if (!canvas) {
        throw new Error("Canvas not found")
      }

      const imageData = canvas.toDataURL("image/png")

      // Create form data
      const formData = new FormData()
      formData.append("image", imageData)
      formData.append("title", title)
      formData.append("prompt", prompt)
      formData.append("score", scores.overall.toString())

      // Call the minting API
      const response = await fetch("/api/nft/mint", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to mint NFT")
      }

      const data = await response.json()

      setMintingComplete(true)

      toast({
        title: "NFT Minted Successfully!",
        description: `Your artwork "${title}" has been minted as an NFT.`,
      })

      // Reset after showing success
      setTimeout(() => {
        setMintingComplete(false)
        setIsOpen(false)
        setTitle("")
      }, 3000)
    } catch (error) {
      console.error("Error minting NFT:", error)
      toast({
        title: "Error",
        description: "Failed to mint NFT. Please try again later.",
        variant: "destructive",
      })
      setIsMinting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transform transition-transform hover:scale-105"
          disabled={disabled}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Mint NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mint your artwork as NFT</DialogTitle>
          <DialogDescription>Your artwork will be minted and added to your collection.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Artwork"
              className="col-span-3"
              disabled={isMinting || mintingComplete}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Preview</Label>
            <div className="col-span-3 border rounded-md h-32 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              Artwork Preview
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Details</Label>
            <div className="col-span-3 text-sm space-y-1">
              <p>
                <span className="font-medium">Prompt:</span> {prompt || "No prompt"}
              </p>
              <p>
                <span className="font-medium">Score:</span> {scores?.overall.toFixed(1) || "-"}/10
              </p>
              <p>
                <span className="font-medium">Creativity:</span> {scores?.creativity.toFixed(1) || "-"}/10
              </p>
              <p>
                <span className="font-medium">Prompt Adherence:</span> {scores?.promptAdherence.toFixed(1) || "-"}/10
              </p>
              <p>
                <span className="font-medium">Artistic Quality:</span> {scores?.artisticQuality.toFixed(1) || "-"}/10
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          {mintingComplete ? (
            <Button className="bg-green-600 hover:bg-green-700" disabled>
              ✓ Minted Successfully
            </Button>
          ) : (
            <Button onClick={handleMint} disabled={isMinting || !title.trim()}>
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                "Mint NFT"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

