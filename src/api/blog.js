import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/blog/list',
    method: 'get',
    params
  })
}

export function createBlog(data) {
  return request({
    url: '/blog/insert',
    method: 'post',
    data
  })
}

export function updateBlog(data) {
  return request({
    url: '/blog/update',
    method: 'post',
    data
  })
}

export function publishBlog(data) {
  return request({
    url: '/blog/publish',
    method: 'post',
    data
  })
}

export function deleteBlog(data) {
  return request({
    url: '/blog/delete',
    method: 'post',
    data
  })
}
