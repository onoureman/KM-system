import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Clock, Eye, Edit, Star, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  categoryColor: string;
  lastModified: string;
  views: number;
  isFavorite: boolean;
  author: string;
  authorAvatar: string;
  stars: number;
  divisionId: string;
  departmentId: string;
  sectionId: string;
  status?: 'draft' | 'pending_manager' | 'pending_director' | 'approved' | 'rejected';
  rejectionReason?: string;
}

interface ArticleCardProps {
  article: Article;
  onEdit: (article: Article) => void;
  onView: (article: Article) => void;
  onToggleFavorite: (articleId: string) => void;
  onDelete: (articleId: string) => void;
}

export function ArticleCard({ 
  article, 
  onEdit, 
  onView, 
  onToggleFavorite, 
  onDelete 
}: ArticleCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group backdrop-blur-sm border-white/10 bg-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={() => onView(article)}>
            <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-muted-foreground line-clamp-2">
              {article.summary}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(article)}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(article)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFavorite(article.id)}>
                <Star className={`w-4 h-4 mr-2 ${article.isFavorite ? 'fill-current' : ''}`} />
                {article.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(article.id)}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ backgroundColor: `${article.categoryColor}20`, color: article.categoryColor }}
            >
              {article.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span className="text-xs">{article.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{article.lastModified}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={article.authorAvatar} alt={article.author} />
              <AvatarFallback className="text-xs">
                {article.author.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">by {article.author}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className={`w-3 h-3 ${i < article.stars ? 'fill-current text-yellow-500' : 'text-muted-foreground'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">({article.stars})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}