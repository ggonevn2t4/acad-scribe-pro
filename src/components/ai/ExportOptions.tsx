import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Code, 
  Database,
  Eye,
  Settings,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OutlineData {
  title: string;
  sections: Array<{
    title: string;
    subsections: Array<{
      title: string;
      points: string[];
      evidence: string[];
    }>;
  }>;
  conclusion: string[];
}

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  extension: string;
  category: "document" | "data" | "web";
}

interface ExportOptionsProps {
  outline: OutlineData;
}

const ExportOptions = ({ outline }: ExportOptionsProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string>("markdown");
  const [exportConfig, setExportConfig] = useState({
    includeEvidence: true,
    includePoints: true,
    includeConclusion: true,
    numbering: "auto",
    indentation: "spaces"
  });
  const [previewContent, setPreviewContent] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  
  const { toast } = useToast();

  const exportFormats: ExportFormat[] = [
    {
      id: "markdown",
      name: "Markdown",
      description: "GitHub-flavored markdown with headers",
      icon: FileText,
      extension: "md",
      category: "document"
    },
    {
      id: "html",
      name: "HTML",
      description: "Structured HTML with CSS styling",
      icon: Code,
      extension: "html",
      category: "web"
    },
    {
      id: "json",
      name: "JSON",
      description: "Structured data format",
      icon: Database,
      extension: "json",
      category: "data"
    },
    {
      id: "csv",
      name: "CSV",
      description: "Comma-separated values for spreadsheets",
      icon: FileSpreadsheet,
      extension: "csv",
      category: "data"
    },
    {
      id: "xml",
      name: "XML",
      description: "Extensible markup language",
      icon: Code,
      extension: "xml",
      category: "data"
    },
    {
      id: "docx_simple",
      name: "Word (Simple)",
      description: "Basic Word document format",
      icon: FileText,
      extension: "docx",
      category: "document"
    },
    {
      id: "latex",
      name: "LaTeX",
      description: "Academic document preparation",
      icon: FileText,
      extension: "tex",
      category: "document"
    },
    {
      id: "txt_structured",
      name: "Structured Text",
      description: "Plain text with clear formatting",
      icon: FileText,
      extension: "txt",
      category: "document"
    }
  ];

  const generateMarkdown = () => {
    let content = `# ${outline.title}\n\n`;
    
    outline.sections.forEach((section, index) => {
      content += `## ${exportConfig.numbering === "auto" ? `${index + 1}. ` : ""}${section.title}\n\n`;
      
      section.subsections.forEach((subsection, subIndex) => {
        content += `### ${exportConfig.numbering === "auto" ? `${index + 1}.${subIndex + 1} ` : ""}${subsection.title}\n\n`;
        
        if (exportConfig.includePoints && subsection.points.length > 0) {
          content += "**Key Points:**\n";
          subsection.points.forEach(point => {
            content += `- ${point}\n`;
          });
          content += "\n";
        }
        
        if (exportConfig.includeEvidence && subsection.evidence.length > 0) {
          content += "**Evidence Needed:**\n";
          subsection.evidence.forEach(evidence => {
            content += `- ${evidence}\n`;
          });
          content += "\n";
        }
      });
    });

    if (exportConfig.includeConclusion && outline.conclusion.length > 0) {
      content += "## Conclusion\n\n";
      outline.conclusion.forEach(point => {
        content += `- ${point}\n`;
      });
    }

    return content;
  };

  const generateHTML = () => {
    let content = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${outline.title}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
        }
        h1 { 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 10px; 
            margin-bottom: 30px;
        }
        h2 { 
            color: #34495e; 
            margin-top: 30px;
            margin-bottom: 15px;
        }
        h3 { 
            color: #7f8c8d; 
            margin-top: 20px;
            margin-bottom: 10px;
        }
        .points, .evidence { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0; 
            border-left: 4px solid #3498db;
        }
        .evidence { border-left-color: #e74c3c; }
        ul { margin: 0; }
        li { margin-bottom: 5px; }
        .conclusion { 
            background: #e8f5e8; 
            padding: 20px; 
            border-radius: 8px; 
            margin-top: 30px;
            border-left: 4px solid #27ae60;
        }
    </style>
</head>
<body>
    <h1>${outline.title}</h1>`;

    outline.sections.forEach((section, index) => {
      content += `    <h2>${exportConfig.numbering === "auto" ? `${index + 1}. ` : ""}${section.title}</h2>\n`;
      
      section.subsections.forEach((subsection, subIndex) => {
        content += `    <h3>${exportConfig.numbering === "auto" ? `${index + 1}.${subIndex + 1} ` : ""}${subsection.title}</h3>\n`;
        
        if (exportConfig.includePoints && subsection.points.length > 0) {
          content += '    <div class="points">\n        <strong>Key Points:</strong>\n        <ul>\n';
          subsection.points.forEach(point => {
            content += `            <li>${point}</li>\n`;
          });
          content += '        </ul>\n    </div>\n';
        }
        
        if (exportConfig.includeEvidence && subsection.evidence.length > 0) {
          content += '    <div class="evidence">\n        <strong>Evidence Needed:</strong>\n        <ul>\n';
          subsection.evidence.forEach(evidence => {
            content += `            <li>${evidence}</li>\n`;
          });
          content += '        </ul>\n    </div>\n';
        }
      });
    });

    if (exportConfig.includeConclusion && outline.conclusion.length > 0) {
      content += '    <div class="conclusion">\n        <h2>Conclusion</h2>\n        <ul>\n';
      outline.conclusion.forEach(point => {
        content += `            <li>${point}</li>\n`;
      });
      content += '        </ul>\n    </div>\n';
    }

    content += `</body>
</html>`;

    return content;
  };

  const generateJSON = () => {
    const data = {
      title: outline.title,
      metadata: {
        exportDate: new Date().toISOString(),
        totalSections: outline.sections.length,
        totalSubsections: outline.sections.reduce((sum, section) => sum + section.subsections.length, 0)
      },
      structure: outline.sections.map((section, index) => ({
        id: index + 1,
        title: section.title,
        subsections: section.subsections.map((subsection, subIndex) => ({
          id: `${index + 1}.${subIndex + 1}`,
          title: subsection.title,
          ...(exportConfig.includePoints && { keyPoints: subsection.points }),
          ...(exportConfig.includeEvidence && { evidenceNeeded: subsection.evidence })
        }))
      })),
      ...(exportConfig.includeConclusion && { conclusion: outline.conclusion })
    };

    return JSON.stringify(data, null, 2);
  };

  const generateCSV = () => {
    let csv = "Section,Subsection,Type,Content\n";
    
    outline.sections.forEach((section, sectionIndex) => {
      section.subsections.forEach((subsection, subIndex) => {
        const sectionNum = exportConfig.numbering === "auto" ? `${sectionIndex + 1}` : "";
        const subsectionNum = exportConfig.numbering === "auto" ? `${sectionIndex + 1}.${subIndex + 1}` : "";
        
        csv += `"${sectionNum} ${section.title}","${subsectionNum} ${subsection.title}","Title","${subsection.title}"\n`;
        
        if (exportConfig.includePoints) {
          subsection.points.forEach(point => {
            csv += `"${sectionNum} ${section.title}","${subsectionNum} ${subsection.title}","Point","${point.replace(/"/g, '""')}"\n`;
          });
        }
        
        if (exportConfig.includeEvidence) {
          subsection.evidence.forEach(evidence => {
            csv += `"${sectionNum} ${section.title}","${subsectionNum} ${subsection.title}","Evidence","${evidence.replace(/"/g, '""')}"\n`;
          });
        }
      });
    });

    if (exportConfig.includeConclusion && outline.conclusion.length > 0) {
      outline.conclusion.forEach(point => {
        csv += `"Conclusion","","Conclusion","${point.replace(/"/g, '""')}"\n`;
      });
    }

    return csv;
  };

  const generateLaTeX = () => {
    let content = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[vietnamese]{babel}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{enumitem}
\\usepackage{geometry}
\\geometry{margin=2.5cm}

\\title{${outline.title}}
\\author{Academic AI Assistant}
\\date{\\today}

\\begin{document}

\\maketitle

`;

    outline.sections.forEach((section, index) => {
      content += `\\section{${section.title}}\n\n`;
      
      section.subsections.forEach((subsection, subIndex) => {
        content += `\\subsection{${subsection.title}}\n\n`;
        
        if (exportConfig.includePoints && subsection.points.length > 0) {
          content += "\\textbf{Key Points:}\n\\begin{itemize}\n";
          subsection.points.forEach(point => {
            content += `    \\item ${point}\n`;
          });
          content += "\\end{itemize}\n\n";
        }
        
        if (exportConfig.includeEvidence && subsection.evidence.length > 0) {
          content += "\\textbf{Evidence Needed:}\n\\begin{itemize}\n";
          subsection.evidence.forEach(evidence => {
            content += `    \\item ${evidence}\n`;
          });
          content += "\\end{itemize}\n\n";
        }
      });
    });

    if (exportConfig.includeConclusion && outline.conclusion.length > 0) {
      content += "\\section{Conclusion}\n\\begin{itemize}\n";
      outline.conclusion.forEach(point => {
        content += `    \\item ${point}\n`;
      });
      content += "\\end{itemize}\n\n";
    }

    content += "\\end{document}";
    return content;
  };

  const generateContent = (formatId: string): string => {
    switch (formatId) {
      case "markdown": return generateMarkdown();
      case "html": return generateHTML();
      case "json": return generateJSON();
      case "csv": return generateCSV();
      case "latex": return generateLaTeX();
      case "txt_structured": return generateMarkdown().replace(/[#*]/g, "");
      case "xml": 
        return `<?xml version="1.0" encoding="UTF-8"?>
<outline>
  <title>${outline.title}</title>
  <sections>
    ${outline.sections.map((section, index) => `
    <section id="${index + 1}">
      <title>${section.title}</title>
      <subsections>
        ${section.subsections.map((sub, subIndex) => `
        <subsection id="${index + 1}.${subIndex + 1}">
          <title>${sub.title}</title>
          ${exportConfig.includePoints ? `<points>${sub.points.map(p => `<point>${p}</point>`).join('')}</points>` : ''}
          ${exportConfig.includeEvidence ? `<evidence>${sub.evidence.map(e => `<item>${e}</item>`).join('')}</evidence>` : ''}
        </subsection>`).join('')}
      </subsections>
    </section>`).join('')}
  </sections>
  ${exportConfig.includeConclusion ? `<conclusion>${outline.conclusion.map(c => `<point>${c}</point>`).join('')}</conclusion>` : ''}
</outline>`;
      default: return generateMarkdown();
    }
  };

  const handlePreview = () => {
    const content = generateContent(selectedFormat);
    setPreviewContent(content);
    setShowPreview(true);
  };

  const handleExport = () => {
    const format = exportFormats.find(f => f.id === selectedFormat);
    if (!format) return;

    const content = generateContent(selectedFormat);
    const blob = new Blob([content], { 
      type: selectedFormat === "json" ? "application/json" : "text/plain" 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${outline.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_outline.${format.extension}`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export thành công!",
      description: `Outline đã được export dưới định dạng ${format.name}`,
    });
  };

  const formatsByCategory = {
    document: exportFormats.filter(f => f.category === "document"),
    data: exportFormats.filter(f => f.category === "data"),
    web: exportFormats.filter(f => f.category === "web")
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Outline
        </CardTitle>
        <CardDescription>
          Chọn định dạng và tùy chỉnh các tùy chọn export
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <Tabs defaultValue="document" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="web">Web</TabsTrigger>
          </TabsList>
          
          {Object.entries(formatsByCategory).map(([category, formats]) => (
            <TabsContent key={category} value={category} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formats.map((format) => {
                  const Icon = format.icon;
                  const isSelected = selectedFormat === format.id;
                  
                  return (
                    <Card 
                      key={format.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{format.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                .{format.extension}
                              </Badge>
                              {isSelected && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Separator />

        {/* Export Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Tùy chọn Export
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Nội dung bao gồm:</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includePoints"
                    checked={exportConfig.includePoints}
                    onCheckedChange={(checked) => 
                      setExportConfig(prev => ({ ...prev, includePoints: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includePoints" className="text-sm">Điểm chính</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeEvidence"
                    checked={exportConfig.includeEvidence}
                    onCheckedChange={(checked) => 
                      setExportConfig(prev => ({ ...prev, includeEvidence: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeEvidence" className="text-sm">Bằng chứng</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeConclusion"
                    checked={exportConfig.includeConclusion}
                    onCheckedChange={(checked) => 
                      setExportConfig(prev => ({ ...prev, includeConclusion: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeConclusion" className="text-sm">Kết luận</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Định dạng:</Label>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="numbering" className="text-xs">Đánh số:</Label>
                  <Select 
                    value={exportConfig.numbering} 
                    onValueChange={(value) => 
                      setExportConfig(prev => ({ ...prev, numbering: value }))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Tự động (1, 2, 3...)</SelectItem>
                      <SelectItem value="none">Không đánh số</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handlePreview} className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Preview - {exportFormats.find(f => f.id === selectedFormat)?.name}
                </DialogTitle>
                <DialogDescription>
                  Xem trước nội dung sẽ được export
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                  {previewContent}
                </pre>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleExport} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Export {exportFormats.find(f => f.id === selectedFormat)?.name}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportOptions;