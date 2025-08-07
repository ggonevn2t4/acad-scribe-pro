import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, RefreshCw, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const WritingAssistant = () => {
  const [context, setContext] = useState("");
  const [currentText, setCurrentText] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [improvedText, setImprovedText] = useState("");
  
  const { toast } = useToast();

  const processText = async (action: string) => {
    if (!currentText || !writingStyle) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập văn bản và chọn phong cách viết",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('writing-assistant', {
        body: {
          context,
          currentText,
          writingStyle,
          action,
        },
      });

      if (error) throw error;

      if (action === 'improve') {
        setSuggestions(data);
        setImprovedText(data.improvedText);
      } else {
        setImprovedText(data.text);
        setSuggestions(null);
      }
      
      toast({
        title: "Xử lý thành công!",
        description: action === 'improve' ? "Đã tạo gợi ý cải thiện" : "Đã xử lý văn bản",
      });
    } catch (error) {
      console.error('Error processing text:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xử lý văn bản. Vui lòng thử lại.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateReadabilityLevel = (text: string) => {
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    if (avgWordsPerSentence < 15) return "Dễ đọc";
    if (avgWordsPerSentence < 20) return "Trung bình";
    return "Khó đọc";
  };

  const wordCount = currentText.split(/\s+/).filter(word => word.length > 0).length;
  const readabilityLevel = calculateReadabilityLevel(currentText);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="context">Bối cảnh (tùy chọn)</Label>
            <Textarea
              id="context"
              placeholder="Mô tả ngắn gọn về bối cảnh hoặc mục đích của văn bản..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="writing-style">Phong cách viết</Label>
            <Select value={writingStyle} onValueChange={setWritingStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phong cách" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">Học thuật</SelectItem>
                <SelectItem value="formal">Trang trọng</SelectItem>
                <SelectItem value="informal">Thân mật</SelectItem>
                <SelectItem value="persuasive">Thuyết phục</SelectItem>
                <SelectItem value="descriptive">Mô tả</SelectItem>
                <SelectItem value="narrative">Tường thuật</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline">
              Số từ: {wordCount}
            </Badge>
            <Badge variant="outline">
              Độ dễ đọc: {readabilityLevel}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-text">Văn bản hiện tại</Label>
            <Textarea
              id="current-text"
              placeholder="Nhập văn bản cần hỗ trợ..."
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              rows={8}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => processText('improve')}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Cải thiện
            </Button>
            
            <Button 
              onClick={() => processText('continue')}
              disabled={isProcessing}
              variant="outline"
              className="flex-1"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Tiếp tục
            </Button>
            
            <Button 
              onClick={() => processText('rewrite')}
              disabled={isProcessing}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Viết lại
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {(improvedText || suggestions) && (
        <Tabs defaultValue="result" className="w-full">
          <TabsList>
            <TabsTrigger value="result">Kết quả</TabsTrigger>
            {suggestions && <TabsTrigger value="suggestions">Gợi ý chi tiết</TabsTrigger>}
          </TabsList>

          <TabsContent value="result" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Văn bản đã cải thiện
                </CardTitle>
                <CardDescription>
                  AI đã xử lý và tối ưu hóa văn bản theo phong cách {writingStyle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap leading-relaxed">{improvedText}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(improvedText);
                      toast({ title: "Đã sao chép vào clipboard" });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Sao chép
                  </Button>
                  <Button
                    onClick={() => setCurrentText(improvedText)}
                    variant="outline"
                    size="sm"
                  >
                    Sử dụng kết quả này
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {suggestions && (
            <TabsContent value="suggestions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.suggestions && suggestions.suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Gợi ý cải thiện</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {suggestions.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {suggestions.grammarFixes && suggestions.grammarFixes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sửa lỗi ngữ pháp</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {suggestions.grammarFixes.map((fix: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{fix}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {suggestions.readabilityScore && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Đánh giá độ dễ đọc</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {suggestions.readabilityScore}
                    </Badge>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default WritingAssistant;