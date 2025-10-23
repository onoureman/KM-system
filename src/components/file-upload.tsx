import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, File, X, FileText, FileImage, FileArchive, Download, Eye } from 'lucide-react';
import { cn } from './ui/utils';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadProgress?: number;
  isUploading?: boolean;
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  uploadedFiles: UploadedFile[];
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function FileUpload({
  onFilesChange,
  uploadedFiles,
  maxFiles = 10,
  maxSizeInMB = 10,
  acceptedTypes = ['*'],
  className
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const simulateUpload = (file: File): Promise<UploadedFile> => {
    return new Promise((resolve) => {
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        isUploading: true,
        uploadProgress: 0
      };

      // Add file to list immediately
      onFilesChange([...uploadedFiles, uploadedFile]);

      // Simulate upload progress
      const interval = setInterval(() => {
        uploadedFile.uploadProgress = (uploadedFile.uploadProgress || 0) + Math.random() * 20;
        
        if (uploadedFile.uploadProgress >= 100) {
          uploadedFile.uploadProgress = 100;
          uploadedFile.isUploading = false;
          clearInterval(interval);
          
          // Update the file list with completed upload
          onFilesChange([...uploadedFiles.filter(f => f.id !== uploadedFile.id), uploadedFile]);
          resolve(uploadedFile);
        } else {
          // Update progress
          onFilesChange([
            ...uploadedFiles.filter(f => f.id !== uploadedFile.id),
            uploadedFile
          ]);
        }
      }, 200);
    });
  };

  const handleFileSelect = useCallback(async (files: FileList) => {
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > maxSizeInMB * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is ${maxSizeInMB}MB.`);
        continue;
      }
      
      // Check file count
      if (uploadedFiles.length + validFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed.`);
        break;
      }
      
      validFiles.push(file);
    }

    // Upload valid files
    for (const file of validFiles) {
      try {
        await simulateUpload(file);
      } catch (error) {
        console.error('Upload failed:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }
  }, [uploadedFiles, maxFiles, maxSizeInMB, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
    onFilesChange(updatedFiles);
  };

  const previewFile = (file: UploadedFile) => {
    if (file.type.startsWith('image/')) {
      window.open(file.url, '_blank');
    } else {
      // For non-images, trigger download
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-all duration-200 backdrop-blur-sm bg-card/60",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50"
        )}
      >
        <CardContent 
          className="p-6 text-center cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className={cn(
            "w-12 h-12 mx-auto mb-4 transition-colors",
            isDragOver ? "text-primary" : "text-muted-foreground"
          )} />
          
          <h3 className="mb-2">
            {isDragOver ? "Drop files here" : "Upload Files"}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Maximum file size: {maxSizeInMB}MB</p>
            <p>Maximum files: {maxFiles}</p>
            <p>Uploaded: {uploadedFiles.length}/{maxFiles}</p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
            accept={acceptedTypes.join(',')}
          />
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card className="backdrop-blur-sm bg-card/80 border border-white/10">
          <CardContent className="p-4">
            <h4 className="mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Attached Files ({uploadedFiles.length})
            </h4>
            
            <div className="space-y-3">
              {uploadedFiles.map((file) => {
                const FileIcon = getFileIcon(file.type);
                
                return (
                  <div 
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-muted/40 backdrop-blur-sm rounded-lg border border-white/5"
                  >
                    <FileIcon className="w-5 h-5 text-primary flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="truncate font-medium">{file.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      
                      {file.isUploading && (
                        <div className="space-y-1">
                          <Progress 
                            value={file.uploadProgress || 0} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            Uploading... {Math.round(file.uploadProgress || 0)}%
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {!file.isUploading && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => previewFile(file)}
                            className="w-8 h-8 p-0"
                          >
                            {file.type.startsWith('image/') ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}