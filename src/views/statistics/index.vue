<template>
  <div class="chart-container">
    <div id="blog-statistics-chart" class="child-chart"></div>
    <div id="visit-statistics-chart" class="child-chart"></div>
    <div id="blog-read-chart" class="child-chart-large"></div>
  </div>
</template>

<script>
import { getBlogStatistics, getVisitStatistics, getBlogReadStatistics } from '@/api/statistics'
export default {
  data() {
    return {
      option1: {
        title: {
          text: 'Blog Statistics',
          subtext: 'from lzjlxebr',
          x: 'center'
        },
        xAxis: {
          name : 'date',
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          minInterval: 1,
          name : 'times',
          type: 'value'
        },
        series: [{
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line'
        }]
      },
      chart1: undefined,
      option2: {
        title: {
          text: 'Visit Statistics',
          subtext: 'from lzjlxebr',
          x: 'center'
        },
        xAxis: {
          name : 'date',
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          minInterval: 1,
          name : 'times',
          type: 'value'
        },
        series: [{
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line'
        }]
      },
      chart2: undefined,
      option3: {
        tooltip: {
          trigger: 'axis'
        },
        title: {
          text: 'Blog Read Statistics',
          subtext: 'from lzjlxebr',
          x: 'center'
        },
        xAxis: {
          name : 'date',
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLabel: {
            interval: 0,
            rotate: 20
          }
        },
        yAxis: {
          minInterval: 1,
          name : 'times',
          type: 'value'
        },
        series: [{
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'bar'
        }]
      },
      chart3: undefined
    }
  },
  mounted() {
    this.initChart()
    this.getBlogStatistics()
    this.getVisitStatistics()
    this.getBlogReadStatistics()
  },
  methods: {
    getBlogStatistics() {
      getBlogStatistics().then(res => {
        if (res.code === 1) {
          this.option1.xAxis.data = res.data.x
          this.option1.series[0].data = res.data.y
          this.chart1.setOption(this.option1)
        }
      })
    },
    getVisitStatistics() {
      getVisitStatistics().then(res => {
        if (res.code === 1) {
          this.option2.xAxis.data = res.data.x
          this.option2.series[0].data = res.data.y
          this.chart2.setOption(this.option2)
        }
      })
    },
    getBlogReadStatistics() {
      getBlogReadStatistics().then(res => {
        if (res.code === 1) {
          this.option3.xAxis.data = res.data.x
          this.option3.series[0].data = res.data.y
          this.chart3.setOption(this.option3)
        }
      })
    },
    initChart() {
      this.chart1 = this.$echarts.init(document.getElementById('blog-statistics-chart'))
      this.chart2 = this.$echarts.init(document.getElementById('visit-statistics-chart'))
      this.chart3 = this.$echarts.init(document.getElementById('blog-read-chart'))
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 100%;
  padding: 20px;
}
.child-chart {
  width: 680px;
  height: 400px;
  float: left;
}
.child-chart-large {
  width: 1280px;
  height: 400px;
  float: left;
}
</style>
