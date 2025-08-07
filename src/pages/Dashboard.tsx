import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, PenTool, BookOpen, Quote, Shield, Users } from "lucide-react";
import OutlineGenerator from "@/components/ai/OutlineGenerator";
import WritingAssistant from "@/components/ai/WritingAssistant";
import DocumentSummarizer from "@/components/ai/DocumentSummarizer";
import CitationManager from "@/components/ai/CitationManager";
import PlagiarismDetector from "@/components/ai/PlagiarismDetector";
import CollaborationTools from "@/components/ai/CollaborationTools";
import Header from "@/components/Header";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen surface-elevated flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen surface-elevated">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">AI Writing Studio</h1>
          <p className="text-subtle">Công cụ AI hỗ trợ viết học thuật và nghiên cứu</p>
        </div>

        <Tabs defaultValue="outline" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Outline Generator
            </TabsTrigger>
            <TabsTrigger value="writing" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Writing Assistant
            </TabsTrigger>
            <TabsTrigger value="summarizer" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Document Summarizer
            </TabsTrigger>
            <TabsTrigger value="citations" className="flex items-center gap-2">
              <Quote className="h-4 w-4" />
              Citation Manager
            </TabsTrigger>
            <TabsTrigger value="plagiarism" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Plagiarism Detector
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Collaboration Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="outline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Smart Outline Generator
                </CardTitle>
                <CardDescription>
                  Tạo outline chi tiết cho bài viết học thuật với AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OutlineGenerator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="writing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Paragraph Writer Assistant
                </CardTitle>
                <CardDescription>
                  AI hỗ trợ viết văn bản với nhiều phong cách khác nhau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WritingAssistant />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summarizer">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Document Summarizer
                </CardTitle>
                <CardDescription>
                  Tóm tắt tài liệu và trích xuất insights quan trọng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentSummarizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="citations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Quote className="h-5 w-5" />
                  Citation Manager
                </CardTitle>
                <CardDescription>
                  Quản lý và format citations theo chuẩn học thuật
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CitationManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plagiarism">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Plagiarism Detector
                </CardTitle>
                <CardDescription>
                  Kiểm tra đạo văn và đưa ra gợi ý paraphrase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlagiarismDetector />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaboration">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Collaboration Tools
                </CardTitle>
                <CardDescription>
                  Chia sẻ projects và cộng tác với advisor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CollaborationTools />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;