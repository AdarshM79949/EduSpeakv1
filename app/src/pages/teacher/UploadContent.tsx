import { useState } from 'react';
import { Upload, Video, FileText, Headphones, X, Eye, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { SkillCategory, DifficultyLevel, LessonType } from '@/types';

export default function UploadContent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SkillCategory>('speaking');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [lessonType, setLessonType] = useState<LessonType>('video');
  const [duration, setDuration] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
      toast.success(`File "${files[0].name}" selected`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`File "${file.name}" selected`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('eduspeak_token');
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          description,
          skill: category,
          difficulty,
          type: lessonType,
          content: contentUrl || '',
          duration: parseInt(duration) || 0,
          thumbnail: '',
        }),
      });
      if (res.ok) {
        toast.success('Lesson uploaded successfully!');
        setTitle(''); setDescription(''); setDuration(''); setContentUrl(''); setUploadedFile(null);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to upload lesson');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
  };

  const getTypeIcon = (type: LessonType) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Headphones className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Upload Content</h1>
        <p className="text-muted-foreground">Create and upload new lessons for your students</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Lesson Title</Label>
                <Input
                  id="title"
                  placeholder="Enter lesson title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as SkillCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="speaking">Speaking</SelectItem>
                      <SelectItem value="listening">Listening</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                      <SelectItem value="grammar">Grammar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lesson Type</Label>
                  <Select value={lessonType} onValueChange={(value) => setLessonType(value as LessonType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 15"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Upload */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="upload">
                <TabsList className="mb-4">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="url">External URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    {uploadedFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span>{uploadedFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setUploadedFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">
                          Drag and drop your file here, or{' '}
                          <label className="text-primary cursor-pointer hover:underline">
                            browse
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleFileSelect}
                              accept={lessonType === 'video' ? 'video/*' : lessonType === 'audio' ? 'audio/*' : '*/*'}
                            />
                          </label>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Max file size: 50MB
                        </p>
                      </>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="url">
                  <div className="space-y-2">
                    <Label>Content URL</Label>
                    <Input
                      placeholder="https://..."
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste a YouTube link or other video URL
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button type="submit">
              <Upload className="h-4 w-4 mr-2" />
              Publish Lesson
            </Button>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Lesson Preview</h3>
              <div className="bg-muted rounded-lg overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  {getTypeIcon(lessonType)}
                </div>
                <div className="p-4">
                  <h4 className="font-medium line-clamp-1">{title || 'Untitled Lesson'}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {description || 'No description provided'}
                  </p>
                  <div className="flex items-center space-x-2 mt-3">
                    <span className="text-xs px-2 py-1 bg-primary/10 rounded capitalize">{category}</span>
                    <span className="text-xs px-2 py-1 bg-muted rounded capitalize">{difficulty}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Publishing Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Use clear, descriptive titles</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Add detailed descriptions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Choose appropriate difficulty</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Preview before publishing</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
