<template>
  <v-card class="mx-auto my-4" max-width="300" color="light-blue lighten-4">
    <v-card-title>{{ sensorName }}</v-card-title>
    <v-card-text class="text-center">
      <div class="text-h4 font-weight-bold">{{ value }} {{ unit }}</div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  sensorName: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  unit: {
    type: String,
    default: ''
  }
})
</script>
