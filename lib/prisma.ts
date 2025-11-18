import { PrismaClient } from "@prisma/client";

declare global {

  // eslint-disable-next-line vars-on-top
  var prismaGlobal: PrismaClient | undefined;
}

function prismaClientSingleton() {
  return new PrismaClient();
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
