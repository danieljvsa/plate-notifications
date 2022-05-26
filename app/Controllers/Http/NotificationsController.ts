import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Notification from 'App/Models/Notification'

export default class NotificationsController {
    async index({response, auth}: HttpContextContract){
        let notifications = await Notification.query().where('user_id', '=', auth.user!.user_id)

        return response.status(200).send(notifications)
    }
    async destroy({params, response, auth}: HttpContextContract) {
        const notification = await Notification.findByOrFail('id', params.id)

        if(notification.user_id == auth.user!.user_id){
            notification.delete()
        }
        //await plate.delete()
        //console.log(notification)
        
        return response.status(200).send('Notification deleted.')
    }
}
