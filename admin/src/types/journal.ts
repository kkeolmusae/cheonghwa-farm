export interface JournalImage {
  id: number;
  image_url: string;
  thumbnail_url: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface Journal {
  id: number;
  title: string;
  content: string;
  images: JournalImage[];
  created_at: string;
  updated_at: string;
}

export interface JournalListItem {
  id: number;
  title: string;
  primary_image: JournalImage | null;
  created_at: string;
}

export interface JournalImageCreate {
  image_url: string;
  thumbnail_url: string | null;
  sort_order: number;
}

export interface JournalCreate {
  title: string;
  content: string;
  created_at?: string;
  images?: JournalImageCreate[];
}

export interface JournalUpdate {
  title?: string;
  content?: string;
  created_at?: string;
  images?: JournalImageCreate[];
}
