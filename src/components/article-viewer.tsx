import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Edit, Star, Eye, Clock, User, Paperclip, Download, FileText, FileImage, FileArchive, File, Calendar, ThumbsUp, MessageCircle, Share2, Bookmark, Send, Heart } from 'lucide-react';

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
  likes?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  comments?: Comment[];
  attachments?: UploadedFile[];
  rootCause?: string;
  solution?: string;
  status?: 'draft' | 'pending_manager' | 'pending_director' | 'approved' | 'rejected';
  rejectionReason?: string;
}

interface ArticleViewerProps {
  article: Article;
  onBack: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onLike?: (articleId: string) => void;
  onSave?: (articleId: string) => void;
  onComment?: (articleId: string, content: string) => void;
  onCommentLike?: (articleId: string, commentId: string) => void;
}

export function ArticleViewer({ 
  article, 
  onBack, 
  onEdit, 
  onToggleFavorite,
  onLike,
  onSave,
  onComment,
  onCommentLike
}: ArticleViewerProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return FileImage;
    if (fileType.startsWith('text/') || fileType.includes('document')) return FileText;
    if (fileType.includes('zip') || fileType.includes('archive')) return FileArchive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileDownload = (file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const handleCommentSubmit = () => {
    const content = newComment.trim();
    if (content && onComment) {
      onComment(article.id, content);
      setNewComment('');
    }
  };

  const handleLikeClick = () => {
    if (onLike) {
      onLike(article.id);
    }
  };

  const handleSaveClick = () => {
    if (onSave) {
      onSave(article.id);
    }
  };

  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  const formatContent = (content: string) => {
    // Basic markdown-like formatting
    return content
      .split('\n')
      .map((paragraph, index) => {
        // Headers
        if (paragraph.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-semibold mt-8 mb-4 first:mt-0">{paragraph.substring(2)}</h1>;
        }
        if (paragraph.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold mt-6 mb-3 first:mt-0">{paragraph.substring(3)}</h2>;
        }
        if (paragraph.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 first:mt-0">{paragraph.substring(4)}</h3>;
        }
        
        // Code blocks
        if (paragraph.startsWith('```')) {
          return <div key={index} className="my-4 p-4 bg-muted/20 rounded-lg border border-white/5 font-mono text-sm overflow-x-auto">{paragraph.replace(/```/g, '')}</div>;
        }
        
        // Bullet points
        if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
          return <li key={index} className="ml-6 my-1 list-disc">{paragraph.substring(2)}</li>;
        }
        
        // Numbered lists
        if (/^\d+\.\s/.test(paragraph)) {
          return <li key={index} className="ml-6 my-1 list-decimal">{paragraph.replace(/^\d+\.\s/, '')}</li>;
        }
        
        // Empty lines
        if (paragraph.trim() === '') {
          return <br key={index} />;
        }
        
        // Regular paragraphs
        return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>;
      });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 border-b border-white/10 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Badge 
              variant="secondary"
              className="px-3 py-1"
              style={{ 
                backgroundColor: `${article.categoryColor}20`, 
                color: article.categoryColor,
                border: `1px solid ${article.categoryColor}40`
              }}
            >
              {article.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className="hover:bg-white/10"
            >
              <Star className={`w-4 h-4 ${article.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-white/10"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="bg-primary/10 border-primary/20 hover:bg-primary/20"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-6 leading-tight">{article.title}</h1>
            
            {/* Author and Meta Info */}
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarImage src={article.authorAvatar} alt={article.author} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {article.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{article.author}</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-12" />
              
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{article.lastModified}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{article.views} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`w-4 h-4 ${i < article.stars ? 'fill-current text-yellow-500' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm">({article.stars}/5)</span>
                </div>
              </div>
            </div>

            {/* Keywords */}
            {article.keywords && article.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline" className="text-xs bg-white/5 border-white/10 hover:bg-white/10">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Root Cause and Solution for Troubleshooting Cases */}
          {(article.rootCause || article.solution) && (
            <div className="mb-8 space-y-4">
              {article.rootCause && (
                <Card className="bg-destructive/10 border-destructive/20">
                  <CardHeader className="pb-3">
                    <h3 className="flex items-center gap-2 font-semibold text-destructive">
                      <div className="w-2 h-2 bg-destructive rounded-full" />
                      Root Cause
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{article.rootCause}</p>
                  </CardContent>
                </Card>
              )}
              
              {article.solution && (
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardHeader className="pb-3">
                    <h3 className="flex items-center gap-2 font-semibold text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      Solution
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{article.solution}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Separator className="mb-8" />

          {/* Main Content */}
          <div className="mb-8">
            <div className="prose prose-lg max-w-none text-foreground">
              {formatContent(article.content)}
            </div>
          </div>

          {/* Attachments */}
          {article.attachments && article.attachments.length > 0 && (
            <>
              <Separator className="mb-8" />
              <div className="mb-8">
                <h3 className="flex items-center gap-3 mb-6 text-xl font-semibold">
                  <Paperclip className="w-5 h-5 text-primary" />
                  Attachments
                  <Badge variant="secondary" className="text-xs">
                    {article.attachments.length}
                  </Badge>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.attachments.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    
                    return (
                      <Card 
                        key={file.id}
                        className="group hover:bg-muted/60 transition-all duration-200 cursor-pointer border-white/10 bg-white/5"
                        onClick={() => handleFileDownload(file)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
                              <FileIcon className="w-6 h-6 text-primary" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate group-hover:text-primary transition-colors">
                                {file.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Action Bar */}
          <Separator className="mb-6" />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLikeClick}
                className={`hover:bg-white/10 ${article.isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-4 h-4 mr-2 ${article.isLiked ? 'fill-current' : ''}`} />
                {article.likes || 0}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCommentToggle}
                className="hover:bg-white/10"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {article.comments?.length || 0} Comments
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSaveClick}
                className={`hover:bg-white/10 ${article.isSaved ? 'text-blue-600' : ''}`}
              >
                <Bookmark className={`w-4 h-4 mr-2 ${article.isSaved ? 'fill-current' : ''}`} />
                {article.isSaved ? 'Saved' : 'Save'}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Last updated {article.lastModified}
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold mb-4">Comments</h3>
              
              {/* Existing Comments */}
              <div className="space-y-4 mb-6">
                {article.comments && article.comments.length > 0 ? (
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
                            onClick={() => onCommentLike && onCommentLike(article.id, comment.id)}
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
              <div className="bg-muted/20 backdrop-blur-sm rounded-lg p-4 border border-white/5">
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-primary/20">You</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[60px] resize-none bg-input-background/60 border-white/10 focus:border-primary/50 mb-3"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim()}
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
        </div>
      </div>
    </div>
  );
}