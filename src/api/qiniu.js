import request from '@/utils/request'

export function getUploadToken(params) {
  return request({
    url: '/qiniu/get-token',
    method: 'get',
    params
  })
}
