import Transport  from 'winston-transport'
// import nodemailer from 'nodemailer'
import sgMail from '@sendgrid/mail'

const SENDGRID_API_KEY = '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'

export default class WinstonNodemailer extends Transport {

    constructor(props){
        super(props)
        this.name = 'WinstonNodemailer'
        this.level = 'error'
    }

    log(info, next){
        setImmediate(() => this.sendMail(info));
    }

    sendMail(msg){
        const { message, level, service, timestamp } = msg
        try {
            sgMail.setApiKey(SENDGRID_API_KEY)
            const msg = {
                from: 'support@qafilaty.com', // Change to your verified sender
                to: "ali96info@gmail.com", // Change to your recipient
                subject: "new user regesterd",
                html:  `
                    <table style="width: 100%;">
                        <thead>
                            <th style="background: #f44336; padding: 10px; color: #fff; font-size: 18px;">${level.toUpperCase()}</th>
                        </thead>
                        <tbody>
                            <td style="background: #eee; padding: 20px 10px;">
                                <p style="background: #eee; color: #333; font-size: 16px; margin-bottom: 10px;"><b>file : </b>${message.file}</p><br/>
                                <p style="background: #eee; color: #333; font-size: 16px; margin-bottom: 10px;"><b>function : </b>${message.function}</p><br/>
                                <p style="background: #eee; color: #333; font-size: 16px; margin-bottom: 10px;"><b>error : </b>${message.error}</p><br/>
                                <p style="background: #eee; color: #333; font-size: 16px; margin-bottom: 10px;"><b>User : </b>${message.user || ""}</p><br/>
                                <p style="background: #eee; color: #333; font-size: 16px; margin-bottom: 10px;"><b>lines : </b>${message.lines}</p><br/>
                            </td>
                        </tbody>
                        <tfoot>
                            <td style="background: #c4c4c4; padding: 5px 10px; color: #333; font-size: 14px; text-align: center;">[ ${timestamp} ]</td>
                        </tfoot>
                    </table>
                `
            }

            sgMail.send(msg)
            .then(() => {
                console.log('Email sent', msg)
                return msg
            })
            .catch((error) => console.error(error))

        } catch(err) {
            this.emit('error', err)
        }
    }
}