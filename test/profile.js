/* eslint handle-callback-err: "off"*/
process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')

const loginDetails = {
  email: 'admin@admin.com',
  password: '12345'
}
let token = ''

chai.use(chaiHttp)

describe('*********** PROFILE ***********', () => {
  describe('/POST login', () => {
    it('it should GET token', done => {
      chai
        .request(server)
        .post('/login')
        .send(loginDetails)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('token')
          token = res.body.token
          done()
        })
    })
  })
  describe('/GET profile', () => {
    it('it should not able to consume the route since no token was sent', done => {
      chai
        .request(server)
        .get('/profile')
        .end((err, res) => {
          res.should.have.status(401)
          done()
        })
    })
    it('it should GET profile', done => {
      chai
        .request(server)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.include.keys('name', 'email')
          done()
        })
    })
  })
  describe('/PATCH profile', () => {
    it('it should NOT UPDATE profile empty name/email', done => {
      const user = {}
      chai
        .request(server)
        .patch('/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422)
          res.body.should.be.an('object')
          res.body.should.have.property('errors')
          done()
        })
    })
    it('it should UPDATE profile', done => {
      const user = {
        name: 'Test123456',
        urlTwitter: 'https://hello.com',
        urlGitHub: 'https://hello.io',
        phone: '123123123',
        city: 'HCM',
        country: 'VietNam'
      }
      chai
        .request(server)
        .patch('/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(user)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('name').eql('Test123456')
          res.body.should.have.property('urlTwitter').eql('https://hello.com')
          res.body.should.have.property('urlGitHub').eql('https://hello.io')
          res.body.should.have.property('phone').eql('123123123')
          res.body.should.have.property('city').eql('HCM')
          res.body.should.have.property('country').eql('VietNam')
          done()
        })
    })
    // it('it should NOT UPDATE profile with email already exists', done => {})
  })
  describe('/POST profile/changePassword', () => {
    it('it should NOT change password', done => {
      const data = {
        oldPassword: '123456',
        newPassword: '123456'
      }
      chai
        .request(server)
        .post('/profile/changePassword')
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(409)
          res.body.should.be.an('object')
          res.body.should.have.property('errors')
            .that.has.property('msg')
            .eql('WRONG_PASSWORD')
          done()
        })
    })
    it('it should change password', done => {
      const data = {
        oldPassword: '12345',
        newPassword: '12345'
      }
      chai
        .request(server)
        .post('/profile/changePassword')
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('msg').eql('PASSWORD_CHANGED')
          done()
        })
    })
  })
})
