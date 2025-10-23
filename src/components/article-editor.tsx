import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, Send, Eye, Paperclip } from 'lucide-react';
import { FileUpload, UploadedFile } from './file-upload';

interface Category {
  id: string;
  name: string;
  color: string;
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

interface ArticleEditorProps {
  article?: Article;
  categories: Category[];
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  onSave: (article: Partial<Article>) => void;
  onCancel: () => void;
  onPreview: (article: Partial<Article>) => void;
}

export function ArticleEditor({ 
  article, 
  categories, 
  divisions,
  departments,
  sections,
  onSave, 
  onCancel, 
  onPreview 
}: ArticleEditorProps) {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [selectedCategory, setSelectedCategory] = useState(article?.category || '');
  const [selectedDivision, setSelectedDivision] = useState(article?.divisionId || '');
  const [selectedDepartment, setSelectedDepartment] = useState(article?.departmentId || '');
  const [selectedSection, setSelectedSection] = useState(article?.sectionId || '');
  const [keywords, setKeywords] = useState<string[]>(article?.keywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  const [rootCause, setRootCause] = useState(article?.rootCause || '');
  const [solution, setSolution] = useState(article?.solution || '');
  const [attachments, setAttachments] = useState<UploadedFile[]>(article?.attachments || []);

  // Filter departments based on selected division
  const filteredDepartments = selectedDivision 
    ? departments.filter(dept => dept.divisionId === selectedDivision)
    : departments;

  // Filter sections based on selected department
  const filteredSections = selectedDepartment 
    ? sections.filter(section => section.departmentId === selectedDepartment)
    : sections;

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSave = () => {
    const categoryData = categories.find(cat => cat.name === selectedCategory);
    
    onSave({
      id: article?.id,
      title,
      content,
      category: selectedCategory,
      categoryColor: categoryData?.color || '#666',
      keywords,
      rootCause,
      solution: selectedCategory === 'Troubleshooting' ? solution : undefined,
      attachments,
      lastModified: new Date().toLocaleDateString(),
      author: 'Current User',
      divisionId: selectedDivision,
      departmentId: selectedDepartment,
      sectionId: selectedSection,
      status: article?.id ? article.status : 'pending_manager'
    });
  };

  const handlePreview = () => {
    const categoryData = categories.find(cat => cat.name === selectedCategory);
    
    onPreview({
      id: article?.id,
      title,
      content,
      category: selectedCategory,
      categoryColor: categoryData?.color || '#666',
      keywords,
      rootCause,
      solution: selectedCategory === 'Troubleshooting' ? solution : undefined,
      attachments,
      lastModified: new Date().toLocaleDateString(),
      author: 'Current User',
      divisionId: selectedDivision,
      departmentId: selectedDepartment,
      sectionId: selectedSection,
      status: article?.id ? article.status : 'pending_manager'
    });
  };

  const isValid = title.trim() && content.trim() && selectedCategory && selectedDivision && selectedDepartment && selectedSection && rootCause.trim() && (selectedCategory !== 'Troubleshooting' || solution.trim());

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Card className="h-full flex flex-col backdrop-blur-sm border-white/10 bg-card/80">
      <CardHeader className="border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle>
            {article ? 'Edit Case' : 'New Case'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={!isValid}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isValid}
            >
              <Send className="w-4 h-4 mr-2" />
              Send for Review
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter case title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rootCause">Root Cause</Label>
          <Textarea
            id="rootCause"
            placeholder="Describe the root cause of the issue..."
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="division">Division</Label>
            <Select value={selectedDivision} onValueChange={(value) => {
              setSelectedDivision(value);
              setSelectedDepartment('');
              setSelectedSection('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division) => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={selectedDepartment} onValueChange={(value) => {
              setSelectedDepartment(value);
              setSelectedSection('');
            }} disabled={!selectedDivision}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {filteredDepartments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {filteredSections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCategory === 'Troubleshooting' && (
          <div className="space-y-2">
            <Label htmlFor="solution">Solution</Label>
            <Textarea
              id="solution"
              placeholder="Describe the solution to resolve the issue..."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              rows={4}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <div className="flex gap-2 mb-2">
            <Input
              id="keywords"
              placeholder="Add a keyword..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="text-xs">
                {keyword}
                <button
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Write your case content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            File Attachments
          </Label>
          <FileUpload
            uploadedFiles={attachments}
            onFilesChange={setAttachments}
            maxFiles={5}
            maxSizeInMB={25}
            acceptedTypes={['*']}
          />
        </div>
      </CardContent>
      </Card>
    </div>
  );
}