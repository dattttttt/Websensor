<template>
  <v-card
    :color="cardColor"
    class="mx-auto my-4 pa-4 text-center transition-all duration-300 hover:shadow-xl hover:scale-105"
    max-width="300"
    rounded="xl"
    elevation="6"
    @mouseover="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <v-icon size="48" class="mb-2">{{ icon }}</v-icon>
    <v-card-title class="text-subtitle-1 font-weight-bold text-uppercase">{{ sensorName }}</v-card-title>
    <v-card-text class="text-h4 font-weight-bold">
      {{ value }} <span v-if="unit">{{ unit }}</span>
    </v-card-text>

    <!-- Tooltip hiển thị khi hover -->
    <v-tooltip v-if="showTooltip" location="top" open>
      <template #activator="{ props }">
        <span v-bind="props"></span>
      </template> 
      <span>
        {{ sensorName }}: {{ value }} {{ unit }} <br />
        Đã cập nhật: {{ lastUpdated }}
      </span>
    </v-tooltip>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  sensorName: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' }
});

const showTooltip = ref(false);
const lastUpdated = new Date().toLocaleTimeString('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

// Tùy biến icon
const iconMap = {
  Temperature: 'mdi-thermometer',
  'CO₂': 'mdi-molecule-co2',
  'Touch Sensor': 'mdi-hand-back-left-outline',
  'Button Sensor': 'mdi-radiobox-marked',
  'Current Sensor': 'mdi-flash'
};

const icon = computed(() => iconMap[props.sensorName] || 'mdi-alert');

// Tùy biến màu nền theo loại và giá trị
const cardColor = computed(() => {
  if (props.sensorName === 'CO₂') {
    const co2 = Number(props.value);
    if (co2 > 1000) return 'red lighten-3';
    if (co2 > 800) return 'orange lighten-3';
    return 'green lighten-4';
  }

  if (props.sensorName === 'Temperature') {
    const temp = Number(props.value);
    if (temp > 30) return 'deep-orange lighten-4';
    if (temp < 18) return 'blue lighten-4';
    return 'light-blue lighten-4';
  }

  if (props.sensorName === 'Touch Sensor') {
    return props.value === 'On' ? 'green lighten-4' : 'grey lighten-2';
  }

  if (props.sensorName === 'Button Sensor') {
    const pressCount = parseInt(props.value.split(' ')[1], 10);
    return pressCount > 4 ? 'deep-purple lighten-4' : 'purple lighten-3';
  }

  if (props.sensorName === 'Current Sensor') {
    const current = Number(props.value);
    if (current > 15) return 'red lighten-3';
    if (current > 10) return 'orange lighten-3';
    return 'blue lighten-4';
  }

  return 'grey lighten-4';
});
</script>

<style scoped>
.hover-scale {
  transition: transform 0.3s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}
</style>
