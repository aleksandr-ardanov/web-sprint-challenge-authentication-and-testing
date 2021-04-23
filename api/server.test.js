const { default: jwtDecode } = require('jwt-decode')
const request = require('supertest')
const db = require('../data/dbConfig')
const server = require ('./server')
const jokes = require('./jokes/jokes-data')

const peter = {username:"spiderman", password:"1234"}
const peterNoPass = {username:"spiderman"}
const peterNoName = {password:"1234"}
const peterWrongPass = {username:"spiderman", password:"58238"}
const tony = {username:"ironman", password:"54321"}
const hunter = {username:"good_hunter", password:"yharnam"}
const required = /username and password required/i
const inv = /invalid credentials/i

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db('users').truncate()
})
afterAll(async () => {
  await db.destroy()
})

test('sanity', () => {
  expect(true).not.toBe(false)
})

describe("server", () => {
  describe('[POST] api/auth/register', () => {
    it("[1] responds with the correct message if username already taken", async() => {
      await request(server).post('/api/auth/register').send(peter)
      const res = await request(server).post('/api/auth/register').send(peter)
      expect(res.body.message).toMatch(/username taken/i)
    })
    it("[2] responds with error if missed a password", async() => {
      const res = await request(server).post('/api/auth/register').send(peterNoPass)
      expect(res.body.message).toMatch(required)
    })
    it("[3] responds with error if missed a username" , async() => {
      const res = await request(server).post('/api/auth/register').send(peterNoName)
      expect(res.body.message).toMatch(required)
    })
    it("[4] responds with correct message if user registered" , async() => {
      const res = await request(server).post('/api/auth/register').send(peter)
      expect(res.body).toMatchObject({id:1,username:"spiderman"})
    })
    it("[5] responds with 201 if user registered" , async() => {
      const res = await request(server).post('/api/auth/register').send(peter)
      expect(res.status).toBe(201)
    })
  })
  describe('[POST] api/auth/login', () => {
    it("[6] responds with correct message and status if username doesn't exist", async() => {
      await request(server).post('/api/auth/register').send(peter)
      const res = await request(server).post('/api/auth/login').send(tony)
      expect(res.body.message).toMatch(inv)
      expect(res.status).toBe(401)
    })
    it("[7] responds with correct message and status if password not entered", async() => {
      await request(server).post('/api/auth/register').send(peter)
      const res = await request(server).post('/api/auth/login').send(peterNoPass)
      expect(res.body.message).toMatch(required)
      expect(res.status).toBe(401)
    })
    it("[8] responds with correct message and status if username not entered", async() => {
      await request(server).post('/api/auth/register').send(peter)
      const res = await request(server).post('/api/auth/login').send(peterNoName)
      expect(res.body.message).toMatch(required)
      expect(res.status).toBe(401)
    })
    it("[9] responds with correct response if successfully logged in", async() => {
      await request(server).post('/api/auth/register').send(hunter)
      const res = await request(server).post('/api/auth/login').send(hunter)
       expect(res.status).toBe(200)
       expect(res.body.message).toMatch(/welcome home good_hunter/i)
    })
    it("[10] responds with correct message if wrong password entered", async() => {
      await request(server).post('/api/auth/register').send(peter)
      const res = await request(server).post('/api/auth/login').send(peterWrongPass)
      expect(res.status).toBe(401)
      expect(res.body.message).toMatch(inv)
    })
    it("[11] responds with correct token if logged in successfully", async() => {
      await request(server).post('/api/auth/register').send(peter)
      let res = await request(server).post('/api/auth/login').send(peter)
      let decoded = jwtDecode(res.body.token)
      expect(decoded).toHaveProperty('iat')
      expect(decoded).toHaveProperty('exp')
      expect(decoded).toMatchObject({
        subject: 1,
        username: 'spiderman',
      })
      await request(server).post('/api/auth/register').send(tony)
      res = await request(server).post('/api/auth/login').send(tony)
      decoded = jwtDecode(res.body.token)
      expect(decoded).toHaveProperty('iat')
      expect(decoded).toHaveProperty('exp')
      expect(decoded).toMatchObject({
        subject: 2,
        username: 'ironman',
      })
    })
  })
  describe('[GET] api/jokes',() => {
    it("[12] responds with correct message and status in token missed",async () => {
     const res = await request(server).get('/api/jokes')
     expect(res.status).toBe(401)
     expect(res.body.message).toMatch(/token required/i)
    })
    it("[13] responds with correct message and status if token expired or incorrect",async () => {
      const res = await request(server).get('/api/jokes').set('Authorization', 'foobar')
      expect(res.status).toBe(401)
      expect(res.body.message).toMatch(/token invalid/i)
    })
    it("[14] responds with list of jokes if token is correct", async() => {
      await request(server).post('/api/auth/register').send(peter)
      let res = await request(server).post('/api/auth/login').send(peter)
      const token = res.body.token
      res = await request(server).get('/api/jokes').set('Authorization', token)
      expect(res.body).toHaveLength(3)
      expect(res.body).toMatchObject(jokes)
      expect(res.status).toBe(200)
    })
  })
})