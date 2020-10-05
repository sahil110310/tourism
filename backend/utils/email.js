  
const nodemailer=require('nodemailer');
const pug=require('pug');
const htmlToText=require('html-to-text');

module.exports=class Email{
    constructor(user,url){
        this.to=user.email,
        this.firstName=user.name.trim().split(' ')[0],
        this.url=url,
        this.from=`Poojan Savani <${process.env.EMAIL}>`
    }
    newTransport(){
        if(process.env.NODE_ENV==='production'){
            return nodemailer.createTransport({
                service:'SendGrid',
                auth:{
                    user:process.env.SENDGRID_USERNAME,
                    pass:process.env.SENDGRID_PASS
                }
            });
        }
        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }
         });
    }
    async send(templete,subject){

        //1) Render HTMl mail templete
        const html=pug.renderFile(`${__dirname}/../views/emails/${templete}.pug`,{
            firstName:this.firstName,
            url:this.url,
            subject
        })

        //2) Define the email options
        const mailOptions={
            from:this.from,
            to:this.to,
            subject,
            html,
            text:htmlToText.fromString(html)
        }

        //3)send mail using transpoter
        await this.newTransport().sendMail(mailOptions)

    }
    async sendWelcome(){
        await this.send('welcome','Welcome to the Natours Family')
    }
    async sendResetPassword(){
        await this.send('resetPassword','Your Reset Password Link {Valid For Only 10 Min.}')
    }

}