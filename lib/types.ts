export interface BlogPost {
  data: never[];
  id: number;
  title: string;
  slug: string;
  description: string;
  descriptionhtml1: string;
  descriptionhtml2: string;
  tags: string[];
  featured_image: string | null;
  gallery_images: string[];
  date: string;
  author: string;
  category: string;
  status: string;
  show_newsletter?: boolean;
  meta_title?: string;
  meta_keywords?: string;
  aos_duration?: string;
}
