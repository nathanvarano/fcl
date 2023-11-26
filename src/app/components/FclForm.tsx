"use client";

import { useForm } from "react-hook-form";
import { machineNumberType } from "../schemas/MachineNumber";
import { postBatchSubmission } from "../../../controllers/BatchSubmissionController";

export default function FclForm() {
    const form = useForm<machineNumberType>();
    const { register, handleSubmit } = form;

    const submitBatch = async (values: machineNumberType) => {
        // Todo: move formatting to backend (requires changing expected types)
        try {
            await postBatchSubmission({
                    model: values.model,
                    date: new Date(values.date),
                    quantity: parseInt('' + values.quantity),
                    serial_number: 'sn' + new Date().getTime(),
                    license: parseInt('' + values.license),
                    comment: values.comment
            });
            // Todo: Show success toast
        } catch (error) {
            // Todo: Replace with error toast
            console.log(error);
        }
    }

	return (
        <div id="fcl-batch-form" className="relative flex justify-center items-center w-full h-full bg-fcl-primary">
            <form onSubmit={handleSubmit(submitBatch)} className="rounded border border-fcl w-[600px] h-[500px] p-12">
                <h1> Batch Form </h1>
                <div className="flex flex-col gap-4 my-8">
                    <select defaultValue={"placeholder"} {...register("model")}>
                        <option value={"placeholder"} disabled hidden> Model </option>
                        <option value={"1"}> Model 1 </option>
                        <option value={"2"}> Model 2 </option>
                        <option value={"3"}> Model 3 </option>
                    </select>
                    <input type="date" {...register("date")}/>
                    <input type="number" placeholder="Quantity" min="0" step="1" {...register("quantity")}/>
                    <select defaultValue={"placeholder"} {...register("license")}>
                        <option value={"placeholder"} disabled hidden> License </option>
                        <option value={"0"}> 0 </option>
                        <option value={"1"}> 1 </option>
                        <option value={"2"}> 2 </option>
                        <option value={"3"}> 3 </option>
                        <option value={"4"}> 4 </option>
                        <option value={"5"}> 5 </option>
                        <option value={"6"}> 6 </option>
                        <option value={"7"}> 7 </option>
                        <option value={"8"}> 8 </option>
                        <option value={"9"}> 9 </option>
                    </select>
                    <input type="text" placeholder="Comment (Not required)" {...register("comment")}/>
                </div>
                <button className="bg-fcl-secondary rounded w-full"> Submit </button>
            </form>
        </div>
	)
}
