import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Download, Loader2, Lightbulb } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SummaryData {
  summary: string;
  keyInsights: string[];
  mainTopics: string[];
  wordCount: number;
}

const DocumentSummarizer = () => {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [summaryLength, setSummaryLength] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      };

      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text);
        setUploadProgress(100);
        toast({
          title: "Tải file thành công",
          description: `Đã đọc ${text.length} ký tự từ ${file.name}`,
        });
      };

      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Lỗi đọc file",
          description: "Không thể đọc nội dung file",
        });
      };

      reader.readAsText(file);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xử lý file này",
      });
    }
  };

  const generateSummary = async () => {
    if (!content || !summaryLength) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập nội dung và chọn độ dài tóm tắt",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('document-summarizer', {
        body: {
          content,
          summaryLength,
          fileName,
          userId: user?.id,
        },
      });

      if (error) throw error;

      setSummaryData(data);
      
      toast({
        title: "Tóm tắt thành công!",
        description: "Đã tạo tóm tắt và lưu vào thư viện.",
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tạo tóm tắt. Vui lòng thử lại.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportSummary = () => {
    if (!summaryData) return;

    let exportText = `# Tóm tắt tài liệu: ${fileName || 'Untitled'}\n\n`;
    
    exportText += `## Tóm tắt chính\n\n${summaryData.summary}\n\n`;
    
    if (summaryData.mainTopics.length > 0) {
      exportText += `## Chủ đề chính\n\n`;
      summaryData.mainTopics.forEach(topic => {
        exportText += `- ${topic}\n`;
      });
      exportText += "\n";
    }
    
    if (summaryData.keyInsights.length > 0) {
      exportText += `## Những điểm chính\n\n`;
      summaryData.keyInsights.forEach((insight, index) => {
        exportText += `${index + 1}. ${insight}\n`;
      });
    }

    const blob = new Blob([exportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName?.replace(/\.[^/.]+$/, "") || "summary"}_summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Kéo thả file hoặc click để chọn
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Chọn file
              </Button>
            </div>
            
            {fileName && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">{fileName}</p>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress value={uploadProgress} className="w-full" />
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary-length">Độ dài tóm tắt</Label>
            <Select value={summaryLength} onValueChange={setSummaryLength}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn độ dài" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Ngắn (2-3 câu)</SelectItem>
                <SelectItem value="medium">Trung bình (1-2 đoạn)</SelectItem>
                <SelectItem value="long">Dài (3-4 đoạn)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {wordCount > 0 && (
            <Badge variant="outline">
              Số từ: {wordCount.toLocaleString()}
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung tài liệu</Label>
            <Textarea
              id="content"
              placeholder="Dán nội dung tài liệu vào đây hoặc tải file từ bên trái..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
            />
          </div>

          <Button 
            onClick={generateSummary}
            disabled={isProcessing}
            className="w-full gradient-primary"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Tạo tóm tắt'
            )}
          </Button>
        </div>
      </div>

      {/* Summary Results */}
      {summaryData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">Kết quả tóm tắt</h2>
            <Button onClick={exportSummary} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Summary */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tóm tắt chính</CardTitle>
                  <CardDescription>
                    Tóm tắt {summaryLength === 'short' ? 'ngắn gọn' : summaryLength === 'medium' ? 'trung bình' : 'chi tiết'} của tài liệu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="leading-relaxed whitespace-pre-wrap">{summaryData.summary}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with insights */}
            <div className="space-y-4">
              {summaryData.mainTopics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Chủ đề chính</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {summaryData.mainTopics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="block text-center">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Insights quan trọng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {summaryData.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-sm leading-relaxed">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thống kê</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Số từ gốc:</span>
                      <span className="text-sm font-medium">{summaryData.wordCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Số từ tóm tắt:</span>
                      <span className="text-sm font-medium">
                        {summaryData.summary.split(/\s+/).filter(word => word.length > 0).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tỷ lệ nén:</span>
                      <span className="text-sm font-medium">
                        {Math.round((summaryData.summary.split(/\s+/).filter(word => word.length > 0).length / summaryData.wordCount) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentSummarizer;