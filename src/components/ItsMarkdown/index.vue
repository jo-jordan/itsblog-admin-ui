<template>
  <transition name="stage-box">
    <div v-show="visible" id="stage">
      <div id="top-action-bar">
        <div id="top-right-action-bar">
          <i v-if="lastText===text" class="el-icon-success top-right-box" />
          <i v-if="lastText!==text" class="el-icon-warning top-right-box" />
          <el-input v-model="title" type="text" size="mini" show-word-limit class="top-right-box" placeholder="Enter a title" />
          <el-button size="mini" type="primary" round @click="handleSave">Save</el-button>
          <el-button size="mini" type="danger" round @click="handleClose">Quit</el-button>
        </div>
        <div id="top-left-action-bar">
          <el-button size="mini" type="text" round @click="hanldeSelectedTextBold">Bold</el-button>
          <el-button size="mini" type="text" round @click="hanldeSelectedTextItalic">Italic</el-button>
        </div>
      </div>
      <div id="editor">
        <textarea ref="textEditArea" v-model="text" />
        <div id="content-preview" v-html="markedText" />
      </div>
      <div id="bottom-action-bar">
        <span class="bottom-text">
          lines: {{ lines }}
        </span>
        <span class="bottom-text">
          words: {{ words }}
        </span>
      </div>
    </div>
  </transition>
</template>

<script>
import marked from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

export default {
  name: 'ItsMarkdown',
  props: {
    beforeClose: {
      type: Function,
      default: () => {}
    },
    visible: {
      type: Boolean,
      default: false
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
    content: {
      type: Object,
      default() {
        return {
          title: 'Untitled',
          text: '',
          x: 0,
          y: 0
        }
      }
    }
  },
  data() {
    return {
      form: {},
      id: 0,
      lastText: '',
      title: '',
      text: '## This is a title',
      closed: false,
      lines: 0,
      words: 0,
      x: 0,
      y: 0
    }
  },
  computed: {
    markedText: function() {
      return marked(this.text, {
        renderer: new marked.Renderer(),
        highlight: function(code) {
          return hljs.highlightAuto(code).value
        }
      })
    }
  },
  watch: {
    content(val) {
      this.id = val.id
      this.title = val.title
      this.text = val.text
      this.lastText = this.text
      this.x = val.x
      this.y = val.y
      this.assignXAndY()
      this.statistics(this.text)
    },
    text(val) {
      this.statistics(val)
    },
    visible(val) {
      if (val) {
        this.closed = false
        this.$emit('open')
        if (this.appendToBody) {
          document.body.appendChild(this.$el)
        }
      } else {
        if (!this.closed) this.$emit('close')
      }
    }
  },
  created() {
    this.lastText = this.text
    this.statistics(this.text)
    this.assignXAndY()
  },
  methods: {
    assignXAndY() {
      console.log('this.x, this.y', this.x, this.y)
      const docStyle = document.documentElement.style
      docStyle.setProperty('--mouse-x', Number(this.x))
      docStyle.setProperty('--mouse-y', Number(this.y))
      console.log('this.x, this.y', Number(docStyle.getPropertyValue('--mouse-x')), docStyle.getPropertyValue('--mouse-y'))
    },
    getCursorSelectedText() {
      const textarea = this.$refs.textEditArea
      const cursorStartPosition = textarea.selectionStart
      const cursorEndPosition = textarea.selectionEnd

      return {
        start: cursorStartPosition,
        end: cursorEndPosition
      }
    },
    hanldeSelectedTextBold() {
      const start = this.getCursorSelectedText().start
      const end = this.getCursorSelectedText().end
      if (start === end) return
      let a = this.text
      const b = '**'
      a = [a.slice(0, end), b, a.slice(end)].join('')
      a = [a.slice(0, start), b, a.slice(start)].join('')
      this.text = a
    },
    hanldeSelectedTextItalic() {
      const start = this.getCursorSelectedText().start
      const end = this.getCursorSelectedText().end
      if (start === end) return
      let a = this.text
      const b = '*'
      a = [a.slice(0, end), b, a.slice(end)].join('')
      a = [a.slice(0, start), b, a.slice(start)].join('')
      this.text = a
    },
    statistics(val) {
      this.lines = val.split(/\r\n|\r|\n/).length
      this.words = val.length
    },
    handleSave() {
      if (typeof this.beforeClose === 'function') {
        this.$emit('save', {
          id: this.id,
          title: this.title,
          blogSource: this.text,
          blogHtml: this.markedText,
          lines: this.lines,
          words: this.words
        })
        this.lastText = this.text
      } else {
        this.hide()
      }
    },
    handleClose() {
      if (this.lastText !== this.text) {
        this.openConfirmDialog()
      } else {
        this.close()
      }
    },
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
      this.closed = true
    },
    openConfirmDialog() {
      this.$confirm('This blog has been edited, you want give it up?', '提示', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }).then(() => {
        this.close()
      }).catch(() => {
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
@keyframes show-editor-box {
  0% {
    transform: translate(calc(var(--mouse-x)*0.5px), calc(var(--mouse-y)*1px));
    border-radius: 40px;
    width: 1200px;
    height: 10px;
  }
  100% {
    transform: translate(0, 0);
    border-radius: 0;
    width: 100%;
    height: 100%;
  }
}

.stage-box-enter-active {
  animation-name: show-editor-box;
  animation-timing-function: ease-in-out;
  animation-duration: .48s;
  animation-fill-mode: forwards;
}

.stage-box-leave-active {
  animation-name: show-editor-box;
  animation-timing-function: ease-in-out;
  animation-duration: .48s;
  animation-fill-mode: forwards;
  animation-direction: reverse;
}

#stage{
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2000;
}
#top-action-bar{
  height: 48px;
  width: 100%;
  background-color: rgb(212, 212, 212);
  position: absolute;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
#bottom-action-bar{
  height: 24px;
  width: 100%;
  background-color: rgb(212, 212, 212);
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: left;
  align-items: center;
}
#content-preview{
  background-color: rgb(223, 223, 223);
}
#editor {
  position: absolute;
  left: 0;
  right: 0;
  top: 48px;
  bottom: 24px;
  width: 100%;
  margin: 0;
  height: 100%;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}
#editor textarea {
  display: inline-block;
  position: fixed;
  top: 48px;
  bottom: 24px;
  left: 0;
  width: 50%;
  vertical-align: top;
  box-sizing: border-box;
  padding: 0 20px;
}
#editor div {
  position: fixed;
  top: 48px;
  bottom: 24px;
  right: 0;
  display: inline-block;
  width: 50%;
  vertical-align: top;
  box-sizing: border-box;
  padding: 0 20px;
  overflow: auto;
}
textarea {
  border: none;
  border-right: 1px solid #ccc;
  resize: none;
  outline: none;
  background-color: #ffffff;
  font-size: 14px;
  font-family: 'Monaco', courier, monospace;
  padding: 20px;
}
#top-right-action-bar{
  display: flex;
  position: absolute;
  right: 16px;
  justify-content: center;
  align-items: center;
}
#top-left-action-bar{
  display: flex;
  position: absolute;
  left: 16px;
}
.bottom-text{
  font-size: 12px;
  margin-left: 14px;
}
.top-right-box{
  margin-right: 14px;
}
</style>
