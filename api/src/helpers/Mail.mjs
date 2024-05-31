import dotenv from 'dotenv'
import sgMail from '@sendgrid/mail'
dotenv.config();

const SENDGRID_API_KEY = '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'

const emptyPoints = `
    <body style="width: 95%;  text-align: center; background: #eee; padding: 80px 20px; font-family: 'Changa', sans-serif;">
        <div style="width: 80%; margin: 20px auto; background: #fff; padding: 20px; direction: rtl;">
            <img src="https://qafilaty.com/logo.png" alt="" width="100px">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Changa:wght@300&display=swap" rel="stylesheet">
            <h3 style="text-align: center;  margin: 20px auto 30px;" >إشعار بنفاذ نقاط حساب الشركة</h3>
            <hr/>
            <p style="font-size: 16px; margin-bottom: 10px;" >لقد نفذ رصيد شركتك يرجى اعادة شحن النقاط من جديد.</p>
            <i style="font-size: 16px; margin-bottom: 10px;">
                    سيتم منحك مدة <mark style="background: transparent; color: red; margin: auto 5px;"> 4 ايام </mark> استهلاك نقاط.
                    <b>بعد هذا الوقت سوف يتم توقيف حساب الشركة حتى سداد الديون</b>
                    
            </i><br/>
            <p style="font-size: 14px;" >خلال فترة ال 4 ايام يمكنك العمل بشكل طبيعي والنقاط تحسب على شكل ديون</p>
            <p style="font-size: 14px;" >سداد الديون بدون ضرائب او تعويض</p>
            <p style="font-size: 14px;" >يمكن للمستلمين تتبع حالة طرودهم حتى في حال توقف حساب الشركة من خلال منصتنا.</p>
            <p style="font-size: 14px;" >قم بتسجيل الدخول وشحن حساب شركتك</p>
            <a href="https://admin.qafilaty.com/signin/" style="background-color: #7d749e; color: #fff; padding: 10px 25px; font-size: 15px; text-decoration: none; display: block; width: 90px; margin: 20px auto;" >تسجيل الدخول</a>
        </div>
    </body>
`;

const managerVerificationMail = (token) => {
    return `
        <body style="width: 90%;  text-align: center; background: #eee; padding: 80px 20px; font-family: 'Changa', sans-serif;">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Changa:wght@300&display=swap" rel="stylesheet">
            <h1 style="text-align: center;  margin: 50px auto 30px;" >التحقق من البريد الالكتروني</h1>
            <h5 style="font-size: 18px; margin-bottom: 50px;" >اضغط على زر تحقق للتحقق من انك انت صاحب الحساب</h5>
            <a href="https://qafilaty.com/#/accounts/verification/${token}" style="background-color: #3b49df; color: #fff; padding: 10px 45px; font-size: 20px; text-decoration: none;" class="btn">تحقق</a>
        </body>
    `
}

const forgetPasswordManager = (token) => {
    return `
        <body style="width: 90%;  text-align: center; background: #eee; padding: 80px 20px; font-family: 'Changa', sans-serif;">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Changa:wght@300&display=swap" rel="stylesheet">
            <h1 style="text-align: center;  margin: 50px auto 30px;" >تغيير كلمة المرور</h1>
            <h5 style="font-size: 18px; margin-bottom: 50px;" >اضغط على زر تغيير كلمة المرور لتتمكن من إنشاء كلمة مرور جديدة</h5>
            <a href="https://qafilaty.com/#/accounts/changepassword/${token}" style="background-color: #7d749e; color: #fff; padding: 10px 45px; font-size: 20px; text-decoration: none;" class="btn">تغيير كلمة المرور</a>
        </body>
    `
}

const newUser = (data) => {
    return `
        <body style="width: 90%;  text-align: center; background: #eee; padding: 80px 20px; font-family: 'Changa', sans-serif;">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Changa:wght@300&display=swap" rel="stylesheet">
            <h1 style="text-align: right;  margin: 50px auto 20px;" >: شخص جديد قام بالتسجيل</h1>
            <p style="text-align: right;  margin: 8px auto;" ><b>اسم الشركة : </b>{data.companyName || ""}</p>
            <p style="text-align: right;  margin: 8px auto;" ><b>اسم المدير : </b>{data.admin || ""}</p>
            <p style="text-align: right;  margin: 8px auto;" ><b>رقم هاتف المدير : </b>{data.phone || ""}</p>
            <p style="text-align: right;  margin: 8px auto;" ><b>عنوان المدير : </b>{data.address || ""}</p>
            <h5 style="font-size: 18px; margin-bottom: 50px;" >تفقد لوحة التحكم لمعلومات اكثر</h5>
        </body>
    `
}

const createMailNewUser = async (data) => {
    try {
        sgMail.setApiKey(SENDGRID_API_KEY)

        const msg = {
            from: 'support@qafilaty.com', // Change to your verified sender
            to: "ali96info@gmail.com", // Change to your recipient
            subject: "new user regesterd",
            html: newUser(data)
        }

        sgMail.send(msg)
            .then(() => {
                console.log('Email sent', msg)
                return msg
            })
            .catch((error) => console.error(error))
    } catch (error) {
        console.error(error)
    }
};

const createEmptyPoints = async (mail) => {
    try {
        sgMail.setApiKey(SENDGRID_API_KEY)

        const msg = {
            from: 'support@qafilaty.com', // Change to your verified sender
            to: mail.to, // Change to your recipient
            subject: "Empty Points",
            html: emptyPoints
        }

        sgMail.send(msg)
            .then(() => console.log('Email sent', msg))
            .catch((error) => console.error(error))
    } catch (error) {
        console.error(error)
    }
};

/*const createMail = async (mail) => {
    try {
        let infoMail = {
            from: '"Qafilaty" <qafilaty@gmail.com>',
            to: mail.to,
            subject: mail.subject,
            //text: mail.text,
            html: mail.type === "Verification" ? managerVerificationMail(mail.token) : forgetPasswordManager(mail.token)
        }

        const transporterConfig = {
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "qafilaty@gmail.com",
                pass: "Hicham0675722241h@"
            }
        }

        let transporter = nodemailer.createTransport(transporterConfig)

        await transporter.sendMail(infoMail, (err, info) => {
            if(err) {
                console.error(err);
                return err
            }
            return info
        })
    } catch (error) {
        console.error(error)
    }
};*/

const createMail = async (mail) => {
    try {
        sgMail.setApiKey(SENDGRID_API_KEY)

        const msg = {
            to: mail.to, // Change to your recipient
            from: 'support@qafilaty.com', // Change to your verified sender
            subject: mail.subject,
            // text: '',
            html: mail.type === "Verification" ? managerVerificationMail(mail.token) : forgetPasswordManager(mail.token)
        }
        sgMail.send(msg)
            .then(() => console.log('Email sent', msg))
            .catch((error) => console.error(error))
    } catch (error) {
        console.error(error)
    }
};

export {
    createMail,
    createMailNewUser,
    createEmptyPoints
}