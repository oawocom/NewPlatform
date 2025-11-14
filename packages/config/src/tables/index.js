import users from './users';
import projects from './projects';

// Export all table configurations
const tableConfigs = {
  users,
  projects
};

// Helper function to get table config
export const getTableConfig = (tableName) => {
  return tableConfigs[tableName] || null;
};

// Helper function to check if table exists
export const tableExists = (tableName) => {
  return tableName in tableConfigs;
};

export default tableConfigs;
