<template>
  <v-app>
    <!-- Header -->
    <v-app-bar app color="light-blue lighten-2" flat height="100">
      <v-container class="d-flex align-center">
        <!-- ✅ Hình chữ nhật thay avatar tròn -->
        <img src="/logo.png" alt="Logo TOAMUSEN" style="height: 80px; width: auto; margin-right: 16px;" />
        <span class="text-h5 font-weight-bold">TOAMUSEN</span>
      </v-container>
    </v-app-bar>

    <!-- Sidebar -->
    <v-navigation-drawer
      app
      color="light-blue lighten-4"
      width="220"
      class="pa-3"
    >
      <v-list dense>
        <v-list-item
          v-for="item in menuItems"
          :key="item"
          @click="selectedPage = item"
          :class="{ 'bg-blue lighten-2 white--text': selectedPage === item }"
          rounded
        >
          <v-list-item-title class="text-subtitle-1 font-weight-medium">
            {{ item }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Nội dung chính -->
    <v-main>
      <v-container class="py-8">
        <h2 class="text-h5 font-weight-bold mb-6 text-blue-darken-2">{{ selectedPage }}</h2>

        <template v-if="selectedPage === 'Tổng Quan'">
          <v-row>
            <v-col cols="12" sm="6" md="4" v-for="sensor in sensors" :key="sensor.name">
              <SensorCard :sensorName="sensor.name" :value="sensor.value" :unit="sensor.unit" />
            </v-col>
          </v-row>
        </template>

        <template v-else>
          <SensorDetail :sensorName="selectedPage" />
        </template>
      </v-container>
    </v-main>

    <!-- ✅ Footer với thời gian realtime -->
    <v-footer app color="light-blue lighten-3" padless>
      <v-col class="text-center text-body-2 py-3">
        {{ currentTime }}
        <br />
        © 2025 Dự án Cảm Biến Mockup – All rights reserved
      </v-col>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SensorCard from './components/SensorCard.vue'
import SensorDetail from './components/SensorDetail.vue'
import axios from 'axios'

// Menu bên trái
const menuItems = ['Tổng Quan', 'Temperature', 'CO₂', 'Touch Sensor', 'Button Sensor', 'Current Sensor']
const selectedPage = ref('Tổng Quan')

// Mock dữ liệu cảm biến
const getRandomTemperature = () => (20 + Math.random() * 15).toFixed(1)
const getRandomCO2 = () => Math.floor(400 + Math.random() * 1600)
const getRandomTouch = () => (Math.random() > 0.5 ? 'On' : 'Off')
const getRandomButton = () => {
  const randomCombo = Math.floor(Math.random() * 8) + 1
  return `Pressed ${randomCombo}`
}
const getRandomCurrent = () => (Math.random() * 20).toFixed(2)

const sensors = ref([
  { name: 'Temperature', value: getRandomTemperature(), unit: '°C' },
  { name: 'CO₂', value: getRandomCO2(), unit: 'ppm' },
  { name: 'Touch Sensor', value: getRandomTouch(), unit: '' },
  { name: 'Button Sensor', value: getRandomButton(), unit: '' },
  { name: 'Current Sensor', value: getRandomCurrent(), unit: 'A' },
])

// Gửi dữ liệu mỗi 3 giây
async function sendSensorData(sensor) {
  try {
    await axios.post('http://localhost:5000/api/sensors', sensor)
    console.log('Đã gửi dữ liệu sensor:', sensor)
  } catch (error) {
    console.error('Lỗi khi gửi dữ liệu sensor:', error)
  }
}

onMounted(() => {
  setInterval(() => {
    sensors.value[0].value = getRandomTemperature()
    sensors.value[1].value = getRandomCO2()
    sensors.value[2].value = getRandomTouch()
    sensors.value[3].value = getRandomButton()
    sensors.value[4].value = getRandomCurrent()

    sensors.value.forEach(sensor => {
      sendSensorData({
        name: sensor.name,
        value: sensor.value,
        unit: sensor.unit
      })
    })
  }, 3000)
})

// ✅ Thời gian thực tế cho footer
const currentTime = ref('')
onMounted(() => {
  const updateClock = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' - ' + now.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  updateClock()
  setInterval(updateClock, 1000)
})
</script>

<style scoped>
.v-list-item {
  transition: 0.3s;
  cursor: pointer;
}
.v-list-item:hover {
  background-color: #90caf9 !important;
  color: white;
}
</style>
