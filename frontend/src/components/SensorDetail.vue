<template>
  <v-row>
    <!-- Card nhỏ thông tin -->
    <v-col cols="12" md="4">
      <v-card class="info-card pa-4" outlined>
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
            class="mb-3 time-select"
          />
          <div class="text-subtitle-1 value-info">
            <strong>Thời gian:</strong> {{ currentTime }}
          </div>
          <div class="text-subtitle-1 value-info">
            <strong>Giá trị:</strong> {{ latestValue }} {{ latestUnit }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Biểu đồ -->
    <v-col cols="12" md="8">
      <v-card class="chart-card pa-4" outlined>
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
    if (keyword.includes('co2')) keyword = 'co2'
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
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
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
            maxTicksLimit: 10,
            color: '#666'
          }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: props.sensorName, color: '#444', font: { size: 16, weight: 'bold' } }
        }
      },
      plugins: {
        legend: {
          display: true,
          labels: { color: '#444', font: { size: 14 } }
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleFont: { size: 14 },
          bodyFont: { size: 12 },
          padding: 10
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
.info-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.time-select {
  margin-bottom: 12px;
}
.value-info {
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}
.chart-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
}
</style>
