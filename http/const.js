export const ERROR_LEVEL = {
  ERROR_LEVEL_01: 1, // 优先级最高 不支持访问 无权限 重定向404
  ERROR_LEVEL_02: 2, // 登出直接回归到登录页面
  ERROR_LEVEL_03: 3, // 一旦出错直接 页面只渲染 header和 footer
  ERROR_LEVEL_04: 4, // 出现错误 但是允许通过 返回 {}
  ERROR_LEVEL_05: 5, // toast
  ERROR_LEVEL_06: 6, // modal
  ERROR_LEVEL_07: 7, // 链接异常 超时 或者 接口访问拒绝
  ERROR_LEVEL_08: 8, // 自定义
  ERROR_LEVEL_09: 9, // 自定义
};

export const STATUS_CODE = {
  COMMON_SUCCESS_EN: 'ok', // 响应成功!
  COMMON_SUCCESS: 200, // 响应成功!
  COMMON_PARAM_ERROR: 300, // 参数错误!
  COMMON_TOKEN_EXPIRE: '400', // 用户未登陆,token过期!
  COMMON_NO_PERMISSION: 500, // 用户没有权限!
  COMMON_BIZ_SERVICE_ERROR: 600, // 业务异常!
  COMMON_SERVICE_ERROR: 700, // 服务器异常!
  BAD_REQUEST_ERROR: 800, // 异常请求!)
  USER_MOBILE_NOT_EXIST: 10000001, // bard异常code 统一10000001开始 用户不存在!
  ORDER_ERROR: 20000001, // bard异常code 统一20000001开始 订单异常
  PRODUCT_ERROR: 30000001, //  diana异常code 统一50000001开始 商品异常
};
