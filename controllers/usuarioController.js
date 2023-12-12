import {check, validationResult} from 'express-validator'; // CHECK revisa un campo específico y VALIDATIONRESULT mantiene o guarda el resultado de la validación
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import { generarJWT, generarId } from '../helpers/tokens.js';
import { emailRegistro, emailOlvidePassword } from '../helpers/email.js';


const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión', 
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {
    // Validacion
    await check('email').isEmail().withMessage('El Email es obligatorio').run(req)
    await check('password').notEmpty().withMessage('La Contraseña es Obligatoria').run(req)

    let resultado = validationResult(req)

    // Verificar que el resultado este vacío
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión', 
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const {email, password} = req.body

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario) {
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión', 
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario No Existe'}]
        })
    }

    // Comprobar si el usuario esta confirmado
    if(!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión', 
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu Cuenta No esta Confirmada'}]
        })
    }

    // Revisar el password
    if(!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión', 
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Password es Incorrecto'}]
        })
    }

    // Autenticar al usuario
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre});

    // Almacenar en un cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true,
        // sameSite: true
    }).redirect('/mis-propiedades')

}

const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

const formularioRegsistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {
    // Validación
    await check('nombre').notEmpty().withMessage('El Nombre es Obligatorio').run(req)
    await check('email').isEmail().withMessage('El Email no es válido').run(req)
    await check('password').isLength({min: 6}).withMessage('La Contraseña debe contener mínimo 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Las Contraseñas no coinciden').run(req)

    let resultado = validationResult(req)

    // Verificar que el resultado este vacío
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta', 
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        })
    }

    // Extraer los datos
    const {nombre, email, password} = req.body

    // Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({where: { email }})

    if(existeUsuario) {
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta', 
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario ya está Registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        })
    }

    // Almacenar un usuario
    const usuario = await Usuario.create({
        nombre, 
        email,
        password,
        token: generarId()
    });

    // Envia Email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })


    // Mostrar mensaje de confirmación
    res.render('templates/mensaje', {
        pagina: 'Cuenta creada Correctamente',
        mensaje: 'Hemos enviado un Email de confirmación, presiona en el enlace'
    });

}

// Funcion que comprueba una cuenta
const confirmar = async (req, res) => {

    const {token} = req.params;
    console.log(token)

    // Verificar si el toekn es válido
    const usuario = await Usuario.findOne({where: {token}});

    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intentalo de nuevo',
            error: true
        })
    }

    // Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmo correctamente'
    })

    
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Olvidé mi Contraseña',
        csrfToken: req.csrfToken()
    })
}

const resetPassword = async (req, res) => {
    // Validación
    await check('email').isEmail().withMessage('El Email no es válido').run(req)

    let resultado = validationResult(req)

    // Verificar que el resultado este vacío
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/olvide-password', {
            pagina: 'Olvidé mi Contraseña',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    // Buscar el usuario
    const {email} = req.body
    const usuario = await Usuario.findOne({where: {email}})

    if(!usuario) {
        return res.render('auth/olvide-password', {
            pagina: 'Olvidé mi Contraseña',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Email no pertenece a ningun usuario'}]
        })
    }

    // Generar un token
    usuario.token = generarId();
    await usuario.save();

    // Enviar un Email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    });

    // Renderizar un mensaje
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu Contraseña',
        mensaje: 'Hemos enviado un Email con las instrucciones'
    });
}

const comprobarToken = async (req, res) => {
    
    const {token} = req.params;
    const usuario = await Usuario.findOne({where: {token}})
    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu Password',
            mensaje: 'Hubo un error al validar tu información, inténtalo de nuevo',
            error: true
        })
    }

    // Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Reestablece tu Password',
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req, res) => {
    // Validar el password
    await check('password').isLength({min: 6}).withMessage('La Contraseña debe contener mínimo 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Las Contraseñas no coinciden').run(req)

    let resultado = validationResult(req)

    // Verificar que el resultado este vacío
    if(!resultado.isEmpty()) {
        // Errores
        return res.render('auth/reset-password', {
            pagina: 'Reestablece tu Password', 
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const {token} = req.params;
    const {password} = req.body;

    // Identificar quien hace el cambio
    const usuario = await Usuario.findOne({where: {token}})

    // Hashear el nuevo password 
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);

    // Eliminar el token
    usuario.token = null

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Contraseña Reestablecida',
        mensaje: 'Tu Contraseña se guardó correctamente'
    })
}

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegsistro,
    registrar,
    confirmar,
    formularioOlvidePassword, 
    resetPassword, 
    comprobarToken,
    nuevoPassword

}