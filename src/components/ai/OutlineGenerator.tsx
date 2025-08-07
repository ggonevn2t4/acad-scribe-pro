import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ChevronDown, 
  ChevronRight, 
  Loader2, 
  FileText, 
  RotateCcw,
  Sparkles,
  BookOpen,
  Target,
  Clock,
  CheckCircle2,
  Info,
  Download
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EditableOutline from "./EditableOutline";
import ExportOptions from "./ExportOptions";

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

const OutlineGenerator = () => {
  const [topic, setTopic] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [wordCount, setWordCount] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outline, setOutline] = useState<OutlineData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [generatedArticle, setGeneratedArticle] = useState<string>("");
  const [activeTab, setActiveTab] = useState("view");
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Keys for localStorage
  const STORAGE_KEYS = {
    OUTLINE: 'outline_generator_outline',
    FORM_DATA: 'outline_generator_form',
    ARTICLE: 'outline_generator_article',
    ACTIVE_TAB: 'outline_generator_tab'
  };

  // Load persisted data on component mount
  useEffect(() => {
    try {
      const savedOutline = localStorage.getItem(STORAGE_KEYS.OUTLINE);
      const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
      const savedArticle = localStorage.getItem(STORAGE_KEYS.ARTICLE);
      const savedTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);

      if (savedOutline) {
        setOutline(JSON.parse(savedOutline));
        setExpandedSections(new Set([0]));
      }

      if (savedFormData) {
        const formData = JSON.parse(savedFormData);
        setTopic(formData.topic || "");
        setAcademicLevel(formData.academicLevel || "");
        setWordCount(formData.wordCount || "");
      }

      if (savedArticle) {
        setGeneratedArticle(savedArticle);
      }

      if (savedTab && savedOutline) {
        setActiveTab(savedTab);
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (outline) {
      localStorage.setItem(STORAGE_KEYS.OUTLINE, JSON.stringify(outline));
    }
  }, [outline]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify({
      topic,
      academicLevel,
      wordCount
    }));
  }, [topic, academicLevel, wordCount]);

  useEffect(() => {
    if (generatedArticle) {
      localStorage.setItem(STORAGE_KEYS.ARTICLE, generatedArticle);
    }
  }, [generatedArticle]);

  useEffect(() => {
    if (outline) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    }
  }, [activeTab, outline]);

  // Clear all persisted data
  const clearPersistedData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    setOutline(null);
    setGeneratedArticle("");
    setActiveTab("view");
    toast({
      title: "Đã xóa dữ liệu",
      description: "Tất cả outline và bài viết đã được xóa",
    });
  };

  const generateOutline = async () => {
    if (!topic || !academicLevel || !wordCount) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-outline', {
        body: {
          topic,
          academicLevel,
          wordCount: parseInt(wordCount),
          userId: user?.id,
        },
      });

      if (error) throw error;

      setOutline(data.outline);
      setExpandedSections(new Set([0])); // Expand first section by default
      
      toast({
        title: "Tạo outline thành công!",
        description: "Outline đã được tạo và lưu vào thư viện.",
      });
    } catch (error) {
      console.error('Error generating outline:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tạo outline. Vui lòng thử lại.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleArticleGenerated = (article: string) => {
    setGeneratedArticle(article);
    setActiveTab("article");
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const exportOutline = () => {
    if (!outline) return;

    let exportText = `# ${outline.title}\n\n`;
    
    outline.sections.forEach((section, index) => {
      exportText += `## ${index + 1}. ${section.title}\n\n`;
      
      section.subsections.forEach((subsection, subIndex) => {
        exportText += `### ${index + 1}.${subIndex + 1} ${subsection.title}\n\n`;
        
        if (subsection.points.length > 0) {
          exportText += "**Key Points:**\n";
          subsection.points.forEach(point => {
            exportText += `- ${point}\n`;
          });
          exportText += "\n";
        }
        
        if (subsection.evidence.length > 0) {
          exportText += "**Evidence Needed:**\n";
          subsection.evidence.forEach(evidence => {
            exportText += `- ${evidence}\n`;
          });
          exportText += "\n";
        }
      });
    });

    if (outline.conclusion.length > 0) {
      exportText += "## Conclusion\n\n";
      outline.conclusion.forEach(point => {
        exportText += `- ${point}\n`;
      });
    }

    const blob = new Blob([exportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${outline.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_outline.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8" />
          AI Outline Generator
        </h1>
        <p className="text-muted-foreground">
          Tạo outline học thuật chuyên nghiệp với sức mạnh của AI
        </p>
      </div>

      {/* Input Form */}
      <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <BookOpen className="h-5 w-5" />
            Thông tin bài viết
          </CardTitle>
          <CardDescription>
            Cung cấp thông tin để AI tạo outline phù hợp nhất
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <Label htmlFor="topic" className="font-medium">Chủ đề</Label>
              </div>
              <Textarea
                id="topic"
                placeholder="Ví dụ: Tác động của trí tuệ nhân tạo đến giáo dục..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Mô tả chi tiết chủ đề bạn muốn viết
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <Label htmlFor="academic-level" className="font-medium">Cấp độ học thuật</Label>
              </div>
              <Select value={academicLevel} onValueChange={setAcademicLevel}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Chọn cấp độ phù hợp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Trung học phổ thông</span>
                      <span className="text-xs text-muted-foreground">Cấp độ cơ bản</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="undergraduate">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Đại học</span>
                      <span className="text-xs text-muted-foreground">Cấp độ trung bình</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="graduate">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Thạc sĩ</span>
                      <span className="text-xs text-muted-foreground">Cấp độ nâng cao</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="doctoral">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Tiến sĩ</span>
                      <span className="text-xs text-muted-foreground">Cấp độ chuyên sâu</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Độ phức tạp của ngôn ngữ và nội dung
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <Label htmlFor="word-count" className="font-medium">Số từ mục tiêu</Label>
              </div>
              <Input
                id="word-count"
                type="number"
                placeholder="1500"
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
                className="h-12 text-center text-lg font-medium"
                min="100"
                max="10000"
                step="100"
              />
              <p className="text-xs text-muted-foreground">
                Độ dài dự kiến của bài viết cuối cùng
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Đang tạo outline...</span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                AI đang phân tích chủ đề và tạo cấu trúc outline
              </p>
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={generateOutline}
            disabled={isGenerating || !topic || !academicLevel || !wordCount}
            className="w-full h-12 text-lg font-medium gradient-primary"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Đang tạo outline...
              </>
            ) : (
              <>
                <Sparkles className="mr-3 h-5 w-5" />
                Tạo Outline với AI
              </>
            )}
          </Button>

          {/* Tips */}
          {!outline && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Mẹo:</strong> Mô tả chủ đề càng chi tiết, outline được tạo sẽ càng chính xác và phù hợp.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generated Outline with Tabs */}
      {outline && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-full max-w-lg grid-cols-4">
              <TabsTrigger value="view" className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Xem
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Chỉnh sửa
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
              <TabsTrigger value="article" disabled={!generatedArticle} className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Bài viết {generatedArticle && "✓"}
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button onClick={clearPersistedData} variant="outline" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <TabsContent value="view" className="space-y-4">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">{outline.title}</h2>
              {outline.sections.map((section, index) => (
                <Card key={index}>
                  <Collapsible
                    open={expandedSections.has(index)}
                    onOpenChange={() => toggleSection(index)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {expandedSections.has(index) ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                            {index + 1}. {section.title}
                          </CardTitle>
                          <Badge variant="secondary">
                            {section.subsections.length} phần
                          </Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {section.subsections.map((subsection, subIndex) => (
                            <div key={subIndex} className="border-l-2 border-accent pl-4">
                              <h4 className="font-semibold text-foreground mb-2">
                                {index + 1}.{subIndex + 1} {subsection.title}
                              </h4>
                              
                              {subsection.points.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Điểm chính:</p>
                                  <ul className="list-disc list-inside text-sm space-y-1">
                                    {subsection.points.map((point, pointIndex) => (
                                      <li key={pointIndex} className="text-foreground">{point}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {subsection.evidence.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Bằng chứng cần thiết:</p>
                                  <ul className="list-disc list-inside text-sm space-y-1">
                                    {subsection.evidence.map((evidence, evidenceIndex) => (
                                      <li key={evidenceIndex} className="text-subtle">{evidence}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}

              {outline.conclusion.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Kết luận</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {outline.conclusion.map((point, index) => (
                        <li key={index} className="text-foreground">{point}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="export">
            <ExportOptions outline={outline} />
          </TabsContent>

          <TabsContent value="edit">
            <EditableOutline
              initialOutline={outline}
              topic={topic}
              academicLevel={academicLevel}
              wordCount={parseInt(wordCount)}
              onArticleGenerated={handleArticleGenerated}
            />
          </TabsContent>

          <TabsContent value="article">
            {generatedArticle ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Bài viết hoàn chỉnh
                      </CardTitle>
                      <CardDescription>
                        Bài viết được tạo từ outline của bạn
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {generatedArticle.split(' ').length} từ
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap font-serif leading-relaxed text-foreground">
                      {generatedArticle}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Chưa có bài viết. Sử dụng tab "Chỉnh sửa" để tạo bài viết từ outline.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default OutlineGenerator;