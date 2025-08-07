-- Create tables for AI-powered features

-- Outlines table
CREATE TABLE public.outlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  academic_level TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  content JSONB NOT NULL, -- Store outline structure
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Summaries table
CREATE TABLE public.summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_title TEXT NOT NULL,
  file_name TEXT,
  content TEXT NOT NULL, -- Original content
  summary TEXT NOT NULL,
  key_insights JSONB, -- Array of key insights
  summary_length TEXT NOT NULL, -- short, medium, long
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Citations table
CREATE TABLE public.citations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  publication_year INTEGER,
  source_type TEXT NOT NULL, -- book, journal, website, etc.
  citation_style TEXT NOT NULL, -- APA, MLA, Chicago, etc.
  raw_citation TEXT NOT NULL,
  formatted_citation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Documents table for writing projects
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT NOT NULL, -- essay, research, report, etc.
  word_count INTEGER DEFAULT 0,
  readability_score DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for outlines
CREATE POLICY "Users can view their own outlines" 
ON public.outlines 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outlines" 
ON public.outlines 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outlines" 
ON public.outlines 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outlines" 
ON public.outlines 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for summaries
CREATE POLICY "Users can view their own summaries" 
ON public.summaries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own summaries" 
ON public.summaries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries" 
ON public.summaries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries" 
ON public.summaries 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for citations
CREATE POLICY "Users can view their own citations" 
ON public.citations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own citations" 
ON public.citations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own citations" 
ON public.citations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own citations" 
ON public.citations 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Triggers for updating timestamps
CREATE TRIGGER update_outlines_updated_at
  BEFORE UPDATE ON public.outlines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_summaries_updated_at
  BEFORE UPDATE ON public.summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_citations_updated_at
  BEFORE UPDATE ON public.citations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();