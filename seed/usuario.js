import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'Diego',
        email: 'diego@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    },
    {
        nombre: 'Yeison',
        email: 'yeison@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    }
]

export default usuarios