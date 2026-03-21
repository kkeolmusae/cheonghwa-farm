import { apiClient } from './client';

export interface SiteSettingsDTO {
  home_hero_image_url: string | null;
  home_story_image_url: string | null;
  shop_hero_texture_url: string | null;
}

export async function getSiteSettings(): Promise<SiteSettingsDTO> {
  const { data } = await apiClient.get<SiteSettingsDTO>('/admin/site-settings');
  return data;
}

export async function patchSiteSettings(
  patch: Partial<{
    home_hero_image_url: string | null;
    home_story_image_url: string | null;
    shop_hero_texture_url: string | null;
  }>,
): Promise<SiteSettingsDTO> {
  const { data } = await apiClient.patch<SiteSettingsDTO>('/admin/site-settings', patch);
  return data;
}
