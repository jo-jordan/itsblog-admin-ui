import request from '@/utils/request'

export function getBlogStatistics(params) {
  return request({
    url: '/statistics/blog',
    method: 'get',
    params
  })
}

export function getVisitStatistics(params) {
  return request({
    url: '/statistics/visit',
    method: 'get',
    params
  })
}

export function getBlogReadStatistics(params) {
  return request({
    url: '/statistics/blog-read',
    method: 'get',
    params
  })
}
