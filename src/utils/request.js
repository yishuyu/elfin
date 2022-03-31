/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
// @ts-nocheck
import { extend } from 'umi-request';
import { ElMessage } from 'element-plus';
import _ from 'lodash';

// const codeMessage = {
//   200: '服务器成功返回请求的数据。',
//   201: '新建或修改数据成功。',
//   302: '重定向。',
//   202: '一个请求已经进入后台排队（异步任务）。',
//   204: '删除数据成功。',
//   400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
//   401: '用户没有权限（令牌、用户名、密码错误）。',
//   403: '用户得到授权，但是访问是被禁止的。',
//   404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
//   406: '请求的格式不可得。',
//   410: '请求的资源被永久删除，且不会再得到的。',
//   422: '当创建一个对象时，发生一个验证错误。',
//   500: '服务器发生错误，请检查服务器。',
//   502: '网关错误。',
//   503: '服务不可用，服务器暂时过载或维护。',
//   504: '网关超时。',
// };

export const codeMessage = {
  0: '成功',
  [-1]: '系统内部错误',
  [-2]: '参数错误',
  [-3]: '机器人状态异常',
  [-4]: '当前操作不允许',
  [-5]: '资源不存在',
  [-6]: 'json解析失败',
  [-7]: '空指针异常',
  [-8]: 'socket错误 ',
  [-9]: '文件IO错误 ',
  [-10]: '值超出范围',
  [-11]: '数据包格式错误',
  [-100]: '导航目标点不存在',
  [-101]: '导航目标点不可到达',
  [-102]: '导航超时',
  [-103]: '导航取消',
  [-104]: '导航失败',
  [-105]: 'agv api调用失败',
  [-106]: '重定位失败',
  [-200]: '机械臂发生碰撞',
  [-201]: '机械臂目标点不可到达',
  [-202]: '机械臂动作取消',
  [-203]: '机械臂动作超时',
  [-204]: '机械臂api调用失败',
  [-300]: '餐柜食物到达顶层（在到达目标层之前）',
  [-301]: '餐柜升降动作超时',
};

/**
 * 异常处理程序
 */
const errorHandler = (error) => {
  ElMessage({
    message: error,
    type: 'error',
  });
  const { response } = error;
  // if (response && response.status) {
  //   if (response.status === 401) {
  //     window.location.href = `${window.location.protocol}//${window.location.host}/compass-monitor/login`;
  //   } else {
  //     const errorText = codeMessage[response.status] || response.statusText;
  //     message.error(errorText, 3);
  //   }
  // }
  return response;
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
});

const openNotification = (description) => {
  return ElMessage({
    message: description,
    type: 'error',
  });
};

/**
 * @param {*object} url 接口url
 * @param {*object} params 接口相关的参数
 * @param {*object} otherParams 其他的配置
 */

const customRequest = (url, params) =>
  new Promise((resolve, reject) => {
    request(url, params)
      .then((res) => {
        if (!res) {
          return;
        }
        try {
          const code = _.get(res, 'code', 0);
          if (code === 0) {
            resolve(res);
            return;
          }
          if (code < 0) {
            openNotification(codeMessage[code]);
            resolve(res);
          }
        } catch (err) {
          reject(err);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });

export default customRequest;
