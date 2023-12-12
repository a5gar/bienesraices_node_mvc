import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'Oskar',
        email: 'correo@correo.com',
        confirmado: 1,
        password: bcrypt.hashSync('123456', 10)
    }
]

export default usuarios