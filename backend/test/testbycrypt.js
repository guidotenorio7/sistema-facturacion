import bcrypt from 'bcrypt';

const hash = "<pega aquí el valor exacto de hashedPassword de tu usuario en MongoDB>";

const run = async () => {
  const ok = await bcrypt.compare("admin123", hash);
  console.log("¿Coincide?:", ok);
};

run();
