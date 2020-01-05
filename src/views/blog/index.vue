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
      <el-table-column label="Title" width="75">
        <template slot-scope="scope">
          <img width="50px" :src="scope.row.icon">
        </template>
      </el-table-column>
      <el-table-column label="Title" width="195">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column width="150" label="Tags" align="center">
        <template slot-scope="scope">
          {{ scope.row.tags }}
        </template>
      </el-table-column>
      <el-table-column width="120" label="Category" align="center">
        <template slot-scope="scope">
          {{ scope.row.category }}
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
      <el-table-column align="center" fixed="right" label="Action" width="300">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleBlogPublishClick(scope.row)">Publish</el-button>
          <el-button type="text" size="small" @click="handleBlogEditClick(scope.row)">Edit Content</el-button>
          <el-button type="text" size="small" @click="handleBlogEditInfoClick(scope.row)">Edit Info</el-button>
          <el-button type="text" size="small" @click="handleBlogArchiveClick(scope.row)">Archive</el-button>
          <el-button type="text" size="small" @click="handleBlogDeleteClick(scope.row)">Delete</el-button>
          <el-button type="text" size="small" @click="handleBlogDesdroyClick(scope.row)">Desdroy</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />
    <its-markdown ref="itsMarkdown" :visible.sync="editorVisible" :content="content" @save="handleEditorSave" />

    <el-dialog :visible.sync="infoEditorVisible" title="Edit Info">
      <el-form ref="infoForm" :rules="rules" :model="infoModel">
        <el-form-item label="title" prop="title">
          <el-input v-model="infoModel.title" placeholder="title" />
        </el-form-item>
        <el-form-item label="category" prop="category">
          <el-input v-model="infoModel.category" placeholder="category" />
        </el-form-item>
        <el-form-item label="tags" prop="tags">
          <el-input v-model="infoModel.tags" placeholder="tags" />
        </el-form-item>
        <el-form-item label="icon" prop="icon">
          <el-input v-show="false" v-model="infoModel.icon" placeholder="icon" />
          <img :src="infoModel.icon">
          <input id="blogIconFile" ref="files" type="file" class="custom-file-input" @change="upload">
          <label for="blogIconFile" class="el-button el-button--primary el-button--mini is-round">点击上传</label>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="infoEditorVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleInfoUpdate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getList, createBlog, updateBlog, updateBlogInfo, publishBlog, deleteBlog, archiveBlog, destroyBlog, findById } from '@/api/blog'
import { getUploadToken } from '@/api/qiniu'
import * as qiniu from 'qiniu-js'
import Pagination from '@/components/Pagination'
import ItsMarkdown from '@/components/ItsMarkdown'
import { notify_success, notify_failure, pop_error } from '@/utils/popup.js'

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
      imgDomain: 'https://static.itsblog.cn/',
      infoEditorVisible: false,
      infoModel: {
        id: 0,
        icon: '',
        category: '',
        title: '',
        tags: ''
      },
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
      content: { title: 'Untitled', text: '' },
      rules: {
        icon: [
          { required: true, message: 'Not null', trigger: 'change' }
        ],
        category: [
          { required: true, message: 'Not null', trigger: 'change' }
        ],
        title: [
          { required: true, message: 'Not null', trigger: 'change' }
        ],
        tags: [
          { required: true, message: 'Not null', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    handleInfoUpdate() {
      this.$refs.infoForm.validate(valid => {
        if (valid) {
          updateBlogInfo(this.infoModel).then(res => {
            this.fetchData()
          })
          this.infoEditorVisible = false
        }
      })
    },
    handleIconSuccess(res, file) {
      this.infoModel.icon = URL.createObjectURL(file.raw)
    },
    handleBlogPublishClick(row) {
      row.blogSource = ''
      row.blogHtml = ''
      publishBlog(row).then(res => {
        this.fetchData()
      })
    },
    handleBlogDesdroyClick(row) {
      this.$confirm('Destory this blog?', 'Yo', {
        confirmButtonText: 'YES',
        cancelButtonText: 'NOPE',
        type: 'warning'
      }).then(() => {
        destroyBlog({ id: row.id }).then(res => {
          if (res.code === 1) {
            this.fetchData()
            this.$message({
              type: 'success',
              message: 'Destroyed!'
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Cancelled'
        })
      })
    },
    handleBlogArchiveClick(row) {
      archiveBlog({ id: row.id }).then(res => {
        this.fetchData()
      })
    },
    handleSearch() {
      this.fetchData()
    },
    handleMouseMove(e) {
      this.curPosX = e.clientX
      this.curPosY = e.clientY
    },
    handleEditorSave(obj) {
      console.log(obj)
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
            this.$refs.itsMarkdown.updateId(res.data)
          } else {
            notify_failure()
          }
        })
      }
    },
    upload(event) {
      const files = event.target.files
      const file = files[0]
      getUploadToken({ fileKey: file.name }).then(response => {
        const that = this
        if (response.code === 1) {
          const token = response.data
          var observer = {
            next(res) {},
            error(err) {
              pop_error(err)
            },
            complete() {
              that.infoModel.icon = that.imgDomain + file.name
            }
          }

          var config = {
            useCdnDomain: true,
            region: qiniu.region.z2
          }
          var putExtra = {
            fname: file.name,
            params: {},
            mimeType: ['image/png', 'image/jpeg', 'image/gif', 'application/pdf', 'image/svg+xml', 'image/x-icon']
          }
          const observable = qiniu.upload(file, file.name, token, putExtra, config)
          observable.subscribe(observer) // 上传开始
        } else {
          pop_error(response.msg)
        }
      })
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
      deleteBlog(row).then(res => {
        this.fetchData()
      })
    },
    handleBlogEditInfoClick(row) {
      this.infoEditorVisible = true
      this.infoModel = {
        id: row.id,
        icon: row.icon,
        category: row.category,
        title: row.title,
        tags: row.tags
      }
    },
    handleBlogEditClick(row) {
      findById({ id: row.blogSourceId }).then(res => {
        if (res.code === 1) {
          this.content = {
            id: row.id,
            title: row.title,
            text: decodeURIComponent(escape(window.atob(res.data.blogSource))),
            x: this.curPosX,
            y: this.curPosY
          }
        }
        this.editorVisible = true
      })
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

<style lang="scss" scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
