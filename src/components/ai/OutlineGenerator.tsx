import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Download, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

const OutlineGenerator = () => {
  const [topic, setTopic] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [wordCount, setWordCount] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outline, setOutline] = useState<OutlineData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  
  const { user } = useAuth();
  const { toast } = useToast();

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
    <div className="space-y-6">
      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Chủ đề</Label>
          <Textarea
            id="topic"
            placeholder="Nhập chủ đề bài viết..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="academic-level">Cấp độ học thuật</Label>
          <Select value={academicLevel} onValueChange={setAcademicLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn cấp độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high-school">Trung học phổ thông</SelectItem>
              <SelectItem value="undergraduate">Đại học</SelectItem>
              <SelectItem value="graduate">Thạc sĩ</SelectItem>
              <SelectItem value="doctoral">Tiến sĩ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="word-count">Số từ mục tiêu</Label>
          <Input
            id="word-count"
            type="number"
            placeholder="1500"
            value={wordCount}
            onChange={(e) => setWordCount(e.target.value)}
          />
        </div>
      </div>

      <Button 
        onClick={generateOutline}
        disabled={isGenerating}
        className="w-full gradient-primary"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tạo outline...
          </>
        ) : (
          'Tạo Outline'
        )}
      </Button>

      {/* Generated Outline */}
      {outline && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">{outline.title}</h2>
            <Button onClick={exportOutline} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="space-y-3">
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
        </div>
      )}
    </div>
  );
};

export default OutlineGenerator;