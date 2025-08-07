import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, MessageCircle, History, Share2, UserPlus, Clock, Eye, Edit, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  description: string;
  content: string;
  document_type: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

interface Comment {
  id: string;
  content: string;
  position_start?: number;
  position_end?: number;
  created_at: string;
  profiles: {
    display_name: string;
    email: string;
  };
}

interface Version {
  id: string;
  version_number: number;
  content: string;
  change_summary: string;
  created_at: string;
  profiles: {
    display_name: string;
    email: string;
  };
}

const CollaborationTools = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const createProject = async () => {
    if (!newProjectTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tiêu đề project",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('collaboration-manager', {
        body: {
          action: 'create_project',
          userId: user?.id,
          title: newProjectTitle,
          description: newProjectDescription,
          documentType: 'essay',
        },
      });

      if (error) throw error;

      setProjects([data.project, ...projects]);
      setNewProjectTitle("");
      setNewProjectDescription("");
      
      toast({
        title: "Tạo project thành công!",
        description: "Project mới đã được tạo",
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tạo project",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inviteCollaborator = async () => {
    if (!inviteEmail.trim() || !selectedProject) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập email và chọn project",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('collaboration-manager', {
        body: {
          action: 'invite_collaborator',
          projectId: selectedProject.id,
          userId: user?.id,
          email: inviteEmail,
          role: inviteRole,
        },
      });

      if (error) throw error;

      setInviteEmail("");
      
      toast({
        title: "Gửi lời mời thành công!",
        description: `Đã gửi lời mời tới ${inviteEmail}`,
      });
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể gửi lời mời",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedProject) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('collaboration-manager', {
        body: {
          action: 'add_comment',
          projectId: selectedProject.id,
          userId: user?.id,
          content: newComment,
        },
      });

      if (error) throw error;

      setComments([data.comment, ...comments]);
      setNewComment("");
      
      toast({
        title: "Thêm comment thành công!",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm comment",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectVersions = async (projectId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('collaboration-manager', {
        body: {
          action: 'get_project_versions',
          projectId,
          userId: user?.id,
        },
      });

      if (error) throw error;
      setVersions(data.versions || []);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const loadProjectComments = async (projectId: string) => {
    try {
      // First, get all comments for the project
      const { data: commentsData, error: commentsError } = await supabase
        .from('project_comments')
        .select(`
          id,
          content,
          position_start,
          position_end,
          created_at,
          user_id
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      // Get unique user IDs from comments
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      // Create a map of user_id to profile for easy lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Combine comments with profile data
      const transformedData: Comment[] = commentsData.map(comment => ({
        id: comment.id,
        content: comment.content,
        position_start: comment.position_start,
        position_end: comment.position_end,
        created_at: comment.created_at,
        profiles: profilesMap.get(comment.user_id) || { display_name: 'Unknown User', email: '' }
      }));
      
      setComments(transformedData);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    }
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    loadProjectComments(project.id);
    loadProjectVersions(project.id);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="collaboration">Cộng tác</TabsTrigger>
          <TabsTrigger value="versions">Phiên bản</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {/* Create New Project */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Tạo Project Mới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-title">Tiêu đề</Label>
                  <Input
                    id="project-title"
                    placeholder="Nhập tiêu đề project..."
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Mô tả</Label>
                  <Input
                    id="project-description"
                    placeholder="Mô tả ngắn gọn..."
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={createProject} disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo Project
              </Button>
            </CardContent>
          </Card>

          {/* Projects List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedProject?.id === project.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => selectProject(project)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge variant="outline">{project.document_type}</Badge>
                  </div>
                  {project.description && (
                    <CardDescription>{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Cập nhật: {new Date(project.updated_at).toLocaleDateString('vi-VN')}</span>
                    <div className="flex items-center gap-1">
                      {project.owner_id === user?.id ? (
                        <Crown className="h-4 w-4" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                      {project.is_public && <Eye className="h-4 w-4" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          {!selectedProject ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Chọn một project để bắt đầu cộng tác</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Invite Collaborators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Mời cộng tác viên
                  </CardTitle>
                  <CardDescription>
                    Mời người khác cộng tác trên project: {selectedProject.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="invite-email">Email</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="example@email.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Vai trò</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Xem</SelectItem>
                          <SelectItem value="editor">Chỉnh sửa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={inviteCollaborator} disabled={isLoading}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Gửi lời mời
                  </Button>
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Comments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Textarea
                      placeholder="Thêm comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={addComment} disabled={isLoading}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Gửi
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 border rounded-lg">
                        <Avatar>
                          <AvatarFallback>
                            {comment.profiles.display_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {comment.profiles.display_name || comment.profiles.email}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          {!selectedProject ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Chọn một project để xem lịch sử phiên bản</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Lịch sử phiên bản
                </CardTitle>
                <CardDescription>
                  Các phiên bản của project: {selectedProject.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">v{version.version_number}</Badge>
                        <div>
                          <p className="text-sm font-medium">
                            {version.change_summary || 'Không có mô tả'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {version.profiles.display_name || version.profiles.email} • {' '}
                            {new Date(version.created_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Clock className="mr-2 h-4 w-4" />
                        Khôi phục
                      </Button>
                    </div>
                  ))}
                  
                  {versions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Chưa có phiên bản nào</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationTools;