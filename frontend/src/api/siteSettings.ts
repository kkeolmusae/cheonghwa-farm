import apiClient from './client';

export const siteSettingsKeys = {
  all: ['site-settings'] as const,
};

export interface SiteSettingsDTO {
  home_hero_image_url: string | null;
  home_story_image_url: string | null;
  shop_hero_texture_url: string | null;
}

export async function fetchSiteSettings(): Promise<SiteSettingsDTO> {
  const { data } = await apiClient.get<SiteSettingsDTO>('/site-settings');
  return data;
}
