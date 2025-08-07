import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Shield, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlagiarismResult {
  similarityPercentage: number;
  suspiciousPhrases: Array<{
    text: string;
    startPosition: number;
    endPosition: number;
    riskLevel: string;
  }>;
  potentialSources: Array<{
    title: string;
    type: string;
    similarity: number;
    matchedText: string;
  }>;
  paraphraseSuggestions: Array<{
    original: string;
    suggestion: string;
    reason: string;
  }>;
  overallAssessment: string;
}

const PlagiarismDetector = () => {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
        toast({
          title: "Tải file thành công",
          description: `Đã đọc ${content.length} ký tự từ ${file.name}`,
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

  const checkPlagiarism = async () => {
    if (!text.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu nội dung",
        description: "Vui lòng nhập văn bản cần kiểm tra",
      });
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('plagiarism-detector', {
        body: {
          text,
          fileName,
          userId: user?.id,
        },
      });

      if (error) throw error;

      setResult(data);
      
      toast({
        title: "Kiểm tra hoàn tất!",
        description: `Tỷ lệ tương đồng: ${data.similarityPercentage}%`,
      });
    } catch (error) {
      console.error('Error checking plagiarism:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể kiểm tra đạo văn. Vui lòng thử lại.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getSimilarityColor = (percentage: number) => {
    if (percentage < 15) return "text-green-600";
    if (percentage < 30) return "text-yellow-600";
    return "text-red-600";
  };

  const getSimilarityBadge = (percentage: number) => {
    if (percentage < 15) return { variant: "default" as const, text: "An toàn" };
    if (percentage < 30) return { variant: "secondary" as const, text: "Cảnh báo" };
    return { variant: "destructive" as const, text: "Rủi ro cao" };
  };

  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

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
            
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Tải file để kiểm tra đạo văn
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
              <div className="mt-4">
                <p className="text-sm font-medium flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  {fileName}
                </p>
              </div>
            )}
          </div>

          {wordCount > 0 && (
            <div className="flex gap-2">
              <Badge variant="outline">
                Số từ: {wordCount.toLocaleString()}
              </Badge>
              <Badge variant="outline">
                Ký tự: {text.length.toLocaleString()}
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-content">Nội dung văn bản</Label>
            <Textarea
              id="text-content"
              placeholder="Dán nội dung cần kiểm tra vào đây hoặc tải file từ bên trái..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
            />
          </div>

          <Button 
            onClick={checkPlagiarism}
            disabled={isChecking}
            className="w-full gradient-primary"
          >
            {isChecking ? (
              <>
                <Shield className="mr-2 h-4 w-4 animate-pulse" />
                Đang kiểm tra...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Kiểm tra đạo văn
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Kết quả kiểm tra</span>
                <Badge {...getSimilarityBadge(result.similarityPercentage)}>
                  {getSimilarityBadge(result.similarityPercentage).text}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tỷ lệ tương đồng</span>
                    <span className={`text-lg font-bold ${getSimilarityColor(result.similarityPercentage)}`}>
                      {result.similarityPercentage}%
                    </span>
                  </div>
                  <Progress 
                    value={result.similarityPercentage} 
                    className="h-2"
                  />
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {result.overallAssessment}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Suspicious Phrases */}
            {result.suspiciousPhrases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cụm từ nghi ngờ</CardTitle>
                  <CardDescription>
                    Các đoạn văn bản có thể bị đạo văn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.suspiciousPhrases.map((phrase, index) => (
                      <div key={index} className="border-l-2 border-red-500 pl-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge 
                            variant={phrase.riskLevel === 'high' ? 'destructive' : 
                                    phrase.riskLevel === 'medium' ? 'secondary' : 'outline'}
                          >
                            {phrase.riskLevel === 'high' ? 'Rủi ro cao' :
                             phrase.riskLevel === 'medium' ? 'Rủi ro trung bình' : 'Rủi ro thấp'}
                          </Badge>
                        </div>
                        <p className="text-sm italic">"{phrase.text}"</p>
                        <p className="text-xs text-muted-foreground">
                          Vị trí: {phrase.startPosition} - {phrase.endPosition}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Potential Sources */}
            {result.potentialSources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nguồn tiềm năng</CardTitle>
                  <CardDescription>
                    Các nguồn tài liệu có thể trùng khớp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.potentialSources.map((source, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{source.type}</Badge>
                          <span className="text-sm font-medium">{source.similarity}%</span>
                        </div>
                        <h4 className="font-medium text-sm mb-1">{source.title}</h4>
                        <p className="text-xs text-muted-foreground italic">
                          "{source.matchedText}"
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Paraphrasing Suggestions */}
          {result.paraphraseSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Gợi ý Paraphrase
                </CardTitle>
                <CardDescription>
                  Cách viết lại để tránh đạo văn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.paraphraseSuggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="space-y-3">
                        <div>
                          <Badge variant="outline" className="mb-2">Văn bản gốc</Badge>
                          <p className="text-sm bg-red-50 dark:bg-red-950 p-2 rounded">
                            {suggestion.original}
                          </p>
                        </div>
                        
                        <div>
                          <Badge variant="outline" className="mb-2">Gợi ý cải thiện</Badge>
                          <p className="text-sm bg-green-50 dark:bg-green-950 p-2 rounded">
                            {suggestion.suggestion}
                          </p>
                        </div>
                        
                        <div>
                          <Badge variant="outline" className="mb-2">Lý do</Badge>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default PlagiarismDetector;