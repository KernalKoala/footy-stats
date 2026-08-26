export interface DefaultFilters {
  dateFrom?: string;
  dateTo?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  favourite_leagues: number[];
  default_filters: DefaultFilters;
  created_at: string;
  updated_at: string;
}
