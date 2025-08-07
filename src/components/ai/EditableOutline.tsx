import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  Loader2,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OutlineSection {
  title: string;
  subsections: {
    title: string;
    points: string[];
    evidence: string[];
  }[];
}

interface OutlineData {
  title: string;
  sections: OutlineSection[];
  conclusion: string[];
}

interface EditableOutlineProps {
  initialOutline: OutlineData;
  topic: string;
  academicLevel: string;
  wordCount: number;
  onArticleGenerated?: (article: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Tốt nhất cho writing' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Mạnh và đa năng' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Nhanh và tiết kiệm' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', description: 'Nhanh nhất' },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Open source' },
];

const EditableOutline = ({ 
  initialOutline, 
  topic, 
  academicLevel, 
  wordCount,
  onArticleGenerated 
}: EditableOutlineProps) => {
  const [outline, setOutline] = useState<OutlineData>(initialOutline);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [editingSection, setEditingSection] = useState<{type: string, sectionIndex?: number, subsectionIndex?: number} | null>(null);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<string>("");
  const [articleTone, setArticleTone] = useState<string>("academic");
  const [selectedModel, setSelectedModel] = useState<string>("anthropic/claude-3.5-sonnet");
  
  const { toast } = useToast();

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const updateTitle = (newTitle: string) => {
    setOutline(prev => ({ ...prev, title: newTitle }));
  };

  const updateSectionTitle = (sectionIndex: number, newTitle: string) => {
    setOutline(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) => 
        index === sectionIndex ? { ...section, title: newTitle } : section
      )
    }));
  };

  const updateSubsectionTitle = (sectionIndex: number, subsectionIndex: number, newTitle: string) => {
    setOutline(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) => 
        index === sectionIndex 
          ? {
              ...section,
              subsections: section.subsections.map((subsection, subIndex) =>
                subIndex === subsectionIndex ? { ...subsection, title: newTitle } : subsection
              )
            }
          : section
      )
    }));
  };

  const addSection = () => {
    setOutline(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: "Phần mới",
          subsections: [{
            title: "Tiểu mục mới",
            points: [],
            evidence: []
          }]
        }
      ]
    }));
  };

  const addSubsection = (sectionIndex: number) => {
    setOutline(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              subsections: [
                ...section.subsections,
                { title: "Tiểu mục mới", points: [], evidence: [] }
              ]
            }
          : section
      )
    }));
  };

  const deleteSection = (sectionIndex: number) => {
    setOutline(prev => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex)
    }));
  };

  const deleteSubsection = (sectionIndex: number, subsectionIndex: number) => {
    setOutline(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              subsections: section.subsections.filter((_, subIndex) => subIndex !== subsectionIndex)
            }
          : section
      )
    }));
  };

  const updatePoints = (sectionIndex: number, subsectionIndex: number, newPoints: string[]) => {
    setOutline(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              subsections: section.subsections.map((subsection, subIndex) =>
                subIndex === subsectionIndex ? { ...subsection, points: newPoints } : subsection
              )
            }
          : section
      )
    }));
  };

  const updateEvidence = (sectionIndex: number, subsectionIndex: number, newEvidence: string[]) => {
    setOutline(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              subsections: section.subsections.map((subsection, subIndex) =>
                subIndex === subsectionIndex ? { ...subsection, evidence: newEvidence } : subsection
              )
            }
          : section
      )
    }));
  };

  const updateConclusion = (newConclusion: string[]) => {
    setOutline(prev => ({ ...prev, conclusion: newConclusion }));
  };

  const generateFullArticle = async () => {
    setIsGeneratingArticle(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-full-article', {
        body: {
          outline,
          topic,
          academicLevel,
          wordCount,
          tone: articleTone,
          model: selectedModel
        },
      });

      if (error) throw error;

      setGeneratedArticle(data.article);
      setShowPreview(true);
      onArticleGenerated?.(data.article);
      
      toast({
        title: "Tạo bài viết thành công!",
        description: `Đã tạo bài viết ${data.wordCount} từ dựa trên outline.`,
      });
    } catch (error) {
      console.error('Error generating article:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tạo bài viết. Vui lòng thử lại.",
      });
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Input
                value={outline.title}
                onChange={(e) => updateTitle(e.target.value)}
                className="text-xl font-bold bg-transparent border-none p-0 focus-visible:ring-0"
                placeholder="Tiêu đề outline..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addSection} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Thêm phần
              </Button>
            </div>
          </div>
          <CardDescription>
            Chỉnh sửa outline để hoàn thiện trước khi tạo bài viết
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Sections Editor */}
      <div className="space-y-3">
        {outline.sections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <Collapsible
              open={expandedSections.has(sectionIndex)}
              onOpenChange={() => toggleSection(sectionIndex)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      {expandedSections.has(sectionIndex) ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                      <Input
                        value={section.title}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateSectionTitle(sectionIndex, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent border-none p-0 font-semibold focus-visible:ring-0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {section.subsections.length} phần
                      </Badge>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(sectionIndex);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {section.subsections.map((subsection, subsectionIndex) => (
                      <div key={subsectionIndex} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Input
                            value={subsection.title}
                            onChange={(e) => updateSubsectionTitle(sectionIndex, subsectionIndex, e.target.value)}
                            className="bg-transparent border-none p-0 font-medium focus-visible:ring-0"
                          />
                          <Button
                            onClick={() => deleteSubsection(sectionIndex, subsectionIndex)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Điểm chính:</Label>
                            <Textarea
                              value={subsection.points.join('\n')}
                              onChange={(e) => updatePoints(sectionIndex, subsectionIndex, e.target.value.split('\n').filter(p => p.trim()))}
                              placeholder="Mỗi dòng một điểm..."
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Bằng chứng:</Label>
                            <Textarea
                              value={subsection.evidence.join('\n')}
                              onChange={(e) => updateEvidence(sectionIndex, subsectionIndex, e.target.value.split('\n').filter(e => e.trim()))}
                              placeholder="Mỗi dòng một bằng chứng..."
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      onClick={() => addSubsection(sectionIndex)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Thêm tiểu mục
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Conclusion Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Kết luận</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={outline.conclusion.join('\n')}
            onChange={(e) => updateConclusion(e.target.value.split('\n').filter(c => c.trim()))}
            placeholder="Mỗi dòng một điểm kết luận..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Generate Article Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tạo bài viết hoàn chỉnh
          </CardTitle>
          <CardDescription>
            Sử dụng outline đã chỉnh sửa để tạo bài viết hoàn chỉnh
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Số từ mục tiêu</Label>
              <Input value={wordCount} disabled />
            </div>
            <div>
              <Label>Cấp độ học thuật</Label>
              <Input value={academicLevel} disabled />
            </div>
            <div>
              <Label>AI Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tone bài viết</Label>
              <Select value={articleTone} onValueChange={setArticleTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Học thuật</SelectItem>
                  <SelectItem value="formal">Trang trọng</SelectItem>
                  <SelectItem value="neutral">Trung tính</SelectItem>
                  <SelectItem value="persuasive">Thuyết phục</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={generateFullArticle}
              disabled={isGeneratingArticle}
              className="flex-1"
            >
              {isGeneratingArticle ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo bài viết...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Tạo bài viết hoàn chỉnh
                </>
              )}
            </Button>
            
            {generatedArticle && (
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Xem trước
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Bài viết được tạo</DialogTitle>
                    <DialogDescription>
                      Bài viết hoàn chỉnh dựa trên outline của bạn
                    </DialogDescription>
                  </DialogHeader>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap font-serif leading-relaxed">
                      {generatedArticle}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditableOutline;