import { getCookie, parseCookie } from '@/utils/cookieUtil';
import { isServer } from '@/scaffold/env';
import {
  reqLoggerInterceptor, reqHeaderInterceptor, reqErrInterceptor, resInterceptor, resErrInterceptor,
} from './axiosInterceptors';
import axioUtils from './axiosUtils';

export default function (req, isNoResInterceptor) {
  let token = '';
  let ip = '';
  try {
    ip = req && req.headers ? req.headers['x-forwarded-for'] || req.headers.host : '';
  } catch (e) {
    console.log(e);
  }
  if (isServer) {
    const cookies = parseCookie(req.headers.cookie || '');
    token = cookies && cookies._z93 || '';
  } else {
    token = getCookie('_z93');
  }
  const instance = axioUtils();
  // add loggerIntercepter
  instance.interceptors.request.use(reqLoggerInterceptor, reqErrInterceptor);
  // add HeaderIntercepter
  instance.interceptors.request.use(reqHeaderInterceptor({ token }, ip),
    reqErrInterceptor);
  // add resIntercepter
  instance.interceptors.response.use(resInterceptor(isNoResInterceptor), resErrInterceptor(isNoResInterceptor));
  return instance;
}
