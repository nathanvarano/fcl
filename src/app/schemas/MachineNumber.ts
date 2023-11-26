import { z } from "zod";

// Todo: Actual machine number
export const machineNumber = z.object({
    model: z.string(),
    date: z.date(),
    quantity: z.number().int(),
    license: z.number().int().optional(),
    comment: z.string().optional(),
    serial_number: z.string(),
});

export type machineNumberType = z.infer<typeof machineNumber>;