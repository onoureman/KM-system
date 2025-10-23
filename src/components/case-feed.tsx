import { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Heart, MessageCircle, Bookmark, Eye, Edit, MoreHorizontal, Send, Star } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadProgress?: number;
  isUploading?: boolean;
}

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  categoryColor: string;
  lastModified: string;
  views: number;
  isFavorite: boolean;
  author: string;
  authorAvatar: string;
  stars: number;
  keywords: string[];
  divisionId: string;
  departmentId: string;
  sectionId: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  comments: Comment[];
  attachments?: UploadedFile[];
  rootCause?: string;
  solution?: string;
  status?: 'draft' | 'pending_manager' | 'pending_director' | 'approved' | 'rejected';
  rejectionReason?: string;
}

interface CaseFeedProps {
  articles: Article[];
  onLike: (articleId: string) => void;
  onSave: (articleId: string) => void;
  onComment: (articleId: string, content: string) => void;
  onCommentLike: (articleId: string, commentId: string) => void;
  onEdit: (article: Article) => void;
  onView: (article: Article) => void;
  onToggleFavorite: (articleId: string) => void;
  onDelete: (articleId: string) => void;
  onViewProfile: (authorName: string) => void;
}

export function CaseFeed({
  articles,
  onLike,
  onSave,
  onComment,
  onCommentLike,
  onEdit,
  onView,
  onToggleFavorite,
  onDelete,
  onViewProfile
}: CaseFeedProps) {
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const handleCommentSubmit = (articleId: string) => {
    const content = newComments[articleId]?.trim();
    if (content) {
      onComment(articleId, content);
      setNewComments(prev => ({ ...prev, [articleId]: '' }));
    }
  };

  const toggleComments = (articleId: string) => {
    setShowComments(prev => ({ ...prev, [articleId]: !prev[articleId] }));
  };

  const formatContent = (content: string) => {
    // Show first 200 characters with option to expand
    if (content.length <= 200) return content;
    return content.substring(0, 200) + '...';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'text-yellow-500 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {articles.map((article) => (
        <Card key={article.id} className="w-full backdrop-blur-sm border-white/10 bg-card/80">
          {/* Header */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onViewProfile(article.author)}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={article.authorAvatar} alt={article.author} />
                    <AvatarFallback>
                      {article.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p 
                    className="font-medium cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onViewProfile(article.author)}
                  >
                    {article.author}
                  </p>
                  <p className="text-sm text-muted-foreground">{article.lastModified}</p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(article)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onView(article)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Full
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onToggleFavorite(article.id)}
                    className="text-yellow-600"
                  >
                    <Star className={`w-4 h-4 mr-2 ${article.isFavorite ? 'fill-current' : ''}`} />
                    {article.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Case Content */}
            <div className="mb-4">
              <h3 className="mb-2 cursor-pointer hover:text-primary" onClick={() => onView(article)}>
                {article.title}
              </h3>
              <div className="text-muted-foreground mb-3">
                <p>{formatContent(article.content)}</p>
                {article.content.length > 200 && (
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-primary mt-1"
                    onClick={() => onView(article)}
                  >
                    Read more
                  </Button>
                )}
              </div>
              
              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge 
                  variant="secondary" 
                  style={{ backgroundColor: article.categoryColor + '20', color: article.categoryColor }}
                >
                  {article.category}
                </Badge>
                {article.keywords.slice(0, 3).map((keyword) => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
                {article.keywords.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{article.keywords.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {renderStars(article.stars)}
                <span className="text-sm text-muted-foreground ml-2">
                  {article.stars}/5 stars
                </span>
              </div>

              {/* Root Cause and Solution (if available) */}
              {(article.rootCause || article.solution) && (
                <div className="bg-muted/40 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/5">
                  {article.rootCause && (
                    <div className="mb-2">
                      <span className="text-red-400 font-medium text-sm">Root Cause: </span>
                      <span className="text-sm text-foreground/90">{article.rootCause}</span>
                    </div>
                  )}
                  {article.solution && (
                    <div>
                      <span className="text-green-400 font-medium text-sm">Solution: </span>
                      <span className="text-sm text-foreground/90">{article.solution}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3 px-1">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.views}
                </span>
                <span>{article.likes} likes</span>
                <span>{article.comments.length} comments</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLike(article.id)}
                  className={`flex items-center gap-2 ${article.isLiked ? 'text-red-500' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${article.isLiked ? 'fill-current' : ''}`} />
                  <span>{article.likes}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(article.id)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{article.comments.length}</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSave(article.id)}
                className={`flex items-center gap-2 ${article.isSaved ? 'text-blue-600' : ''}`}
              >
                <Bookmark className={`w-4 h-4 ${article.isSaved ? 'fill-current' : ''}`} />
                Save
              </Button>
            </div>

            {/* Comments Section */}
            {showComments[article.id] && (
              <div className="mt-4 border-t pt-4">
                {/* Existing Comments */}
                <div className="space-y-3 mb-4">
                  {article.comments.length > 0 ? (
                    article.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.authorAvatar} alt={comment.author} />
                          <AvatarFallback className="text-xs">
                            {comment.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted/60 backdrop-blur-sm rounded-lg p-3 border border-white/5">
                            <p className="font-medium text-sm text-foreground">{comment.author}</p>
                            <p className="text-sm text-foreground/90 mt-1">{comment.content}</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onCommentLike(article.id, comment.id)}
                              className={`h-auto p-0 text-xs ${comment.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                            >
                              <Heart className={`w-3 h-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                              {comment.likes}
                            </Button>
                            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>

                {/* New Comment Input */}
                <div className="bg-muted/20 backdrop-blur-sm rounded-lg p-3 border border-white/5">
                  <div className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-primary/20">You</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Write a comment..."
                        value={newComments[article.id] || ''}
                        onChange={(e) => setNewComments(prev => ({ 
                          ...prev, 
                          [article.id]: e.target.value 
                        }))}
                        className="min-h-[60px] resize-none bg-input-background/60 border-white/10 focus:border-primary/50"
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleCommentSubmit(article.id)}
                          disabled={!newComments[article.id]?.trim()}
                          className="bg-primary/80 hover:bg-primary"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}