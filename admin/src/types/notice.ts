export interface Notice {
  id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoticeCreate {
  title: string;
  content: string;
  is_pinned?: boolean;
}

export interface NoticeUpdate {
  title?: string;
  content?: string;
  is_pinned?: boolean;
}
