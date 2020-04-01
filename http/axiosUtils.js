import axios from 'axios'; // axios
import qs from 'qs';
// import Config from '@scaffold/config';

axios.defaults.transformRequest.push((data, headers) => {
  if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    try {
      return qs.stringify(JSON.parse(data), { arrayFormat: 'indices', skipNulls: true, allowDots: true });
    } catch (e) {
      return data;
    }
  }
  return data;
});

export default function () {
  const instance = axios.create({
    // baseURL: Config.proxyHost,
    timeout: 30000,
  });
  return instance;
}
