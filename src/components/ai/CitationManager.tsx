import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Quote, Copy, Download, Loader2, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CitationData {
  formattedCitation: string;
  title?: string;
  author?: string;
  publicationYear?: number;
  sourceType?: string;
  publisher?: string;
  url?: string;
  doi?: string;
}

const CitationManager = () => {
  const [rawCitation, setRawCitation] = useState("");
  const [citationStyle, setCitationStyle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formattedCitation, setFormattedCitation] = useState<CitationData | null>(null);
  const [savedCitations, setSavedCitations] = useState<any[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const formatCitation = async () => {
    if (!rawCitation || !citationStyle) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập citation và chọn format",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('citation-manager', {
        body: {
          rawCitation,
          citationStyle,
          action: 'format',
          userId: user?.id,
        },
      });

      if (error) throw error;

      setFormattedCitation(data);
      
      toast({
        title: "Format thành công!",
        description: "Citation đã được format và lưu vào thư viện.",
      });
    } catch (error) {
      console.error('Error formatting citation:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể format citation. Vui lòng thử lại.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const convertCitation = async () => {
    if (!rawCitation || !citationStyle) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập citation và chọn format đích",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('citation-manager', {
        body: {
          rawCitation,
          citationStyle,
          action: 'convert',
        },
      });

      if (error) throw error;

      setFormattedCitation(data);
      
      toast({
        title: "Chuyển đổi thành công!",
        description: `Đã chuyển đổi citation sang format ${citationStyle}`,
      });
    } catch (error) {
      console.error('Error converting citation:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể chuyển đổi citation. Vui lòng thử lại.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Citation đã được sao chép vào clipboard",
    });
  };

  const loadSavedCitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('citations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedCitations(data || []);
    } catch (error) {
      console.error('Error loading citations:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="format" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="format">Format Citation</TabsTrigger>
          <TabsTrigger value="library" onClick={loadSavedCitations}>Thư viện</TabsTrigger>
        </TabsList>

        <TabsContent value="format" className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="raw-citation">Citation gốc</Label>
                <Textarea
                  id="raw-citation"
                  placeholder="Dán citation cần format hoặc chuyển đổi..."
                  value={rawCitation}
                  onChange={(e) => setRawCitation(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="citation-style">Format mong muốn</Label>
                <Select value={citationStyle} onValueChange={setCitationStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APA">APA (7th Edition)</SelectItem>
                    <SelectItem value="MLA">MLA (9th Edition)</SelectItem>
                    <SelectItem value="Chicago">Chicago/Turabian</SelectItem>
                    <SelectItem value="Harvard">Harvard</SelectItem>
                    <SelectItem value="IEEE">IEEE</SelectItem>
                    <SelectItem value="Vancouver">Vancouver</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={formatCitation}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Quote className="mr-2 h-4 w-4" />
                  )}
                  Format
                </Button>
                
                <Button 
                  onClick={convertCitation}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex-1"
                >
                  Chuyển đổi
                </Button>
              </div>
            </div>

            {/* Quick Examples */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ví dụ citation</CardTitle>
                  <CardDescription>
                    Click để sử dụng làm mẫu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div 
                    className="p-3 bg-muted/50 rounded cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setRawCitation("Smith, J. (2023). Artificial Intelligence in Education. Journal of Educational Technology, 15(3), 123-145.")}
                  >
                    <p className="text-sm font-medium">Journal Article</p>
                    <p className="text-xs text-muted-foreground">Smith, J. (2023). Artificial Intelligence in Education...</p>
                  </div>
                  
                  <div 
                    className="p-3 bg-muted/50 rounded cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setRawCitation("Johnson, A. B., & Williams, C. D. (2022). Machine Learning Fundamentals. Academic Press.")}
                  >
                    <p className="text-sm font-medium">Book</p>
                    <p className="text-xs text-muted-foreground">Johnson, A. B., & Williams, C. D. (2022). Machine Learning...</p>
                  </div>
                  
                  <div 
                    className="p-3 bg-muted/50 rounded cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setRawCitation("Brown, M. (2023, March 15). The Future of AI. Tech Today. https://techtoday.com/future-ai")}
                  >
                    <p className="text-sm font-medium">Website</p>
                    <p className="text-xs text-muted-foreground">Brown, M. (2023, March 15). The Future of AI...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Results */}
          {formattedCitation && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Quote className="h-5 w-5" />
                      Citation đã format
                    </CardTitle>
                    <CardDescription>
                      Format: {citationStyle}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => copyCitation(formattedCitation.formattedCitation)}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Sao chép
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <p className="leading-relaxed">{formattedCitation.formattedCitation}</p>
                </div>

                {/* Citation Details */}
                {(formattedCitation.title || formattedCitation.author) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formattedCitation.title && (
                      <div>
                        <Badge variant="outline" className="mb-2">Tiêu đề</Badge>
                        <p className="text-sm">{formattedCitation.title}</p>
                      </div>
                    )}
                    
                    {formattedCitation.author && (
                      <div>
                        <Badge variant="outline" className="mb-2">Tác giả</Badge>
                        <p className="text-sm">{formattedCitation.author}</p>
                      </div>
                    )}
                    
                    {formattedCitation.publicationYear && (
                      <div>
                        <Badge variant="outline" className="mb-2">Năm xuất bản</Badge>
                        <p className="text-sm">{formattedCitation.publicationYear}</p>
                      </div>
                    )}
                    
                    {formattedCitation.sourceType && (
                      <div>
                        <Badge variant="outline" className="mb-2">Loại nguồn</Badge>
                        <p className="text-sm">{formattedCitation.sourceType}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Thư viện Citations</h3>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>

          {savedCitations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Quote className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Chưa có citations nào được lưu</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Format citations ở tab đầu tiên để thêm vào thư viện
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {savedCitations.map((citation) => (
                <Card key={citation.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{citation.citation_style}</Badge>
                          <Badge variant="outline">{citation.source_type}</Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">{citation.title}</p>
                        <p className="text-sm text-muted-foreground mb-3">{citation.formatted_citation}</p>
                        <p className="text-xs text-muted-foreground">
                          Lưu: {new Date(citation.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Button
                        onClick={() => copyCitation(citation.formatted_citation)}
                        variant="ghost"
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CitationManager;