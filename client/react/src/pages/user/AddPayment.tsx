import { useState } from "react";
import {handleAddPayment} from "../../api";

export default function AddPayment() {
    const [paymentNumber, setPaymentNumber] = useState("");

    const handleSubmit = async () => {
        await handleAddPayment({paymentNumber});
        setPaymentNumber("");
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200">
            <form
                className="flex flex-col gap-4 w-full max-w-[350px] bg-base-100 p-6 rounded-lg shadow"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <label className="font-semibold text-lg text-center">Add Payment</label>

                <input
                    type="text"
                    placeholder="Payment Number"
                    className="input input-bordered w-full"
                    value={paymentNumber}
                    onChange={(e) => setPaymentNumber(e.target.value)}
                />

                <button type="submit" className="btn btn-primary w-full mt-2">
                    Submit
                </button>
            </form>
        </div>
    );
}
