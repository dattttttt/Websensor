const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(bodyParser.json())

app.get('/api/sensors', async (req, res) => {
  try {
    const sensors = await Sensor.find().sort({ timestamp: 1 }) // Lấy theo thứ tự thời gian tăng dần
    res.json(sensors)
  } catch (err) {
    res.status(500).send(err)
  }
})

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/sensor_data', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Schema Mongoose
const SensorSchema = new mongoose.Schema({
  name: String,
  value: String,
  unit: String,
  timestamp: { type: Date, default: Date.now }
})

const Sensor = mongoose.model('Sensor', SensorSchema)

// API - lưu dữ liệu cảm biến
app.post('/api/sensors', async (req, res) => {
  try {
    const newSensor = new Sensor(req.body)
    await newSensor.save()
    res.status(201).send('Sensor data saved!')
  } catch (err) {
    res.status(500).send(err)
  }
})

// API - lấy dữ liệu cảm biến
app.get('/api/sensors', async (req, res) => {
  const sensors = await Sensor.find().sort({ timestamp: -1 }).limit(50)
  res.json(sensors)
})

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
