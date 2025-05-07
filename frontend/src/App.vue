<template>
  <v-app>
    <!-- Header -->
    <v-app-bar app color="blue-darken-4" flat height="100">
      <v-container class="d-flex align-center">
        <!-- ✅ Logo hình tròn với hiệu ứng shadow -->
        <v-avatar size="80" class="me-4 elevation-8">
          <img src="/logo.png" alt="Logo TOAMUSEN" />
        </v-avatar>
        <span class="text-h4 font-weight-bold white--text">TOAMUSEN</span>
        <v-spacer></v-spacer>
      </v-container>
    </v-app-bar>

    <!-- Sidebar -->
    <v-navigation-drawer app color="#223a70" width="240" permanent class="sidebar">
      <v-list dense>
        <v-list-item-group v-model="selectedPage">
          <v-list-item
            v-for="item in menuItems"
            :key="item.name"
            :value="item.name"
            class="sidebar-item"
            rounded
            @click="selectedPage = item.name"
          >
            <div class="sidebar-item-inner">
              <v-icon size="28" class="sidebar-icon">{{ item.icon }}</v-icon>
              <span class="sidebar-title">{{ item.name }}</span>
            </div>
          </v-list-item>
        </v-list-item-group>
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

    <!-- Footer -->
    <v-footer app color="blue-darken-3" padless>
      <v-col class="text-center text-body-2 py-3 white--text">
        {{ currentTime }}<br />
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

// Menu bên trái với biểu tượng (Sửa icon Touch Sensor)
const menuItems = [
  { name: 'Tổng Quan', icon: 'mdi-view-dashboard' },
  { name: 'Temperature', icon: 'mdi-thermometer' },
  { name: 'CO₂', icon: 'mdi-molecule-co2' },
  { name: 'Touch Sensor', icon: 'mdi-hand-back-left-outline' },
  { name: 'Button Sensor', icon: 'mdi-radiobox-marked' },
  { name: 'Current Sensor', icon: 'mdi-flash' }
]
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
.sidebar {
  background-color: #223a70 !important;
}
.sidebar-item {
  padding: 12px 16px;
  transition: all 0.3s ease-in-out;
}
.sidebar-item-inner {
  display: flex;
  align-items: center;
}
.sidebar-icon {
  margin-right: 16px;
  color: #ffffff;
}
.sidebar-title {
  font-weight: 500;
  color: #ffffff;
}
.sidebar-item:hover {
  background-color: #1e88e5 !important;
  transform: scale(1.02);
}
.text-h4 {
  font-size: 2.25rem;
}
</style>
