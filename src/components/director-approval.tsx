import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  Calendar, 
  MapPin,
  Paperclip,
  Download,
  Eye,
  Crown
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

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
  attachments?: UploadedFile[];
  rootCause?: string;
  solution?: string;
  status?: 'draft' | 'pending_manager' | 'pending_director' | 'approved' | 'rejected';
  rejectionReason?: string;
}

interface Division {
  id: string;
  name: string;
  count: number;
}

interface Department {
  id: string;
  name: string;
  divisionId: string;
  count: number;
}

interface Section {
  id: string;
  name: string;
  departmentId: string;
  count: number;
}

interface DirectorApprovalProps {
  articles: Article[];
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  onApprove: (articleId: string) => void;
  onReject: (articleId: string, reason: string) => void;
  onBack: () => void;
}

export function DirectorApproval({
  articles,
  divisions,
  departments,
  sections,
  onApprove,
  onReject,
  onBack
}: DirectorApprovalProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const pendingArticles = articles.filter(article => article.status === 'pending_director');

  const getDivisionName = (divisionId: string) => {
    return divisions.find(d => d.id === divisionId)?.name || 'Unknown';
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || 'Unknown';
  };

  const getSectionName = (sectionId: string) => {
    return sections.find(s => s.id === sectionId)?.name || 'Unknown';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleApprove = (article: Article) => {
    onApprove(article.id);
  };

  const handleReject = () => {
    if (selectedArticle && rejectionReason.trim()) {
      onReject(selectedArticle.id, rejectionReason);
      setSelectedArticle(null);
      setRejectionReason('');
      setShowRejectDialog(false);
    }
  };

  const openRejectDialog = (article: Article) => {
    setSelectedArticle(article);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Card className="h-full flex flex-col backdrop-blur-sm border-white/10 bg-card/80">
        <CardHeader className="border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Director Final Approval
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {pendingArticles.length} case{pendingArticles.length !== 1 ? 's' : ''} pending final approval
              </p>
            </div>
            <Button variant="outline" onClick={onBack}>
              Back to Dashboard
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {pendingArticles.length === 0 ? (
            <div className="text-center py-12">
              <Crown className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
              <h3 className="mb-2">No pending cases</h3>
              <p className="text-muted-foreground">
                All cases have been reviewed and approved. Manager-approved cases will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingArticles.map((article) => (
                <Card key={article.id} className="glass border-white/10 border-l-4 border-l-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium">{article.title}</h3>
                          <Badge 
                            variant="secondary" 
                            style={{ backgroundColor: `${article.categoryColor}20`, color: article.categoryColor }}
                          >
                            {article.category}
                          </Badge>
                          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                            Manager Approved
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {article.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {article.lastModified}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {getDivisionName(article.divisionId)} - {getDepartmentName(article.departmentId)} - {getSectionName(article.sectionId)}
                          </div>
                        </div>

                        {article.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {article.keywords.map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Root Cause:</Label>
                            <p className="text-sm text-muted-foreground mt-1">{article.rootCause}</p>
                          </div>

                          {article.solution && (
                            <div>
                              <Label className="text-sm font-medium">Solution:</Label>
                              <p className="text-sm text-muted-foreground mt-1">{article.solution}</p>
                            </div>
                          )}

                          {article.attachments && article.attachments.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <Paperclip className="w-4 h-4" />
                                Attachments ({article.attachments.length})
                              </Label>
                              <div className="mt-2 space-y-2">
                                {article.attachments.map((file) => (
                                  <div key={file.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm">{file.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({formatFileSize(file.size)})
                                      </span>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center gap-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Full Content
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>{article.title}</DialogTitle>
                              <DialogDescription>
                                Full case content for final review and approval
                              </DialogDescription>
                            </DialogHeader>
                            <div className="overflow-y-auto max-h-[60vh] p-4 bg-muted/10 rounded-md">
                              <div className="prose prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap font-sans text-sm">
                                  {article.content}
                                </pre>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          onClick={() => handleApprove(article)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Final Approval
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRejectDialog(article)}
                          className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Send Back
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Send Back to Manager Review</DialogTitle>
            <DialogDescription>
              Provide feedback for the manager. This case will be sent back for additional review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
              <p className="text-sm text-yellow-400">
                This case was previously approved by a manager. Provide feedback and send it back for additional review.
              </p>
            </div>
            <div>
              <Label>Feedback for Manager:</Label>
              <Textarea
                placeholder="Please provide detailed feedback for the manager to address..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Send Back to Manager
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}