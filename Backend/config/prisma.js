import {
    PrismaClient,
    DeliveryStatus,
    PaymentStatus,
    OrderType,
    Role,
} from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

export {
    prisma,
    DeliveryStatus,
    PaymentStatus,
    OrderType,
    Role,
};