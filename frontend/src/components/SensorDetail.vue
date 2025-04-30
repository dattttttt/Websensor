<template>
  <v-row>
    <!-- Card nhỏ thông tin -->
    <v-col cols="12" md="4">
      <v-card class="pa-4" outlined>
        <v-card-title class="text-h6">{{ sensorName }}</v-card-title>
        <v-card-text>
          <v-select
            v-model="timeRange"
            :items="[
              { title: '1 phút', value: 60 * 1000 },
              { title: '5 phút', value: 5 * 60 * 1000 },
              { title: '10 phút', value: 10 * 60 * 1000 },
              { title: '1 giờ', value: 60 * 60 * 1000 }
            ]"
            label="Khoảng thời gian"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <div class="text-subtitle-1">
            <strong>Thời gian:</strong> {{ currentTime }}
          </div>
          <div class="text-subtitle-1">
            <strong>Giá trị:</strong> {{ latestValue }} {{ latestUnit }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Biểu đồ -->
    <v-col cols="12" md="8">
      <v-card class="pa-4" outlined height="500px">
        <Bar v-if="isBarChart" :data="chartData" :options="chartOptions" />
        <Line v-else-if="chartDataReady" :data="chartData" :options="chartOptions" />
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Filler
} from 'chart.js'
import axios from 'axios'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, BarElement, CategoryScale, LinearScale, Filler)

const props = defineProps({ sensorName: String })

const chartData = ref({ labels: [], datasets: [] })
const chartOptions = ref({})
const chartDataReady = ref(false)
const currentTime = ref('')
const latestValue = ref('')
const latestUnit = ref('')
const timeRange = ref(10 * 60 * 1000)
const MAX_DATA = 20
const isBarChart = ref(false)

async function fetchSensorData() {
  try {
    chartDataReady.value = false

    const response = await axios.get('http://localhost:5000/api/sensors')
    const sensorList = response.data

    let keyword = props.sensorName.toLowerCase()
    if (keyword.includes('co2') || keyword.includes('co2')) keyword = 'co2'
    else if (keyword.includes('touch')) keyword = 'touch'
    else if (keyword.includes('button')) keyword = 'button'
    else if (keyword.includes('current')) keyword = 'current'
    else if (keyword.includes('temperature')) keyword = 'temperature'

    isBarChart.value = keyword === 'touch' || keyword === 'button'

    const now = Date.now()
    const filtered = sensorList.filter(sensor => {
      const nameMatch = sensor.name.toLowerCase().includes(keyword)
      const timeMatch = now - new Date(sensor.timestamp).getTime() <= timeRange.value
      return nameMatch && timeMatch
    })

    const sliced = filtered.slice(-MAX_DATA)

    chartData.value.labels = sliced.map(sensor =>
      new Date(sensor.timestamp).toLocaleTimeString('en-US', { hour12: false })
    )

    if (keyword === 'touch') {
      chartData.value = {
        labels: chartData.value.labels,
        datasets: [
          {
            label: 'Chạm (On)',
            data: sliced.map(sensor => sensor.value === 'On' ? 1 : 0),
            backgroundColor: 'rgba(75, 192, 192, 0.7)'
          },
          {
            label: 'Không chạm (Off)',
            data: sliced.map(sensor => sensor.value === 'Off' ? 1 : 0),
            backgroundColor: 'rgba(220, 53, 69, 0.7)'
          }
        ]
      }
    } else {
      chartData.value.datasets = [
        {
          label: props.sensorName,
          data: sliced.map(sensor => {
            if (keyword === 'button') return parseInt(sensor.value.match(/\d+/)?.[0] || '0')
            return parseFloat(sensor.value) || 0
          }),
          backgroundColor: keyword === 'button'
            ? sliced.map(sensor => {
                const combo = parseInt(sensor.value.match(/\d+/)?.[0] || '0')
                const colors = ['#e6194b', '#3cb44b', '#ffe119', '#0082c8', '#f58231', '#911eb4', '#46f0f0', '#f032e6']
                return colors[combo - 1] || '#999'
              })
            : 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(0,0,0,0.2)',
          borderWidth: 1,
          fill: keyword !== 'button',
          tension: 0.4
        }
      ]
    }

    chartOptions.value = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 10
          }
        },
        y: keyword === 'co2'
          ? {
              min: 400,
              max: 2000,
              title: { display: true, text: 'ppm' }
            }
          : keyword === 'button'
          ? {
              min: 0,
              max: 8,
              ticks: { stepSize: 1 },
              title: { display: true, text: 'Combo #' }
            }
          : keyword === 'touch'
          ? {
              min: 0,
              max: 1,
              ticks: {
                stepSize: 1,
                callback: v => (v === 1 ? 'Chạm' : 'Không')
              },
              title: { display: true, text: 'Trạng thái' }
            }
          : {
              beginAtZero: true
            }
      }
    }

    if (sliced.length > 0) {
      const latestSensor = sliced[sliced.length - 1]
      latestValue.value = latestSensor.value
      latestUnit.value = latestSensor.unit
      currentTime.value = new Date(latestSensor.timestamp).toLocaleTimeString('en-US', { hour12: false })
    }

    chartDataReady.value = true
  } catch (error) {
    console.error('Lỗi lấy dữ liệu cảm biến:', error)
  }
}

onMounted(() => {
  fetchSensorData()
  setInterval(fetchSensorData, 3000)
})

watch(() => props.sensorName, () => {
  fetchSensorData()
})
</script>

<style scoped>
.v-card {
  min-height: 150px;
}
</style>
