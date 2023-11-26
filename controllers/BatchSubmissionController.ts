"use server";

import prisma from "@/app/modules/db";
import { machineNumber, machineNumberType } from "@/app/schemas/MachineNumber";

export async function postBatchSubmission(data: machineNumberType) {
    const validation = machineNumber.safeParse(data);

    // // Todo: specific errors
    if (!validation.success) {
        throw new Error("Invalid data");
    }

    await prisma.batchSubmission.create({
        data: {
            model: data.model,
            date: data.date,
            quantity: data.quantity,
            license: data.license,
            comment: data.comment,
            serial_number: data.serial_number,
        }
    })
}