<template>
  <div class="app-container" @mousemove="handleMouseMove">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" class="filter-item" style="width: 200px;" placeholder="Title" />
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleSearch">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="Title">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="Lines" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.lines }}
        </template>
      </el-table-column>
      <el-table-column label="Words" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.words }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="Status" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="createTime" label="CreateTime" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="updateTime" label="UpdateTime" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="Action" width="200">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleBlogEditClick(scope.row)">Publish</el-button>
          <el-button type="text" size="small" @click="handleBlogEditClick(scope.row)">Edit</el-button>
          <el-button type="text" size="small" @click="handleBlogDeleteClick(scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />
    <its-markdown :visible.sync="editorVisible" :content="content" @save="handleEditorSave" />
  </div>
</template>

<script>
import { getList, createBlog, updateBlog, deleteBlog } from '@/api/blog'
import Pagination from '@/components/Pagination'
import ItsMarkdown from '@/components/ItsMarkdown'
import { notify_success, notify_failure } from '@/utils/popup.js'

export default {
  components: { ItsMarkdown, Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      total: 0,
      curPosX: 0,
      curPosY: 0,
      listQuery: {
        page: 1,
        size: 10,
        keyword: ''
      },
      editorVisible: false,
      list: null,
      listLoading: true,
      content: { title: 'Untitled', text: '' }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    handleSearch() {
      this.fetchData()
    },
    handleMouseMove(e) {
      this.curPosX = e.clientX
      this.curPosY = e.clientY
    },
    handleEditorSave(obj) {
      if (obj.id !== 0) {
        updateBlog(obj).then(res => {
          this.fetchData()
          if (res.code === 1) {
            notify_success()
          } else {
            notify_failure()
          }
        })
      } else {
        createBlog(obj).then(res => {
          this.fetchData()
          if (res.code === 1) {
            notify_success()
          } else {
            notify_failure()
          }
        })
      }
    },
    handleCreate() {
      this.editorVisible = true
      this.content = {
        id: 0,
        title: 'Untitled',
        text: '',
        x: this.curPosX,
        y: this.curPosY
      }
    },
    handleBlogDeleteClick(row) {
      row.blogSource = ''
      row.blogHtml = ''
      deleteBlog(row).then(res => {
        this.fetchData()
      })
    },
    handleBlogEditClick(row) {
      this.content = {
        id: row.id,
        title: row.title,
        text: decodeURIComponent(escape(window.atob(row.blogSource))),
        x: this.curPosX,
        y: this.curPosY
      }
      this.editorVisible = true
    },
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        if (!this.total) {
          this.total = 0
        }
        this.listLoading = false
      })
    }
  }
}
</script>
