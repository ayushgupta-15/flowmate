export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Session {
  id: string;
  project_id: string;
  name: string;
  status: 'active' | 'ended';
}
