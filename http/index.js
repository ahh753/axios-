import { getCookie, parseCookie } from '@/utils/cookieUtil';
import { isServer } from '@/scaffold/env'; // 环境判断
import {
  reqLoggerInterceptor, reqHeaderInterceptor, reqErrInterceptor, resInterceptor, resErrInterceptor,
} from './axiosInterceptors';
import axioUtils from './axiosUtils'; 

export default function (req, isNoResInterceptor) { // req 和 isNoResInterceptor 是服务端渲染里面的返回
  let token = '';
  let ip = '';
  try {
    ip = req && req.headers ? req.headers['x-forwarded-for'] || req.headers.host : '';
  } catch (e) {
    console.log(e);
  }
  if (isServer) { // 判断在什么环境
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
