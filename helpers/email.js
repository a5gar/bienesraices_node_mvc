import nodemailer from 'nodemailer';

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const {email, nombre, token} = datos

    // Enviar el email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu Cuenta de BienesRaices.com',
        text: 'Confirma tu Cuenta de BienesRaices.com',
        html: `
            <p>Hola ${nombre},</p>
            <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a></p>

            <p> Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    })

}

const emailOlvidePassword = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const {email, nombre, token} = datos

    // Enviar el email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Reestablece tu Contraseña en BienesRaices.com',
        text: 'Reestablece tu Contraseña en BienesRaices.com',
        html: `
            <p>Hola ${nombre}, has solicitado reestablecer tu contraseña en BienesRaices.com</p>
            <p>Sigue el siguiente enlace para generar una nueva contraseña:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestablecer Contraseña</a></p>

            <p> Si tu no solicitaste el cambio de contraseña, puedes ignorar el mensaje</p>
        `
    })

}


export {
    emailRegistro,
    emailOlvidePassword
}