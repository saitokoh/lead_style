const express = require('express')
const session = require('express-session');
require('dotenv').config();
const app = express()
const port = 3000
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.get('/', async (req, res) => {
  res.send("hello world!")
  console.log("sessionId", req.sessionID)
})

app.get('/lead-style', async (req, res) => {
  res.sendFile(__dirname + '/view/lead_style.html')
})

app.get('/bubble-chart', async (req, res) => {
  res.sendFile(__dirname + '/view/bubble_chart.html')
})

app.get('/api/init', async (req, res) => {
  const sessionID = req.sessionID

  const leadStyle = await prisma.leadStyles.findFirst({
    select: {
      a: true,
      b: true,
      c: true,
      d: true,
      result: true,
      x: true,
      y: true
    },
    where: {
      sessionId: sessionID
    }
  })
  res.json(leadStyle)

})

app.post('/api/diagnose', async (req, res) => {
  const answer = req.body.answer
  const sessionID = req.sessionID

  const leadStyle = await prisma.leadStyles.findFirst({
    where: {
      sessionId: sessionID
    }
  })

  if (leadStyle) {
    return res.status(409).send('診断済み');
  }

  const coordinate = objToCoordinate(answer)
  const result = {
    a: answer.A || 0,
    b: answer.B || 0,
    c: answer.C || 0,
    d: answer.D || 0,
    result: coordinate.result,
    x: coordinate.x,
    y: coordinate.y
  }

  await prisma.leadStyles.create({
    data: {
      ...result,
      sessionId: sessionID,
      }
  })

  res.json(result)
})

app.get('/api/result/all/bubble', async (req, res) => {
  const tick = 5
  const leadStyles = await prisma.leadStyles.findMany({
    where: {
      x: {not: null},
      y: {not: null},
    }
  })
  const datas = leadStyles.reduce((arr, ls) => {
    if (arr.some(value => value.x == ls.x && value.y == ls.y)) {
      const v = arr.find(value => value.x == ls.x && value.y == ls.y)
      v.r += tick
    } else {
      arr.push({x: ls.x, y: ls.y, r: tick})
    }
    return arr
  },[])
  res.json({datas})
})

app.listen(port, () => {
  console.log(`example app listening on port ${port}`)
})

const objToCoordinate = obj => {
  let x = 0
  let y = 0

  // A
  x -= obj.A || 0
  y += obj.A || 0

  // B
  x += obj.B || 0
  y += obj.B || 0

  // C
  x -= obj.C || 0
  y -= obj.C || 0

  // D
  x += obj.D || 0
  y -= obj.D || 0


  result = [] 
  if (y > 0) {
    if (x <= 0) {
      result.push("ファシリテーター型")
    }
    if (x >= 0) {
      result.push("マエストロ型")
    }
  } else if (y < 0) {
    if (x <= 0) {
      result.push("ティーチャー型")
    }
    if (x >= 0) {
      result.push("コンサルタント型")
    }
  } else {
    if (x < 0) {
      result.push("ファシリテーター型")
      result.push("ティーチャー型")
    }
    if (x > 0) {
      result.push("マエストロ型")
      result.push("コンサルタント型")
    }
  }

  return {x, y, result: result.join(" × ")}
}