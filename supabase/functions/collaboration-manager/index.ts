import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, projectId, userId, ...data } = await req.json();
    
    const supabaseUrl = "https://uixogobytjepprqjvvtw.supabase.co";
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseServiceKey) {
      throw new Error('Supabase service key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Collaboration action:', action, { projectId, userId });

    switch (action) {
      case 'create_project':
        const { title, description, documentType } = data;
        const { data: project, error: createError } = await supabase
          .from('projects')
          .insert({
            owner_id: userId,
            title,
            description,
            document_type: documentType || 'essay',
            content: '',
          })
          .select()
          .single();

        if (createError) throw createError;
        return new Response(JSON.stringify({ project }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'invite_collaborator':
        const { email, role } = data;
        
        // Find user by email
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', email)
          .single();

        if (profileError || !profiles) {
          return new Response(JSON.stringify({ error: 'Không tìm thấy người dùng với email này' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: invitation, error: inviteError } = await supabase
          .from('project_collaborators')
          .insert({
            project_id: projectId,
            user_id: profiles.user_id,
            role: role || 'viewer',
            invited_by: userId,
          })
          .select()
          .single();

        if (inviteError) throw inviteError;
        return new Response(JSON.stringify({ invitation }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'accept_invitation':
        const { data: accepted, error: acceptError } = await supabase
          .from('project_collaborators')
          .update({ accepted_at: new Date().toISOString() })
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .select()
          .single();

        if (acceptError) throw acceptError;
        return new Response(JSON.stringify({ collaboration: accepted }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'add_comment':
        const { content, positionStart, positionEnd, parentId } = data;
        const { data: comment, error: commentError } = await supabase
          .from('project_comments')
          .insert({
            project_id: projectId,
            user_id: userId,
            content,
            position_start: positionStart,
            position_end: positionEnd,
            parent_id: parentId,
          })
          .select(`
            *,
            profiles!project_comments_user_id_fkey(display_name, email)
          `)
          .single();

        if (commentError) throw commentError;
        return new Response(JSON.stringify({ comment }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'update_project':
        const { content, changeSummary } = data;
        
        // Update project content
        const { data: updatedProject, error: updateError } = await supabase
          .from('projects')
          .update({ 
            content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ project: updatedProject }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_project_versions':
        const { data: versions, error: versionsError } = await supabase
          .from('project_versions')
          .select(`
            *,
            profiles!project_versions_created_by_fkey(display_name, email)
          `)
          .eq('project_id', projectId)
          .order('version_number', { ascending: false });

        if (versionsError) throw versionsError;
        return new Response(JSON.stringify({ versions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'restore_version':
        const { versionId } = data;
        
        // Get version content
        const { data: version, error: versionError } = await supabase
          .from('project_versions')
          .select('content')
          .eq('id', versionId)
          .single();

        if (versionError) throw versionError;

        // Update project with version content
        const { data: restoredProject, error: restoreError } = await supabase
          .from('projects')
          .update({ 
            content: version.content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId)
          .select()
          .single();

        if (restoreError) throw restoreError;
        return new Response(JSON.stringify({ project: restoredProject }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in collaboration-manager function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});