import { useState } from "react";
import { apiService } from "../../api";
import { useToast } from "../../components/ToastProvider";

export default function AddPayment() {
    const [paymentNumber, setPaymentNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        const trimmed = paymentNumber.trim();
        if (!trimmed) {
            toast("Payment number is required", "error");
            return;
        }

        setLoading(true);
        try {
            await apiService.addPayment({ paymentNumber: trimmed });
            setPaymentNumber("");
            toast("Payment added successfully!", "success");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Something went wrong";
            toast(message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200 min-h-screen">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <h1 className="card-title text-2xl font-bold justify-center mb-6">
                        Add Payment
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset className="fieldset border border-base-300 rounded-lg p-6">
                            <legend className="fieldset-legend text-lg font-semibold px-2">
                                Payment Details
                            </legend>

                            <div className="space-y-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text font-medium">
                                            Payment Number
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        placeholder="1234567890"
                                        value={paymentNumber}
                                        onChange={(e) => setPaymentNumber(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading loading-dots loading-lg"></span>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}