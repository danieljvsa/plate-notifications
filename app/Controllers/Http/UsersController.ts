import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Plate from 'App/Models/Plate'
import User from '../../Models/User'
import crypto from 'crypto'
import Notification from 'App/Models/Notification'
import Mail from '@ioc:Adonis/Addons/Mail'
import argon2 from 'phc-argon2'
import axios from 'axios'

export default class UsersController {
    async register({request, response, auth}: HttpContextContract){
        
        const data = request.only(['email', 'password'])
    
        const user = await User.create(data)
        const token = await auth.use('api').attempt(data.email, data.password)
        return response.status(200).json({token: token, user: user})
        
    }
    
    async authenticate({request, auth, response}){
      const {email, password} = request.all()
  
      const token = await auth.use('api').attempt(email, password)
      const user = await User.findBy('email', email)
  
      return response.status(200).json({token: token, user: user})
    }

    async createToken({request, response}: HttpContextContract){
      const {plate} = request.all()
      let plate_id = 0
      let user_id = 0

      await Plate.findBy('plate_number', plate).then((data) => {
        console.log(data?.plate_id)
        if(data != null){
          plate_id = data.plate_id
          user_id = data.user_id
        }else{
          response.status(401).send('Plate not found')
        }
      })
      console.log(plate_id + " " + user_id)
      if(plate_id > 0 && user_id > 0){
        const token = crypto.randomBytes(64).toString('hex')
        const user = await User.findBy('user_id', user_id)
        if(user != null){
          user.remember_me_token = token
          user.save()
          Mail.send((message) => {
           message.from("danielviana18@gmail.com").to(user.email).subject('New entry in yout garage!').htmlView('emails/notification', { token: token })
          })
          //console.log(plate + " " + user_id + " "+ token)
          await Notification.create({ token: token, message: `${plate}`, user_id: user.user_id})
          return response.status(200).send({ message: `${plate}`})
            
          
        }else{
          response.status(401).send('User not found')
        }
        
      }           
      
    }
    
    async authenticateToken({request, response, auth}: HttpContextContract) {
      const {password, token} = request.all()
      
      const user = await User.findBy('email', auth.user?.email)
      const validPassword = await argon2.verify(user?.password, password);
      console.log(validPassword)
      if(validPassword == true && token == auth.user?.remember_me_token){
        const result = await axios.get(`http://${process.env.PI_ADDRESS}/led`)
        console.log(result)
        response.status(200).send('Authorized')
      }else{
        response.status(400).send('Unauthorized')
      }
    }
    
}
