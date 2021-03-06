import axios from 'axios';

axios.defaults.timeout = 200000;

axios.interceptors.request.use((config) => {
  const prefix = window.blocklet ? window.blocklet.prefix : window.env.apiPrefix;
  config.baseURL = prefix || '';

  config.url = `/api${config.url}`;

  return config;
});

export default axios;
