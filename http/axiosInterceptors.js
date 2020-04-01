/* eslint-disable */
import logger from '@utils/logger';
import { ERROR_LEVEL, STATUS_CODE } from '@utils/http/const';

export const reqHeaderInterceptor = (customHeaders, ip) => (config) => {
  const { method, headers } = config;
  const contentType = config.isKv ? 'application/x-www-form-urlencoded' : 'application/json';
  headers[method]['Content-Type'] = contentType;
  return {
    ...config,
    headers: {
      ...config.headers,
      ...customHeaders,
      'Content-Type': contentType,
      'X-Real-User-IP': ip,
    },
  };
};

export const reqLoggerInterceptor = (config) => {
  const {
    url, data, params, method, headers,
  } = config;
  logger.info(
    `
      -------【reqInfo start】---------
        Method: 【${method}】 
        Url:  【${url}】
        参数: ${JSON.stringify(data || params)}
        content-type: ${headers[method]['Content-Type'] || ''}
      -------【reqInfo end】---------
    `,
  );
  return { ...config, startTime: new Date().getTime() };
};

export const reqErrInterceptor = (error) => {
  logger.error('axios request error: ', error);
  return Promise.reject(error);
};

export const resInterceptor = isNoInterceptor => (res) => {
  // console.log('res', res);
  const { config, data } = res;
  const { status, msg } = data;
  try {
    if (config.responseType === 'blob') {
      logger.info(
        `
        -------【responseinfo start】---------
          Method: 【${config.method}】 
          Url:  【${config.url}】
          耗时: ${(new Date().getTime() - config.startTime) / 1000}s
          -------【end】---------
        `,
      );
      return data;
    }
    // 自定义处理
    if (isNoInterceptor) {
      logger.info(
        `
        -------【responseinfo start】---------
          Http状态: 【${res.status}】 
          Method: 【${config.method}】 
          Url:  【${config.url}】
          耗时: ${(new Date().getTime() - config.startTime) / 1000}s
          业务状态:  【${status}】
          返回数据: ${JSON.stringify(data)}】
          -------【end】---------
        `,
      );
      return data.data;
    }
    logger.info(
      `
      -------【responseinfo start】---------
        Http状态: 【${res.status}
        Method: 【${config.method}】 
        Url:  【${config.url}】
        耗时: ${(new Date().getTime() - config.startTime) / 1000}s
        业务状态:  【${status}】
        返回数据: ${JSON.stringify(data.data)}】
        -------【end】---------
      `,
    );

    // 业务状态处理
    let busErr = null;
    // 业务状态处理
    switch (status) {
      case STATUS_CODE.COMMON_PARAM_ERROR:
      case STATUS_CODE.COMMON_SERVICE_ERROR:
      case STATUS_CODE.BAD_REQUEST_ERROR:
        busErr = Promise.reject({
          level: ERROR_LEVEL.ERROR_LEVEL_03, msg, status, url: res.config.url
        });
        break;
      case STATUS_CODE.COMMON_TOKEN_EXPIRE:
         // location.href = '/sign';
        busErr = Promise.reject({ level: ERROR_LEVEL.ERROR_LEVEL_02, msg: '您未登录，请登录再试', status });
        break;
      case STATUS_CODE.COMMON_BIZ_SERVICE_ERROR:
      case STATUS_CODE.COMMON_NO_PERMISSION:
        busErr = Promise.reject({ level: ERROR_LEVEL.ERROR_LEVEL_01, msg: '您无权限访问当前页面', status });
        break;
      case STATUS_CODE.USER_MOBILE_NOT_EXIST:
      case STATUS_CODE.ORDER_ERROR:
      case STATUS_CODE.PRODUCT_ERROR:
        busErr = Promise.reject({
          level: ERROR_LEVEL.ERROR_LEVEL_05, msg, status, url: res.config.url
        });
        break;
      case STATUS_CODE.COMMON_SUCCESS_EN:
        break;
      default:
        busErr = Promise.reject({
          level: ERROR_LEVEL.ERROR_LEVEL_05, msg, status, url: res.config.url
        });
        break;
    }

    if (busErr) {
      return busErr;
    }
    return data.data;
  } catch (e) {
    logger.error(
      `
        -------【parse res error】---------
          错误原因: ${e}
        --------- 【End】 ---------
      `,
    );
    return Promise.reject({
      level: ERROR_LEVEL.ERROR_LEVEL_05, msg: e.message, status, url: config.url,
    });
  }
};

export const resErrInterceptor = res => (error) => {
  const { response } = error;
  const { data } = response;
  const busStatus = +(data && data.status.res);
  logger.error(
    `
      -------【状态码异常】---------
        URL: 【${response.config.method}】  ${response.config.url}
        HTTP状态码: ${response.status}
        错误状态码status: ${busStatus}
        错误信息: ${data && data.msg}
        message: ${error.message}
        stack: ${error.stack}
      --------- 【End】 ---------
    `,
  );
  let busErr = null;
  if(response.status === 301){
    res.redirect(301, 'https://www.zhifuzi.com/')
    return Promise.reject({ level: 301, msg: '重定向', busStatus: 301 });
  }
  if(response.status === 404){
    res.status(404);    
    return Promise.reject({ level: 404, msg: '页面不存在', busStatus: 404 });
  }
  if (response.status === 502) {
    return Promise.reject({ level: ERROR_LEVEL.ERROR_LEVEL_01, msg: '服务崩溃', busStatus: 500 });
  }
  switch (busStatus) {
    case STATUS_CODE.COMMON_BIZ_SERVICE_ERROR:
      busErr = Promise.reject({ level: ERROR_LEVEL.ERROR_LEVEL_01, msg: data && data.msg, status: busStatus, busStatus: 404 });
      break;
    case STATUS_CODE.COMMON_SERVICE_ERROR:
      break;
    case STATUS_CODE.COMMON_TOKEN_EXPIRE:
      location.href = '/sign';
      busErr = Promise.reject({ level: ERROR_LEVEL.ERROR_LEVEL_02, msg: '您未登录，请登录再试', status: busStatus, busStatus: 400  });
      break;
    case STATUS_CODE.COMMON_NO_PERMISSION:
      busErr = Promise.reject({ level: ERROR_LEVEL.ERROR_LEVEL_01, msg: data && data.msg, status: busStatus, busStatus: 500 });
      break;
    default:
      busErr = Promise.reject({
        level: ERROR_LEVEL.ERROR_LEVEL_01, msg: data && data.msg, status: busStatus, busStatus
      });
      break;
  }
  if (busErr) {
    return busErr;
  }
  return Promise.reject({
    level: ERROR_LEVEL.ERROR_LEVEL_07, msg: data && data.msg, status: busStatus, busStatus, url: error.config.url,
  });
};

// export const resHandler = () => {
// }
