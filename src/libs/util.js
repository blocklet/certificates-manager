/* eslint-disable import/prefer-default-export */
import moment from 'moment';
import 'moment/locale/zh-cn';

export const formatError = (error) => {
  if (Array.isArray(error.errors)) {
    return error.errors.map((x) => x.message).join('\n');
  }

  if (error.response) {
    return error.response.data;
  }

  return error.message;
};

export const parseQuery = (str) =>
  str
    .replace(/^\?/, '')
    .split('&')
    .map((x) => x.split('='))
    .filter(([key]) => !!key)
    .reduce((memo, x) => {
      const key = x[0];
      const value = decodeURIComponent(x[1]) || true;
      memo[key] = value;
      return memo;
    }, {});

export const domainStatusMap = {
  added: 'primary',
  creating: 'warning',
  generated: 'success',
  renewaling: 'warning',
  error: 'error',
};

export function formatToDatetime(date) {
  if (!date) {
    return '-';
  }

  return moment(date).format('lll');
}

export function isWildcardDomain(domain) {
  return (domain || '').includes('*');
}
