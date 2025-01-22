import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
  }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        try {
          const result = await query(args);
          return result;
        } catch (error) {
          console.error(`Database operation failed:`, {
            operation,
            model,
            error,
          });
          throw error;
        }
      },
    },
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}