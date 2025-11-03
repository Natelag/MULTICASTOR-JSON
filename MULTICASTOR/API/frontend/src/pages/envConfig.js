export const API_BASE_URL = 'http://10.80.62.160:5000';
export const INVENTORY_URL = `${API_BASE_URL}/inventory-merged`;

const envConfig = {
  prod: { label: 'PRODUCTION' },
  diff: { label: 'DIFFUSION' },
  'prod-pp': { label: 'PREPROD PRODUCTION' },
  'diff-pp': { label: 'PREPROD DIFFUSION' },
};

export default envConfig;
