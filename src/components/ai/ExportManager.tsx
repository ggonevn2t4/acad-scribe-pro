import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileSpreadsheet, Image, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

interface Project {
  id: string;
  title: string;
  content: string;
  document_type: string;
  created_at: string;
  updated_at: string;
}

interface ExportManagerProps {
  selectedProject: Project | null;
}

type ExportFormat = "docx" | "pdf" | "txt" | "html";

const ExportManager = ({ selectedProject }: ExportManagerProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");
  const { toast } = useToast();

  const exportFormats = [
    { value: "pdf", label: "PDF Document", icon: FileText, description: "Portable Document Format" },
    { value: "docx", label: "Word Document", icon: FileSpreadsheet, description: "Microsoft Word format" },
    { value: "txt", label: "Plain Text", icon: FileText, description: "Simple text file" },
    { value: "html", label: "HTML", icon: Image, description: "Web page format" },
  ];

  const exportToPDF = async (project: Project) => {
    try {
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text(project.title, 20, 30);
      
      // Add metadata
      pdf.setFontSize(12);
      pdf.text(`Document Type: ${project.document_type}`, 20, 50);
      pdf.text(`Created: ${new Date(project.created_at).toLocaleDateString('vi-VN')}`, 20, 60);
      pdf.text(`Updated: ${new Date(project.updated_at).toLocaleDateString('vi-VN')}`, 20, 70);
      
      // Add content
      pdf.setFontSize(11);
      const splitContent = pdf.splitTextToSize(project.content || "No content available", 170);
      pdf.text(splitContent, 20, 90);
      
      // Save the PDF
      pdf.save(`${project.title}.pdf`);
      
      toast({
        title: "Xuất PDF thành công!",
        description: `File ${project.title}.pdf đã được tải xuống`,
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        variant: "destructive",
        title: "Lỗi xuất PDF",
        description: "Không thể xuất file PDF",
      });
    }
  };

  const exportToWord = async (project: Project) => {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: project.title,
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Document Type: ${project.document_type}`,
                  break: 1,
                }),
                new TextRun({
                  text: `Created: ${new Date(project.created_at).toLocaleDateString('vi-VN')}`,
                  break: 1,
                }),
                new TextRun({
                  text: `Updated: ${new Date(project.updated_at).toLocaleDateString('vi-VN')}`,
                  break: 2,
                }),
              ],
            }),
            new Paragraph({
              text: project.content || "No content available",
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${project.title}.docx`);
      
      toast({
        title: "Xuất Word thành công!",
        description: `File ${project.title}.docx đã được tải xuống`,
      });
    } catch (error) {
      console.error('Error exporting Word:', error);
      toast({
        variant: "destructive",
        title: "Lỗi xuất Word",
        description: "Không thể xuất file Word",
      });
    }
  };

  const exportToText = async (project: Project) => {
    try {
      const content = `${project.title}\n\n` +
                     `Document Type: ${project.document_type}\n` +
                     `Created: ${new Date(project.created_at).toLocaleDateString('vi-VN')}\n` +
                     `Updated: ${new Date(project.updated_at).toLocaleDateString('vi-VN')}\n\n` +
                     `${project.content || "No content available"}`;
      
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `${project.title}.txt`);
      
      toast({
        title: "Xuất Text thành công!",
        description: `File ${project.title}.txt đã được tải xuống`,
      });
    } catch (error) {
      console.error('Error exporting text:', error);
      toast({
        variant: "destructive",
        title: "Lỗi xuất Text",
        description: "Không thể xuất file Text",
      });
    }
  };

  const exportToHTML = async (project: Project) => {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .content { line-height: 1.6; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>${project.title}</h1>
    <div class="metadata">
        <p><strong>Document Type:</strong> ${project.document_type}</p>
        <p><strong>Created:</strong> ${new Date(project.created_at).toLocaleDateString('vi-VN')}</p>
        <p><strong>Updated:</strong> ${new Date(project.updated_at).toLocaleDateString('vi-VN')}</p>
    </div>
    <div class="content">${project.content || "No content available"}</div>
</body>
</html>`;
      
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      saveAs(blob, `${project.title}.html`);
      
      toast({
        title: "Xuất HTML thành công!",
        description: `File ${project.title}.html đã được tải xuống`,
      });
    } catch (error) {
      console.error('Error exporting HTML:', error);
      toast({
        variant: "destructive",
        title: "Lỗi xuất HTML",
        description: "Không thể xuất file HTML",
      });
    }
  };

  const handleExport = async () => {
    if (!selectedProject) {
      toast({
        variant: "destructive",
        title: "Không có project",
        description: "Vui lòng chọn một project để xuất",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      switch (exportFormat) {
        case "pdf":
          await exportToPDF(selectedProject);
          break;
        case "docx":
          await exportToWord(selectedProject);
          break;
        case "txt":
          await exportToText(selectedProject);
          break;
        case "html":
          await exportToHTML(selectedProject);
          break;
        default:
          throw new Error("Unsupported export format");
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Lỗi xuất file",
        description: "Đã xảy ra lỗi khi xuất file",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!selectedProject ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Download className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chọn một project để xuất file</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Thông tin Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tiêu đề:</span>
                  <span>{selectedProject.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Loại tài liệu:</span>
                  <Badge variant="outline">{selectedProject.document_type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Số từ:</span>
                  <span>{selectedProject.content ? selectedProject.content.split(' ').length : 0} từ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Cập nhật lần cuối:</span>
                  <span>{new Date(selectedProject.updated_at).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Xuất tài liệu
              </CardTitle>
              <CardDescription>
                Chọn định dạng để xuất project của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Định dạng xuất</label>
                <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exportFormats.map((format) => {
                      const Icon = format.icon;
                      return (
                        <SelectItem key={format.value} value={format.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{format.label}</div>
                              <div className="text-xs text-muted-foreground">{format.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Format Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  const isSelected = exportFormat === format.value;
                  return (
                    <Card 
                      key={format.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setExportFormat(format.value as ExportFormat)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className={`h-8 w-8 mx-auto mb-2 ${
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <div className="text-sm font-medium">{format.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format.description}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Export Button */}
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full"
                size="lg"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Đang xuất..." : `Xuất ${exportFormats.find(f => f.value === exportFormat)?.label}`}
              </Button>
            </CardContent>
          </Card>

          {/* Export History (Future feature) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Lịch sử xuất file
              </CardTitle>
              <CardDescription>
                Các file đã xuất gần đây (Tính năng sẽ được phát triển)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Chưa có lịch sử xuất file</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ExportManager;