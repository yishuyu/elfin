import request from '@/utils/request';

/**
 * 获取机器人信息
 * @returns
 */
export const getRobotInfoApi = () => {
  return request(`/api/robotInfos`);
};

/**
 * 机器人导航功能
 * @returns
 */
export const robotNavigationApi = (params) => {
  return request(`/api/navigation`, { method: 'PUT', body: JSON.stringify(params) });
};

/**
 * 获取导航结果
 * @returns
 */
export const getNavigationResultApi = () => {
  return request(`/api/resultNotify`);
};

/**
 * 机器人状态变更回调地址
 * @returns
 */
export const robotStatusCallbackApi = () => {
  return request(`/api/robotStatus`);
};

/**
 * 机械臂控制
 * @returns
 */
export const ctrlArmApi = (params) => {
  return request(`/api/ctrlArm`, { method: 'PUT', body: JSON.stringify(params) });
};

/**
 * 任务控制
 * @returns
 */
export const ctrlTask = (params) => {
  return request(`/api/ctrlTask`, { method: 'PUT', body: JSON.stringify(params) });
};

/**
 * 清除错误信息
 * @returns
 */
export const deleteErrors = () => {
  return request(`/api/errors`, { method: 'DELETE' });
};


/**
 * 回原点
 * @returns
 */
 export const armBackOrigin = () => {
    return request(`/api/armGoHomePose`, { method: 'PUT' });
  };

  export const armEndOrigin = (params) => {
    return request(`/api/ctrlArmMove`, { method: 'PUT',body: JSON.stringify(params) });
  };

  /**
 * 开启/关闭零力示教
 * @returns
 */

   export const startArmZeroForce = (params) => {
    return request(`/api/startArmZeroForce`, { method: 'PUT',body: JSON.stringify(params) });
  };
  