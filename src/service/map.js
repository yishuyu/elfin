import request from '@/utils/request';

/**
 * 获取地图列表
 * @returns
 */
export const getMapList = () => {
  return request(`/api/mapList`);
};

/**
 * 获取地图数据
 * @returns
 */
export const getMapInfo = ({ mapName, containPixelData }) => {
  return request(`/api/mapInfo`, { params: { mapName, containPixelData } });
};

/**
 * 获取地图上各点数据
 * @returns
 */
export const getPositions = () => {
  return request(`/api/positions`);
};

/**
 * 切换地图
 * @returns
 */
export const switchMap = ({ mapName }) => {
  return request(`/api/switchMap`, { method: 'PUT', body: JSON.stringify({ mapName }) });
};

/**
 * 	机器人定位确认
 * @returns
 */
 export const robotlocationConfirm = () => {
  return request(`/api/locationConfirm`, { method: 'PUT'});
};

/**
 * 注册回调接口
 * @returns
 */
export const registerCallbackApi = ({ robotStatus, resultNotify }) => {
  return request(`/api/callback`, { method: 'PUT', body: JSON.stringify({ robotStatus, resultNotify }) });
};
