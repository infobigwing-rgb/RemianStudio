"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Comment, User } from "@/lib/types/collaboration"
import { MessageSquare, Check, Send } from "lucide-react"

interface CommentsPanelProps {
  comments: Comment[]
  currentUser: User
  onAddComment: (content: string, timelinePosition: number, layerId?: string) => void
  onResolveComment: (commentId: string) => void
  onReplyComment: (commentId: string, content: string) => void
}

export function CommentsPanel({
  comments,
  currentUser,
  onAddComment,
  onResolveComment,
  onReplyComment,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment, 0)
      setNewComment("")
    }
  }

  const handleReply = (commentId: string) => {
    if (replyContent.trim()) {
      onReplyComment(commentId, replyContent)
      setReplyContent("")
      setReplyingTo(null)
    }
  }

  const unresolvedComments = comments.filter((c) => !c.resolved)
  const resolvedComments = comments.filter((c) => c.resolved)

  return (
    <div className="h-full flex flex-col bg-card border-l">
      <div className="h-12 border-b flex items-center px-4">
        <MessageSquare className="size-4 mr-2" />
        <h2 className="text-sm font-semibold">Comments</h2>
        <Badge variant="secondary" className="ml-auto">
          {unresolvedComments.length}
        </Badge>
      </div>

      <div className="p-4 border-b">
        <div className="flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          />
          <Button size="icon" onClick={handleAddComment}>
            <Send className="size-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {unresolvedComments.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No comments yet</div>
          ) : (
            <>
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-3">ACTIVE</h3>
                <div className="space-y-3">
                  {unresolvedComments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="p-3 space-y-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
                            <AvatarFallback style={{ backgroundColor: comment.user.color }}>
                              {comment.user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{comment.user.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {comment.createdAt.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>

                        {comment.replies.length > 0 && (
                          <div className="pl-11 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <Avatar className="size-6">
                                  <AvatarImage src={reply.user.avatar || "/placeholder.svg"} />
                                  <AvatarFallback style={{ backgroundColor: reply.user.color }}>
                                    {reply.user.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium">{reply.user.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {reply.createdAt.toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-xs">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {replyingTo === comment.id ? (
                            <div className="flex-1 flex gap-2">
                              <Input
                                size="sm"
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleReply(comment.id)}
                                autoFocus
                              />
                              <Button size="sm" onClick={() => handleReply(comment.id)}>
                                Reply
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(comment.id)}>
                                Reply
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => onResolveComment(comment.id)}>
                                <Check className="size-3 mr-1" />
                                Resolve
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {resolvedComments.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3">RESOLVED</h3>
                  <div className="space-y-2">
                    {resolvedComments.map((comment) => (
                      <Card key={comment.id} className="opacity-60">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="size-6">
                              <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{comment.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">{comment.user.name}</span>
                                <Check className="size-3 text-green-500" />
                              </div>
                              <p className="text-xs line-through">{comment.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
