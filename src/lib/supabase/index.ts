
// Re-export all functions from the individual files

// Search history
export { 
  saveSearch, 
  getSearchHistory, 
  getPopularSearches 
} from './search';

// Census data caching
export { 
  getCachedCensusResult, 
  cacheCensusResult 
} from './census';

// Dashboard
export { 
  getDashboardStats 
} from './dashboard';

// Notifications
export { 
  getUserNotifications, 
  markNotificationAsRead, 
  getUserNotificationPreferences, 
  updateNotificationPreference 
} from './notifications';

// Marketing
export { 
  createMarketingJob, 
  getUserMarketingJobs 
} from './marketing';

// Clients
export { 
  addClient, 
  getProfessionalClients 
} from './clients';
