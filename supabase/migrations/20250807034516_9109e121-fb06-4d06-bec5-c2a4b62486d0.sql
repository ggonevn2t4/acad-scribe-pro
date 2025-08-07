-- Create tables for Plagiarism Detector and Collaboration Tools

-- Projects table for collaborative work
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL DEFAULT '',
  document_type TEXT NOT NULL DEFAULT 'essay',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project collaborators table
CREATE TABLE public.project_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer', -- owner, editor, viewer
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(project_id, user_id)
);

-- Comments on projects
CREATE TABLE public.project_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position_start INTEGER, -- Character position for inline comments
  position_end INTEGER,
  parent_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE, -- For replies
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project versions for version control
CREATE TABLE public.project_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  change_summary TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, version_number)
);

-- Plagiarism check results
CREATE TABLE public.plagiarism_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  file_name TEXT,
  overall_similarity DECIMAL NOT NULL DEFAULT 0,
  sources_found JSONB DEFAULT '[]'::jsonb, -- Array of source objects
  suggestions JSONB DEFAULT '[]'::jsonb, -- Paraphrasing suggestions
  check_status TEXT NOT NULL DEFAULT 'completed', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plagiarism_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view projects they own or collaborate on" 
ON public.projects 
FOR SELECT 
USING (
  owner_id = auth.uid() OR 
  is_public = true OR
  id IN (
    SELECT project_id FROM public.project_collaborators 
    WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
  )
);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Project owners and editors can update projects" 
ON public.projects 
FOR UPDATE 
USING (
  owner_id = auth.uid() OR
  id IN (
    SELECT project_id FROM public.project_collaborators 
    WHERE user_id = auth.uid() AND role IN ('owner', 'editor') AND accepted_at IS NOT NULL
  )
);

CREATE POLICY "Project owners can delete projects" 
ON public.projects 
FOR DELETE 
USING (owner_id = auth.uid());

-- RLS Policies for project_collaborators
CREATE POLICY "Users can view collaborations for accessible projects" 
ON public.project_collaborators 
FOR SELECT 
USING (
  user_id = auth.uid() OR
  project_id IN (
    SELECT id FROM public.projects 
    WHERE owner_id = auth.uid() OR 
    id IN (
      SELECT project_id FROM public.project_collaborators 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  )
);

CREATE POLICY "Project owners can manage collaborators" 
ON public.project_collaborators 
FOR ALL 
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE owner_id = auth.uid()
  )
);

-- RLS Policies for project_comments
CREATE POLICY "Users can view comments on accessible projects" 
ON public.project_comments 
FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE owner_id = auth.uid() OR 
    is_public = true OR
    id IN (
      SELECT project_id FROM public.project_collaborators 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  )
);

CREATE POLICY "Collaborators can create comments" 
ON public.project_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  project_id IN (
    SELECT id FROM public.projects 
    WHERE owner_id = auth.uid() OR 
    id IN (
      SELECT project_id FROM public.project_collaborators 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.project_comments 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" 
ON public.project_comments 
FOR DELETE 
USING (user_id = auth.uid());

-- RLS Policies for project_versions
CREATE POLICY "Users can view versions of accessible projects" 
ON public.project_versions 
FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE owner_id = auth.uid() OR 
    id IN (
      SELECT project_id FROM public.project_collaborators 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  )
);

CREATE POLICY "System can create versions" 
ON public.project_versions 
FOR INSERT 
WITH CHECK (true); -- Will be controlled by application logic

-- RLS Policies for plagiarism_checks
CREATE POLICY "Users can view their own plagiarism checks" 
ON public.plagiarism_checks 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own plagiarism checks" 
ON public.plagiarism_checks 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Triggers for updating timestamps
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_comments_updated_at
  BEFORE UPDATE ON public.project_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create version when project is updated
CREATE OR REPLACE FUNCTION public.create_project_version()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create new version entry
  INSERT INTO public.project_versions (
    project_id, 
    version_number, 
    content, 
    change_summary,
    created_by
  )
  SELECT 
    NEW.id,
    COALESCE(MAX(version_number), 0) + 1,
    OLD.content,
    'Auto-saved version',
    NEW.owner_id
  FROM public.project_versions 
  WHERE project_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create versions
CREATE TRIGGER create_version_on_project_update
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  WHEN (OLD.content IS DISTINCT FROM NEW.content)
  EXECUTE FUNCTION public.create_project_version();