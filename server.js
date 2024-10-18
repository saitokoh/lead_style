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

app.get('/api/init', async (req, res) => {
  const sessionID = req.sessionID

  const leadStyle = await prisma.leadStyles.findFirst({
    select: {
      a: true,
      b: true,
      c: true,
      d: true,
      result: true,
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

  const styles = {
    A: "ファシリテーター型",
    B: "マエストロ型",
    C: "ティーチャー型",
    D: "コンサルタント型",
  }
  const max = Math.max(...Object.values(answer))
  const targetStyles = Object.keys(answer).filter(key => answer[key] == max).map(key => styles[key])
  
  const result = targetStyles.join(" × ")

  await prisma.leadStyles.create({
    data: {
      a: answer.A || 0,
      b: answer.B || 0,
      c: answer.C || 0,
      d: answer.D || 0,
      result: result,
      sessionId: sessionID
    }
  })

  res.json({
    a: answer.A || 0,
    b: answer.B || 0,
    c: answer.C || 0,
    d: answer.D || 0,
    result: result,
  })
})


app.listen(port, () => {
  console.log(`example app listening on port ${port}`)
})