import bcrypt from 'bcrypt';

const passwordPlano = '123456';
const saltRounds = 10;

const hash = await bcrypt.hash(passwordPlano, saltRounds);

console.log('Password:', passwordPlano);
console.log('Hash:', hash);
