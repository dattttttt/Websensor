<template>
  <div>
    <Line v-if="chartDataReady" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

import { ref, onMounted } from 'vue'
import axios from 'axios'

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Temperature (°C)',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4,
      fill: true,
    }
  ]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 15,
      max: 40,
      ticks: {
        stepSize: 5,
        callback: function(value) {
          return value + '°C'
        }
      }
    }
  },
  plugins: {
    legend: {
      display: true
    }
  }
}

const chartDataReady = ref(false)  // 👈 Thêm biến này để render sau khi có data

async function fetchSensorData() {
  try {
    const response = await axios.get('http://localhost:5000/api/sensors')
    const sensorList = response.data

    console.log('Sensor List:', sensorList)

    const temperatureSensors = sensorList.filter(sensor => sensor.name.toLowerCase().includes('temperature'))

    const labels = temperatureSensors.map(sensor => new Date(sensor.timestamp).toLocaleTimeString('en-US', { hour12: false }))
    const data = temperatureSensors.map(sensor => parseFloat(sensor.value))

    console.log('Labels:', labels)
    console.log('Data:', data)

    chartData.value.labels = labels
    chartData.value.datasets[0].data = data

    chartDataReady.value = true  // 👈 Khi có data mới cho phép vẽ biểu đồ
  } catch (error) {
    console.error('Lỗi lấy dữ liệu cảm biến:', error)
  }
}

onMounted(() => {
  fetchSensorData()
})
</script>

<style scoped>
div {
  height: 500px;
}
</style>
